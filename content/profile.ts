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
  /** Shown instead of proof when the work is closed source. */
  note?: string;
};

const cv = "/pedro-rosalba-cv.pdf";

export const profile = {
  name: "Pedro Rosalba",
  role: "Software engineer · Rust · ZK · Agents",
  positioning:
    "I build money-movement systems in Rust, zero-knowledge infrastructure and the tooling around AI agents, and I send fixes upstream to the tools I use.",
  about: {
    headline: "Correctness first, across the stack.",
    body: [
      "I like problems where being slightly wrong is expensive: payment rails and ledgers, state proofs, build caches that must never lie about a hit.",
      "Most of my recent public work is upstream: fixes to Turborepo's Rust core and to Cloudflare's Workers runtime and Rust SDK, plus security and sandboxing for Ravi, an agent platform I help maintain. I studied math before code, and still do, at IMPA Tech.",
    ],
    photo: null as string | null, // e.g. "/pedro.jpg" — a real photo, shown small in About
    facts: [
      { label: "Studies", value: "IMPA Tech" },
      { label: "Writes", value: "Rust, TypeScript" },
      { label: "Speaks", value: "PT · EN · ES" },
    ],
  },
  talks: [
    {
      title: "Herodotus Data Processor, mentor session",
      place: "Invisible Garden, Buenos Aires",
      period: "2025",
      href: "https://luma.com/porsxgac",
    },
    {
      title: "Goroutines vs Tokio in agent harnesses",
      place: "Devin Meetup, Rio de Janeiro",
      period: "2026",
      href: "https://luma.com/l2f11j2p",
    },
  ],
  education: [
    {
      title: "B.Sc. in Mathematics and Computer Science",
      place: "IMPA Tech",
      period: "2024 – 2026",
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
  experience: [
    {
      title: "Software Engineer",
      place: "eNor",
      period: "2026",
      detail: "Rust money movement: central-bank instant payments (ISO 20022), ledgers, custody and compliance.",
      note: "Closed source. Full scope on the CV.",
    },
    {
      title: "Software Engineer",
      place: "Herodotus",
      period: "2024 – 2026",
      detail: "Extended hdp-cairo, a zero-knowledge co-processor, from EVM storage proofs to plain Merkle state proofs.",
      proof: [
        {
          label: "hdp-cairo PRs",
          href: "https://github.com/HerodotusDev/hdp-cairo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged",
        },
        { label: "Invisible Garden 2025", href: "https://invisible.garden/people/pedro-dandrea-rosalba" },
      ],
    },
    {
      title: "Developer Relations",
      place: "Mediolano",
      period: "2022 – 2024",
      detail: "IP licensing on Starknet: Cairo contracts, IPFS and zero-knowledge proofs of license.",
      proof: [
        { label: "mediolano-app", href: "https://github.com/mediolano-os/mediolano-app/pulls?q=is%3Apr+author%3APedroRosalba" },
        {
          label: "mediolano-contracts",
          href: "https://github.com/mediolano-os/mediolano-contracts/pulls?q=is%3Apr+author%3APedroRosalba",
        },
      ],
    },
    {
      title: "Founder",
      place: "Rio de Janeiro University Blockchain League",
      period: "2024 – 2026",
    },
    {
      title: "Math Olympiad Instructor",
      place: "Colégio e Curso Pensi",
      period: "2023 – 2025",
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
