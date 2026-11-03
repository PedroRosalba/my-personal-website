"use client";

import Link from "next/link";
import type { Project } from "@/content/projects";
import { postHref } from "@/content/writing";
import { useJourney } from "@/lib/store";
import { FocusList } from "./FocusList";
import { Snapshot } from "./Snapshot";

/** HTML twin of a 3D gateway: same URL, and hover/focus lights the gateway seam. */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const set = useJourney((s) => s.set);
  const on = () => set({ hoverProject: project.slug });
  const off = () => set({ hoverProject: null });
  const image = project.image;
  return (
    <article className="project-card" aria-labelledby={`card-${project.slug}`}>
      <p className="eyebrow">Project {String(index + 1).padStart(2, "0")}</p>
      <h3 id={`card-${project.slug}`} className="card-title">
        {project.title}
      </h3>
      <p className="card-outcome">{project.tagline}</p>
      {image ? <Snapshot src={image.src} alt={image.alt} href={image.post ? postHref(image.post) : (image.href ?? null)} /> : null}
      <p className="eyebrow focus-label">Focused on</p>
      <FocusList project={project} />
      <Link
        className="button button-primary"
        href={`/projects/${project.slug}`}
        scroll={false}
        onMouseEnter={on}
        onMouseLeave={off}
        onFocus={on}
        onBlur={off}
      >
        Open project <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
