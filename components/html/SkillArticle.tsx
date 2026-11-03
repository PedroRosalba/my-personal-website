import { invokeNotes, type Skill } from "@/content/skills";

/** One skill, in the same visual language as ProjectArticle. */
export function SkillArticle({ skill, index, total }: { skill: Skill; index: number; total: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <article className="project-article skill-article" aria-labelledby={`skill-title-${skill.slug}`}>
      <p className="eyebrow">
        Skill {pad(index + 1)} / {pad(total)} · {skill.kind}
      </p>
      <h2 id={`skill-title-${skill.slug}`} className="project-title">
        {skill.title}
      </h2>
      <p className="project-outcome">{skill.summary}</p>

      <h3 className="eyebrow">How it works</h3>
      <ul className="project-highlights">
        {skill.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      {skill.invoke.length ? (
        <>
          <h3 className="eyebrow">Try it</h3>
          <pre className="code-block">
            <code>
              {skill.invoke.map((cmd) => (
                <span className="code-line" key={cmd}>
                  {cmd}
                  {invokeNotes[cmd] ? <span className="code-comment">  # {invokeNotes[cmd]}</span> : null}
                </span>
              ))}
            </code>
          </pre>
        </>
      ) : null}

      <div className="project-actions">
        {skill.links.map((link, i) => (
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
      </div>
    </article>
  );
}
