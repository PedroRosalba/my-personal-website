import Link from "next/link";
import type { Project } from "@/content/projects";
import { postHref } from "@/content/writing";
import { YouTubeClip } from "./YouTubeClip";
import { FocusList } from "./FocusList";
import { Snapshot } from "./Snapshot";

/** The one project presentation, shared by the panel and the standalone page. */
export function ProjectArticle({
  project,
  index,
  total,
  next,
  headingLevel: Heading,
}: {
  project: Project;
  index: number;
  total: number;
  next: Project;
  headingLevel: "h1" | "h2";
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <article className="project-article" aria-labelledby={`project-title-${project.slug}`}>
      <p className="eyebrow">
        Project {pad(index + 1)} / {pad(total)}
      </p>
      <Heading id={`project-title-${project.slug}`} className="project-title">
        {project.title}
      </Heading>
      <p className="project-outcome">{project.outcome}</p>

      {project.video ? (
        <video className="project-video" src={project.video} controls preload="metadata" playsInline />
      ) : project.youtube ? (
        <YouTubeClip clip={project.youtube} title={project.title} language={project.youtube.language} />
      ) : project.image ? (
        <Snapshot
          src={project.image.src}
          alt={project.image.alt}
          href={project.image.post ? postHref(project.image.post) : (project.image.href ?? null)}
        />
      ) : null}

      <dl className="project-meta">
        <div>
          <dt>Role</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{project.year}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{project.stack.join(" · ")}</dd>
        </div>
      </dl>

      <h3 className="eyebrow">Focused on</h3>
      <FocusList project={project} />

      <h3 className="eyebrow">Technical highlights</h3>
      <ul className="project-highlights">
        {project.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <div className="project-actions">
        {project.links.map((link, i) => (
          <a
            key={link.href}
            className={i === 0 ? "button button-primary" : "button"}
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.label} <span aria-hidden="true">↗</span>
          </a>
        ))}
        <Link className="next-link" href={`/projects/${next.slug}`} replace scroll={false}>
          Next: {next.title} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
