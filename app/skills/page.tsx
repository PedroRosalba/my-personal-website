import type { Metadata } from "next";
import Link from "next/link";
import { profile, siteUrl } from "@/content/profile";
import { skills, skillsInstall, skillsPage, skillsRepo } from "@/content/skills";
import { SkillArticle } from "@/components/html/SkillArticle";
import { SiteNav } from "@/components/html/SiteNav";
import { JsonLd } from "@/components/html/JsonLd";
import { alt as ogAlt, contentType as ogType, size as ogSize } from "@/app/opengraph-image";

const shareTitle = `${skillsPage.title} — ${profile.name}`;
// The root Open Graph image (app/opengraph-image.tsx), restated with its own size and alt text.
const shareImage = { url: "/opengraph-image", ...ogSize, alt: ogAlt, type: ogType };

export const metadata: Metadata = {
  title: skillsPage.title,
  description: skillsPage.description,
  alternates: { canonical: skillsPage.path },
  // A page-level openGraph replaces the root one, so siteName and the root image are restated here.
  openGraph: {
    type: "website",
    url: skillsPage.path,
    siteName: profile.name,
    title: shareTitle,
    description: skillsPage.description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: skillsPage.description,
    images: [shareImage],
  },
};

export default function SkillsPage() {
  const firstInvoke = skills[0].invoke[0];
  const { realRun } = skillsPage;
  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <SiteNav />
      <main className="project-page skills-page">
        <Link className="back-link" href="/">
          <span aria-hidden="true">←</span> Home
        </Link>

        <header className="skills-intro">
          <p className="eyebrow">{skillsPage.eyebrow}</p>
          <h1 className="skills-title">{skillsPage.heading}</h1>
          <p className="project-outcome">{skillsPage.intro}</p>
        </header>

        <section className="skills-section" aria-labelledby="install-h">
          <h2 id="install-h" className="eyebrow">
            Install
          </h2>
          <pre className="code-block" data-block="install">
            <code>
              {skillsInstall.map((cmd) => (
                <span className="code-line" key={cmd}>
                  {cmd}
                </span>
              ))}
            </code>
          </pre>
          <p className="skills-note">{skillsPage.afterInstall}</p>
          <p className="skills-note">{skillsPage.thenTry}</p>
          <pre className="code-block" data-block="try">
            <code>
              <span className="code-line">{firstInvoke}</span>
            </code>
          </pre>
          <p className="skills-note skills-aside">{skillsPage.qualifiedNote}</p>
        </section>

        {skills.map((skill, i) => (
          <section className="skills-section" id={skill.slug} key={skill.slug}>
            <SkillArticle skill={skill} index={i} total={skills.length} />
          </section>
        ))}

        <section className="skills-section" aria-labelledby="real-run-h">
          <h2 id="real-run-h" className="eyebrow">
            Real run
          </h2>
          <figure className="real-run">
            <pre className="code-block">
              <code>
                {realRun.lines.map((line) => (
                  <span className="code-line" key={line}>
                    {line}
                  </span>
                ))}
              </code>
            </pre>
            <figcaption className="skills-note">{realRun.caption}</figcaption>
          </figure>
        </section>
      </main>
      <JsonLd
        data={[
          ...skills.map((skill) => ({
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: skill.title,
            description: skill.summary,
            url: `${siteUrl}${skillsPage.path}#${skill.slug}`,
            codeRepository: skill.links.find((l) => l.label === "GitHub")?.href ?? skillsRepo,
            author: { "@type": "Person", name: profile.name, url: siteUrl },
          })),
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: profile.name, item: siteUrl },
              { "@type": "ListItem", position: 2, name: skillsPage.label, item: `${siteUrl}${skillsPage.path}` },
            ],
          },
        ]}
      />
    </>
  );
}
