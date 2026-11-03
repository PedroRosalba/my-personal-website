import type { Project } from "@/content/projects";
import { focusLinks } from "@/content/projects";

/** "Focused on …": each area links to its write-up when one is public, and reads as plain text otherwise. */
export function FocusList({ project }: { project: Project }) {
  return (
    <ul className="focus">
      {focusLinks(project).map((f) => (
        <li key={f.label}>
          {f.href ? (
            <a href={f.href} title="Read the write-up">
              {f.label} <span aria-hidden="true">→</span>
            </a>
          ) : (
            <span>{f.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
