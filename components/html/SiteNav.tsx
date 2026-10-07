"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useJourney } from "@/lib/store";
import { profile } from "@/content/profile";
import { skillsPage } from "@/content/skills";

const items = [
  { id: "about", label: "About" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/** Persistent navigation. Plain anchors: works before, during and without WebGL. */
export function SiteNav({ onHome = false }: { onHome?: boolean }) {
  const section = useJourney((s) => s.section);
  const current = section.startsWith("project-") ? "projects" : section;
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
          {/* A route, not a scroll stop: kept apart from the section items above. */}
          <li>
            <Link href={skillsPage.path} aria-current={pathname === skillsPage.path ? "page" : undefined}>
              {skillsPage.label}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
