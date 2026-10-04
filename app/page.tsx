import Link from "next/link";
import { profile, siteUrl, type TimelineItem } from "@/content/profile";
import { projects } from "@/content/projects";
import { SiteNav } from "@/components/html/SiteNav";
import { ScrollDriver } from "@/components/html/ScrollDriver";
import { ProjectCard } from "@/components/html/ProjectCard";
import { JsonLd } from "@/components/html/JsonLd";
import { SceneLoader } from "@/components/scene/SceneLoader";

function Timeline({ items, empty }: { items: TimelineItem[]; empty: string }) {
  if (!items.length) return <p className="muted">{empty}</p>;
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={`${item.title}-${item.period}`}>
          <p className="timeline-period">{item.period}</p>
          <h3 className="timeline-title">{item.title}</h3>
          <p className="timeline-place">{item.place}</p>
          {item.detail ? <p className="timeline-detail">{item.detail}</p> : null}
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
              <a className="button button-primary" href="#projects">
                View projects <span aria-hidden="true">→</span>
              </a>
              <a className="button" href="#contact">
                Get in touch
              </a>
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
          </div>
        </section>

        <section id="education" className="station" data-stop="education" aria-labelledby="education-h">
          <div className="copy">
            <p className="eyebrow">02 — Education</p>
            <h2 id="education-h">Education</h2>
            <Timeline items={profile.education} empty="Education details are being added." />
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-h">
          <div className="station" data-stop="projects">
            <div className="copy">
              <p className="eyebrow">03 — Projects</p>
              <h2 id="projects-h">Selected work</h2>
              <p>Three projects. Open one for the outcome, my role, the stack and the technical highlights.</p>
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

        <section id="experience" className="station" data-stop="experience" aria-labelledby="experience-h">
          <div className="copy">
            <p className="eyebrow">04 — Experience</p>
            <h2 id="experience-h">Experience</h2>
            <Timeline items={profile.experience} empty="Experience details are being added." />
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
            </div>
          </div>
          <footer className="site-footer">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <a href="#top">Back to top ↑</a>
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
            knowsAbout: ["Software engineering", "Artificial intelligence", "Systems programming", "Rust", "TypeScript", "WebGL"],
            sameAs: contact.links.map((l) => l.href),
          },
          { "@context": "https://schema.org", "@type": "WebSite", name: profile.name, url: siteUrl },
        ]}
      />
    </>
  );
}
