// Single source of truth for personal content.
// Only facts that are public or confirmed by Pedro belong here.
// Fields left null / empty are hidden in the UI — see CONTENT_TODO.md.

export type LinkItem = { label: string; href: string };

export type TimelineItem = {
  title: string;
  place: string;
  period: string;
  detail?: string;
};

export const profile = {
  name: "Pedro Rosalba",
  role: "Software · AI · Systems",
  // DRAFT positioning sentence, derived from public repositories. Pedro to confirm.
  positioning:
    "I build software systems end to end — from low-level engines in Rust to AI tooling and on-chain applications.",
  about: {
    headline: "Systems thinking, applied across the stack.",
    // DRAFT, derived from public repositories only. No biographical claims.
    body: [
      "I'm a software engineer who likes problems where correctness matters: payment engines, protocol integrations and the tooling around AI agents.",
      "My public work ranges from a Rust transaction processor to privacy-preserving payments on Starknet and real-time collaborative apps — and this site itself, built with Three.js, React Three Fiber and WebGL.",
    ],
    photo: null as string | null, // e.g. "/pedro.jpg" — a real photo, shown small in About
    facts: [] as { label: string; value: string }[], // e.g. { label: "Based in", value: "…" }
  },
  education: [] as TimelineItem[],
  experience: [] as TimelineItem[],
  contact: {
    line: "Open to conversations about software, AI and systems work.",
    email: null as string | null, // public contact email — not set yet
    links: [{ label: "GitHub", href: "https://github.com/PedroRosalba" }] as LinkItem[],
    cv: null as string | null, // e.g. "/pedro-rosalba-cv.pdf"
  },
};

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
