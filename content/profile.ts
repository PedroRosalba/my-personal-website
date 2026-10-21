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
  role: "Software engineer · Rust · ZK · Agents",
  positioning:
    "I build money-movement systems in Rust, zero-knowledge infrastructure and the tooling around AI agents, and I send fixes upstream to the tools I use.",
  education: [
    {
      title: "Mathematics and Computer Science",
      place: "IMPA Tech",
      period: "2024 – 2025",
    },
  ] as TimelineItem[],
  honors: [
    {
      title: "ETHGlobal Prague — awards",
      place: "Hackathon",
      period: "2025",
      proof: [
        {
          label: "Certificate",
          href: "https://violet-rainy-shrimp-423.mypinata.cloud/ipfs/bafybeica5stcskml2lfg556kvojlzyp7m66hd7qvkeyjvflmezgnuh3f6a",
        },
      ],
    },
    {
      title: "ETHDenver — zkSync 2nd, Somnia 2nd, Flow 3rd",
      place: "Hackathon, with Cran",
      period: "2025",
      proof: [{ label: "Devfolio", href: "https://devfolio.co/projects/cranberry-bd29" }],
    },
    {
      title: "ETHGlobal Brussels — awards",
      place: "Hackathon",
      period: "2024",
      proof: [
        {
          label: "Certificate",
          href: "https://violet-rainy-shrimp-423.mypinata.cloud/ipfs/bafybeicmj26ff2t4pedr4tl6dgy5crmpfaylxqqi2m6ia6ylomhbxgfn6i",
        },
      ],
    },
    {
      title: "IMC honorable mention · 12th, Brazil IMO selection test",
      place: "Mathematics",
      period: "2023",
    },
    {
      title: "Brazilian Math Olympiad — silver and bronze",
      place: "Mathematics",
      period: "2018 – 2023",
    },
  ] as TimelineItem[],
  // Set NEXT_PUBLIC_BLOG_URL once the blog is deployed; every Writing link stays hidden until then.
  writing: process.env.NEXT_PUBLIC_BLOG_URL ?? null,
  contact: {
    line: "Open to conversations about Rust, payments, zero-knowledge and agent infrastructure.",
    email: "pedro.dandrea.rpd@gmail.com" as string | null,
    links: [
      { label: "GitHub", href: "https://github.com/PedroRosalba" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/pedro-dandrea-rosalba-031b85291/" },
      { label: "X", href: "https://x.com/0xrosalbito" },
    ] as LinkItem[],
    cv: cv as string | null,
  },
};

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
