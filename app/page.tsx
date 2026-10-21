import Link from "next/link";
import { profile, siteUrl, type LinkItem, type TimelineItem } from "@/content/profile";
import { projects } from "@/content/projects";
import { openSource } from "@/content/openSource";
import { skillsPage } from "@/content/skills";
import { SiteNav } from "@/components/html/SiteNav";
import { ScrollDriver } from "@/components/html/ScrollDriver";
import { ProjectCard } from "@/components/html/ProjectCard";
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
            {item.note ? (
              <p className="timeline-note">
                {profile.contact.cv ? <a href={profile.contact.cv}>{item.note}</a> : item.note}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Home() {
  const { about, contact } = profile;
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
              <Link className="button button-primary" href="#projects">
                View projects <span aria-hidden="true">→</span>
              </Link>
              <Link className="button" href="#contact">
                Get in touch
              </Link>
            </div>
          </div>
          <p className="scroll-cue" aria-hidden="true">
            <span /> Scroll to walk
          </p>
        </section>

        <section id="about" className="station" data-stop="about" aria-labelledby="about-h">
          <div className="copy">
            <p className="eyebrow">01 — About</p>
            <h2 id="about-h">{about.headline}</h2>
            {about.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="about-photo" src={about.photo} alt={`Portrait of ${profile.name}`} width={96} height={96} />
            ) : null}
            {about.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {about.facts.length ? (
              <dl className="facts">
                {about.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {profile.talks.length ? (
              <ul className="talks" aria-label="Talks">
                {profile.talks.map((talk) => (
                  <li key={talk.href}>
                    <a href={talk.href} target="_blank" rel="noreferrer">
                      <span className="timeline-period">{talk.period}</span>
                      <span>
                        {talk.title} <span className="timeline-place">· {talk.place}</span>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section id="education" className="station" data-stop="education" aria-labelledby="education-h">
          <div className="copy">
            <p className="eyebrow">02 — Education &amp; Honors</p>
            <h2 id="education-h">Math first, then code.</h2>
            <Timeline items={profile.education} />
            <Timeline items={profile.honors} compact />
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-h">
          <div className="station" data-stop="projects">
            <div className="copy">
              <p className="eyebrow">03 — Projects</p>
              <h2 id="projects-h">Selected work</h2>
              <p>Three gateways, each with proof you can open: the repository, the PRs, the result.</p>
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

        <section id="open-source" className="station" data-stop="open-source" aria-labelledby="open-source-h">
          <div className="copy">
            <p className="eyebrow">04 — Open source</p>
            <h2 id="open-source-h">Fixes sent upstream.</h2>
            <ul className="oss-list">
              {openSource.map((item) => (
                <li key={item.project}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    <span className="oss-project">{item.project}</span>
                    <span className="oss-count">{item.count}</span>
                    <span className="oss-what">{item.what}</span>
                  </a>
                </li>
              ))}
            </ul>
            {profile.writing ? (
              <p className="section-more">
                <a className="next-link" href={profile.writing}>
                  How the bugs were found, in writing <span aria-hidden="true">→</span>
                </a>
              </p>
            ) : null}
          </div>
        </section>

        <section id="experience" className="station" data-stop="experience" aria-labelledby="experience-h">
          <div className="copy">
            <p className="eyebrow">05 — Experience</p>
            <h2 id="experience-h">Experience</h2>
            <Timeline items={profile.experience} />
            {profile.contact.cv ? (
              <p className="section-more">
                <a className="next-link" href={profile.contact.cv}>
                  Full CV, with numbers <span aria-hidden="true">↓</span>
                </a>
              </p>
            ) : null}
          </div>
        </section>

        <section id="contact" className="station" data-stop="contact" aria-labelledby="contact-h">
          <div className="copy">
            <p className="eyebrow">06 — Contact</p>
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
