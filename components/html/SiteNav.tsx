"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useJourney } from "@/lib/store";
import { profile } from "@/content/profile";
import { skillsPage } from "@/content/skills";

const items = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "media", label: "Talks" },
  { id: "contact", label: "Contact" },
];

/** Persistent navigation. Plain anchors: works before, during and without WebGL. */
export function SiteNav({ onHome = false }: { onHome?: boolean }) {
  const section = useJourney((s) => s.section);
  const current = section.startsWith("project-")
    ? "projects"
    : section.startsWith("experience-")
      ? "experience"
      : section;
  const prefix = onHome ? "" : "/";
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="site-name" href={onHome ? "#top" : "/"}>
        {profile.name}
      </Link>
      <nav aria-label="Primary">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`${prefix}#${item.id}`}
                aria-current={onHome && current === item.id ? "true" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* Routes and files, not scroll stops: kept apart from the section items above. */}
          {profile.writing ? (
            <li className="nav-wide nav-route">
              <a href={profile.writing}>Writing</a>
            </li>
          ) : null}
          <li className="nav-wide nav-route">
            <Link href={skillsPage.path} aria-current={pathname === skillsPage.path ? "page" : undefined}>
              {skillsPage.label}
            </Link>
          </li>
          {profile.contact.cv ? (
            <li className="nav-route">
              <a href={profile.contact.cv}>CV</a>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}
