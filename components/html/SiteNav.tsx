"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useJourney } from "@/lib/store";
import { profile } from "@/content/profile";
import { skillsPage } from "@/content/skills";

// `wide`: hidden on phones, where only six items fit in one row (the section is still a scroll away).
const items = [
  { id: "experience", label: "Experience" },
  { id: "hackathons", label: "Hackathons" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
  { id: "community", label: "Community", wide: true },
  { id: "education", label: "Education", wide: true },
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
            <li key={item.id} className={"wide" in item && item.wide ? "nav-wide" : undefined}>
              <Link
                href={`${prefix}#${item.id}`}
                aria-current={onHome && current === item.id ? "true" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* Routes and files, not scroll stops: kept apart from the section items above. */}
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
