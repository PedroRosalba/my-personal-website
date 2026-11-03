import Link from "next/link";
import { profile, siteUrl, type LinkItem, type TimelineItem } from "@/content/profile";
import { projects } from "@/content/projects";
import { featuredRoles, earlierRoles, type Build, type Role } from "@/content/experience";
import { community } from "@/content/media";
import { hackathons } from "@/content/hackathons";
import { writingBySeries } from "@/content/writing";
import { skillsPage } from "@/content/skills";
import { SiteNav } from "@/components/html/SiteNav";
import { ScrollDriver } from "@/components/html/ScrollDriver";
import { ProjectCard } from "@/components/html/ProjectCard";
import { CommunityCard } from "@/components/html/CommunityCard";
import { Snapshot } from "@/components/html/Snapshot";
import { EventEmblem } from "@/components/html/EventEmblem";
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

/** A living cover that opens the same place as the title next to it. Decorative for assistive tech: the title link
 * already names the destination. */
function Cover({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="cover" href={href} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
      {children}
    </a>
  );
}

/** A build under a role, in the Community-row shape: cover, what it is, name, one line, where it lives. */
function BuildRow({ build }: { build: Build }) {
  return (
    <li className="card-row card-row-icon">
      <Cover href={build.href}>
        <EventEmblem kind={build.emblem} bare />
      </Cover>
      <div>
        <p className="timeline-period">{build.kind}</p>
        <h4 className="card-row-title">
          <a href={build.href} target="_blank" rel="noreferrer">
            {build.title}
          </a>
        </h4>
        <p className="card-row-text">{build.summary}</p>
        <p className="cc-actions">
          {build.links.map((link) => (
            <a key={link.href} className="cc-link" href={link.href} target="_blank" rel="noreferrer" aria-label={`${build.title}: ${link.label}`}>
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </p>
      </div>
    </li>
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
            <h2 id="experience-h">Experience</h2>
          </>
        ) : null}
        <div className={role.emblem ? "role-head-cover" : undefined}>
          {role.emblem ? (
            <Cover href={role.href}>
              <EventEmblem kind={role.emblem} bare />
            </Cover>
          ) : null}
          <div className="role-head">
            <p className="timeline-period">{role.period}</p>
            <h3 className="role-title">
              {role.role} · <Company role={role} />
            </h3>
            <p className="role-summary">{role.summary}</p>
          </div>
        </div>
        {role.image ? <Snapshot src={role.image.src} alt={role.image.alt} href={role.image.href} /> : null}
        {role.builds?.length ? (
          <div className="builds">
            <p className="eyebrow focus-label">Builds I worked on</p>
            <ul className="cards cards-wide">
              {role.builds.map((b) => (
                <BuildRow build={b} key={b.href} />
              ))}
            </ul>
          </div>
        ) : null}
        <ul className="project-highlights role-bullets">
          {role.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="card-stack">{role.stack.join(" · ")}</p>
        {role.proof.length ? <ProofLinks links={role.proof} /> : null}
        {role.slug === "herodotus" ? (
          <p className="section-more">
            <Link className="next-link" href="/projects/herodotus" scroll={false}>
              See the work: Daloc and hdp-cairo <span aria-hidden="true">→</span>
            </Link>
          </p>
        ) : null}
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
            <p className="hero-overview">{profile.overview}</p>
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
              <p className="eyebrow">Also</p>
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
              <h2 id="projects-h">Selected work</h2>
              <p>My work at Herodotus, an agent platform I help maintain, and contributions to the tools I build on.</p>
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

        <section id="writing" className="station" data-stop="writing" aria-labelledby="writing-h">
          <div className="copy">
            <p className="eyebrow">03 — Writing</p>
            <h2 id="writing-h">Notes from the work.</h2>
            {writingBySeries.length ? (
              writingBySeries.map((s) => (
                <div className="series" key={s.key}>
                  <h3 className="series-title">{s.title}</h3>
                  <p className="series-blurb">{s.blurb}</p>
                  <ol className="series-posts">
                    {s.posts.map((post, i) => (
                      <li key={post.slug}>
                        <a href={post.href}>
                          <span className="index-number">{String(i + 1).padStart(2, "0")}</span>
                          <span>{post.title}</span>
                          <span className="index-arrow" aria-hidden="true">
                            →
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ))
            ) : (
              <p className="muted">Write-ups on Turborepo and Ravi are on their way.</p>
            )}
            {profile.writing ? (
              <p className="section-more">
                <a className="next-link" href={profile.writing}>
                  All writing <span aria-hidden="true">→</span>
                </a>
              </p>
            ) : null}
          </div>
        </section>

        <section id="community" className="station" data-stop="community" aria-labelledby="community-h">
          <div className="copy">
            <p className="eyebrow">04 — Community</p>
            <h2 id="community-h">Teaching, talks and meetups.</h2>
            <ul className="cards cards-wide">
              {community.map((item) => (
                <li
                  key={item.title}
                  className={item.emblem || item.video || item.image || item.youtube ? "card-row" : "card-row card-row-plain"}
                >
                  <CommunityCard item={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="education" className="station" data-stop="education" aria-labelledby="education-h">
          <div className="copy">
            <p className="eyebrow">05 — Education</p>
            <h2 id="education-h">Math first, then code.</h2>
            <Timeline items={[...profile.education, ...profile.honors]} />
            <h3 className="eyebrow media-sub">Hackathon awards</h3>
            <ul className="awards">
              {hackathons.map((h) => (
                <li key={h.project}>
                  <details className="award">
                    <summary>
                      <span className="timeline-period">{h.year}</span>
                      <span className="award-title">
                        {h.event} — {h.project}
                        <span className="award-prizes">{h.prizes.join(" · ")}</span>
                      </span>
                      <span className="award-toggle" aria-hidden="true" />
                    </summary>
                    <div className="award-body">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="card-thumb" src={h.image} alt="" loading="lazy" />
                      <div>
                        <p className="card-row-text">{h.pitch}</p>
                        <ProofLinks links={h.links} />
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
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
