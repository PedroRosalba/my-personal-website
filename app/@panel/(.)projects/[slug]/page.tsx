import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { ProjectArticle } from "@/components/html/ProjectArticle";
import { ProjectPanel } from "@/components/html/ProjectPanel";

// Opened from the home page: the same project content, shown over the 3D scene.
export default async function InterceptedProject({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  return (
    <ProjectPanel slug={project.slug} title={project.title}>
      <ProjectArticle project={project} index={index} total={projects.length} next={next} headingLevel="h2" />
    </ProjectPanel>
  );
}
