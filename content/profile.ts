// Single source of truth for personal content.
// Only facts that are public or confirmed by Pedro belong here.
// The CV (public/pedro-rosalba-cv.pdf) carries the numbers; the site carries proof a visitor can click.

export type LinkItem = { label: string; href: string };

export type TimelineItem = {
  title: string;
  place: string;
  period: string;
  detail?: string;
  /** Proof a visitor can open: PRs, recordings, certificates. */
  proof?: LinkItem[];
};

const cv = "/pedro-rosalba-cv.pdf";

export const profile = {
  name: "Pedro Rosalba",
  /** Other names people search for: the handle behind the domain and the X account. */
  alternateNames: ["Rosalbito", "0xrosalbito"],
  role: "Software engineer",
  positioning: "A native problem solver, across the stack.",
  overview:
    "Former mathlete, then cryptography and blockchain. Now building core software, for the web and beyond.",
  education: [
    {
      title: "Mathematics and Computer Science",
      place: "IMPA Tech",
      period: "2024 – 2025",
    },
  ] as TimelineItem[],
  honors: [
    {
      title: "Honorable mention, International Mathematics Competition (IMC)",
      place: "Mathematics",
      period: "2023",
    },
    {
      title: "12th place, Brazil IMO team selection test",
      place: "Mathematics",
      period: "2023",
    },
    {
      title: "Silver and bronze medals, Brazilian Math Olympiad (OBM)",
      place: "Mathematics",
      period: "2018 – 2023",
    },
  ] as TimelineItem[],
  // Set NEXT_PUBLIC_BLOG_URL once the blog is deployed; every Writing link stays hidden until then.
  writing: process.env.NEXT_PUBLIC_BLOG_URL ?? null,
  contact: {
    email: "pedro.dandrea.rpd@gmail.com" as string | null,
    links: [
      { label: "GitHub", href: "https://github.com/PedroRosalba" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/pedro-dandrea-rosalba-031b85291/" },
      { label: "X", href: "https://x.com/0xrosalbito" },
    ] as LinkItem[],
    cv: cv as string | null,
  },
};

// The production origin, fixed in code: canonical URLs, the sitemap and Open Graph must name the live domain on every
// deployment (previews included, which Vercel marks noindex), never a deployment URL that can disappear.
export const siteUrl = "https://www.rosalbito.dev";
