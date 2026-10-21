import Link from "next/link";
import { profile, siteUrl, type LinkItem, type TimelineItem } from "@/content/profile";
import { projects } from "@/content/projects";
import { featuredRoles, earlierRoles, type Role } from "@/content/experience";
import { media, writing } from "@/content/media";
import { skillsPage } from "@/content/skills";
import { SiteNav } from "@/components/html/SiteNav";
import { ScrollDriver } from "@/components/html/ScrollDriver";
import { ProjectCard } from "@/components/html/ProjectCard";
import { YouTubeClip } from "@/components/html/YouTubeClip";
import { JsonLd } from "@/components/html/JsonLd";
import { SceneLoader } from "@/components/scene/SceneLoader";

function ProofLinks({ links }: { links: LinkItem[] }) {
  return (
    <ul className="proof">
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noreferrer">
            {link.label} <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Timeline({ items, compact = false }: { items: TimelineItem[]; compact?: boolean }) {
  return (
    <ol className={compact ? "timeline timeline-compact" : "timeline"}>
      {items.map((item) => (
        <li key={`${item.title}-${item.period}`}>
          <p className="timeline-period">{item.period}</p>
          <div>
            <h3 className="timeline-title">
              {item.title}
              {compact ? null : <span className="timeline-place"> · {item.place}</span>}
            </h3>
            {item.detail ? <p className="timeline-detail">{item.detail}</p> : null}
            {item.proof?.length ? <ProofLinks links={item.proof} /> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Company({ role }: { role: Role }) {
  return role.href ? (
    <a href={role.href} target="_blank" rel="noreferrer">
      {role.company}
    </a>
  ) : (
    <>{role.company}</>
  );
}

function RoleStation({ role, index }: { role: Role; index: number }) {
  const cv = profile.contact.cv;
  return (
    <div className="station" data-stop={`experience-${role.slug}`}>
      <div className="copy role">
        {index === 0 ? (
          <>
            <p className="eyebrow">01 — Experience</p>
            <h2 id="experience-h">Production experience</h2>
          </>
        ) : null}
        <div className="role-head">
          <p className="timeline-period">{role.period}</p>
          <h3 className="role-title">
            {role.role} · <Company role={role} />
          </h3>
          <p className="role-summary">{role.summary}</p>
        </div>
        <ul className="project-highlights">
          {role.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="card-stack">{role.stack.join(" · ")}</p>
        {role.proof.length ? <ProofLinks links={role.proof} /> : null}
        {role.note ? (
          <p className="timeline-note">{cv ? <a href={cv}>{role.note}</a> : role.note}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  const { contact } = profile;
  return (
    <>
      {/* Static world: visible before WebGL loads and when it is unavailable. */}
      <div className="backdrop" aria-hidden="true" />
      <SceneLoader />
      <div className="scrim" aria-hidden="true" />
      <ScrollDriver />
      <SiteNav onHome />

      <main id="top">
        <section className="station hero" data-stop="top" aria-labelledby="hero-name">
          <div className="copy">
            <p className="eyebrow">{profile.role}</p>
            <h1 id="hero-name">{profile.name}</h1>
            <p className="lead">{profile.positioning}</p>
            <div className="actions">
              <Link className="button button-primary" href="#experience">
                See the work <span aria-hidden="true">→</span>
              </Link>
              {contact.cv ? (
                <a className="button" href={contact.cv}>
                  CV <span aria-hidden="true">↓</span>
                </a>
              ) : null}
            </div>
          </div>
          <p className="scroll-cue" aria-hidden="true">
            <span /> Scroll to walk
          </p>
        </section>

        <section id="experience" aria-labelledby="experience-h">
          {featuredRoles.map((role, i) => (
            <RoleStation role={role} index={i} key={role.slug} />
          ))}
          <div className="station" data-stop="experience-earlier">
            <div className="copy">
              <p className="eyebrow">Earlier</p>
              <ol className="timeline">
                {earlierRoles.map((role) => (
                  <li key={role.slug}>
                    <p className="timeline-period">{role.period}</p>
                    <div>
                      <h3 className="timeline-title">
                        {role.role}
                        <span className="timeline-place">
                          {" "}
                          · <Company role={role} />
                        </span>
                      </h3>
                      {role.summary ? <p className="timeline-detail">{role.summary}</p> : null}
                      {role.proof.length ? <ProofLinks links={role.proof} /> : null}
                    </div>
                  </li>
                ))}
              </ol>
              {contact.cv ? (
                <p className="section-more">
                  <a className="next-link" href={contact.cv}>
                    Full CV, with numbers <span aria-hidden="true">↓</span>
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-h">
          <div className="station" data-stop="projects">
            <div className="copy">
              <p className="eyebrow">02 — Projects</p>
              <h2 id="projects-h">Open source, upstream</h2>
              <p>An agent platform I help maintain, and fixes sent to the tools I build on. Open one for the PRs.</p>
              <ol className="project-index">
                {projects.map((p, i) => (
                  <li key={p.slug}>
                    <Link href={`/projects/${p.slug}`} scroll={false}>
                      <span className="index-number">{String(i + 1).padStart(2, "0")}</span>
                      <span className="index-title">{p.title}</span>
                      <span className="index-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="skills-teaser">
                <Link className="next-link" href={skillsPage.path}>
                  {skillsPage.teaser} <span aria-hidden="true">→</span>
                </Link>
              </p>
            </div>
          </div>
          {projects.map((p, i) => (
            <div className="station" data-stop={`project-${p.slug}`} key={p.slug}>
              <div className="copy">
                <ProjectCard project={p} index={i} />
              </div>
            </div>
          ))}
        </section>

        <section id="education" className="station" data-stop="education" aria-labelledby="education-h">
          <div className="copy">
            <p className="eyebrow">03 — Education &amp; Honors</p>
            <h2 id="education-h">Math first, then code.</h2>
            <Timeline items={profile.education} />
            <Timeline items={profile.honors} compact />
          </div>
        </section>

        <section id="media" className="station" data-stop="media" aria-labelledby="media-h">
          <div className="copy">
            <p className="eyebrow">04 — Talks &amp; writing</p>
            <h2 id="media-h">On stage and in writing.</h2>
            <ul className="talks" aria-label="Talks and podcasts">
              {media.map((item) => (
                <li key={item.href}>
                  {item.youtube ? (
                    <YouTubeClip clip={item.youtube} title={item.title} language={item.language} />
                  ) : null}
                  <a href={item.href} target="_blank" rel="noreferrer">
                    <span className="timeline-period">{item.period}</span>
                    <span>
                      {item.title} <span className="timeline-place">· {item.where}</span>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
            {writing.length ? (
              <>
                <h3 className="eyebrow media-sub">Selected writing</h3>
                <ul className="talks" aria-label="Selected writing">
                  {writing.map((post) => (
                    <li key={post.slug}>
                      <a href={post.href}>
                        <span className="timeline-period">{post.series}</span>
                        <span>{post.title}</span>
                        <span aria-hidden="true">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="section-more">
                  <a className="next-link" href={profile.writing!}>
                    All writing <span aria-hidden="true">→</span>
                  </a>
                </p>
              </>
            ) : null}
          </div>
        </section>

        <section id="contact" className="station" data-stop="contact" aria-labelledby="contact-h">
          <div className="copy">
            <p className="eyebrow">05 — Contact</p>
            <h2 id="contact-h" className="contact-title">
              Get in touch
            </h2>
            <p className="lead">{contact.line}</p>
            {contact.email ? (
              <a className="contact-email" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            ) : null}
            <div className="actions">
              {contact.links.map((link) => (
                <a key={link.href} className="button" href={link.href} target="_blank" rel="noreferrer me">
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
              {contact.cv ? (
                <a className="button" href={contact.cv}>
                  Download CV <span aria-hidden="true">↓</span>
                </a>
              ) : null}
              {profile.writing ? (
                <a className="button" href={profile.writing}>
                  Writing <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </div>
          <footer className="site-footer">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <Link href="#top">Back to top ↑</Link>
          </footer>
        </section>
      </main>

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.name,
            url: siteUrl,
            description: profile.positioning,
            jobTitle: "Software Engineer",
            email: contact.email ? `mailto:${contact.email}` : undefined,
            alumniOf: { "@type": "CollegeOrUniversity", name: "IMPA Tech" },
            knowsAbout: ["Rust", "TypeScript", "Payments", "Zero-knowledge proofs", "AI agents", "Build systems"],
            sameAs: contact.links.map((l) => l.href),
          },
          { "@context": "https://schema.org", "@type": "WebSite", name: profile.name, url: siteUrl },
        ]}
      />
    </>
  );
}
