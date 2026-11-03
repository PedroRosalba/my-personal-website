import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { profile, siteUrl } from "@/content/profile";
import { ProjectArticle } from "@/components/html/ProjectArticle";
import { SiteNav } from "@/components/html/SiteNav";
import { JsonLd } from "@/components/html/JsonLd";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.outcome,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      url: `/projects/${project.slug}`,
      title: `${project.title} — ${profile.name}`,
      description: project.outcome,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const repo = project.links.find((l) => l.label === "GitHub")?.href;

  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <SiteNav />
      <main className="project-page">
        <Link className="back-link" href="/#projects">
          <span aria-hidden="true">←</span> All projects
        </Link>
        <ProjectArticle project={project} index={index} total={projects.length} next={next} headingLevel="h1" />
      </main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: project.title,
            description: project.outcome,
            url: `${siteUrl}/projects/${project.slug}`,
            ...(repo ? { codeRepository: repo } : {}),
            programmingLanguage: project.stack[0],
            keywords: project.stack.join(", "),
            author: { "@type": "Person", name: profile.name, url: siteUrl },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: profile.name, item: siteUrl },
              { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/#projects` },
              {
                "@type": "ListItem",
                position: 3,
                name: project.title,
                item: `${siteUrl}/projects/${project.slug}`,
              },
            ],
          },
        ]}
      />
    </>
  );
}
