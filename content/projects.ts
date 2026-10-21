// Single source of truth for projects.
// Drives: home project cards, /projects/[slug] pages, metadata, JSON-LD, sitemap
// and the 3D gateways (order = gateway order along the causeway).
// Every fact below can be checked from the linked repositories and PRs.

import { profile } from "./profile";

export type Project = {
  slug: string;
  title: string;
  outcome: string;
  role: string;
  year: string;
  stack: string[];
  highlights: string[];
  links: { label: string; href: string }[];
  video: string | null;
  /** 3D hint only: which landmark the gateway carries. */
  landmark: "portal" | "eth";
};

const writing = profile.writing ? [{ label: "Writing", href: profile.writing }] : [];

export const projects: Project[] = [
  {
    slug: "ravi",
    title: "Ravi",
    outcome:
      "An open-source platform for running AI agents on machines you control, reached from WhatsApp, Slack and the CLI. I help maintain it and work on its security and sandboxing.",
    role: "Maintainer — permissions, security, sandboxes",
    year: "2026",
    stack: ["TypeScript", "Bun", "NATS", "E2B", "Cloudflare Workers"],
    highlights: [
      "Merged: agents get permissions only when they are granted explicitly, behind a stricter bash guard.",
      "In review: state files are owner-only, the gateway is HTTPS-only, and runtime context keys are stored as digests at rest.",
      "In review: E2B sandboxes with deny-all egress, the API key never inside the VM, and every sandbox output treated as hostile.",
      "In review: connected sandboxes, where a Cloudflare Tunnel and a Gate Worker verify short-lived, Console-minted grants before a task reaches a machine.",
    ],
    links: [
      { label: "Repository", href: "https://github.com/filipexyz/ravi" },
      { label: "My PRs", href: "https://github.com/filipexyz/ravi/pulls?q=is%3Apr+author%3APedroRosalba" },
      ...writing,
    ],
    video: null,
    landmark: "portal",
  },
  {
    slug: "turborepo",
    title: "Turborepo, upstream",
    outcome:
      "Sixteen merged fixes to Turborepo's Rust core, most of them places where the cache said hit, or skipped a task, when it should not have.",
    role: "Open-source contributor",
    year: "2026",
    stack: ["Rust", "Cargo", "uv", "pnpm", "Git internals"],
    highlights: [
      "Cargo.lock changes are attributed to the crates whose dependencies changed, instead of invalidating the whole workspace.",
      "File hashing matches git's text=auto binary detection, so the same checkout hashes the same everywhere.",
      "Cached symlinks are restored when outputs already exist on disk, and the restore manifest is written before a local hit returns.",
      "Python and Rust tool configuration (ruff, pytest, uv, Clippy) is part of the task hash, and survives `turbo prune`.",
    ],
    links: [
      {
        label: "Merged PRs",
        href: "https://github.com/vercel/turborepo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged",
      },
      ...writing,
    ],
    video: null,
    landmark: "portal",
  },
  {
    slug: "cran",
    title: "Cran",
    outcome:
      "An AI companion whose memory stays private: conversation memory is stored under homomorphic encryption, so retrieval works without decrypting it. Built at ETHDenver 2025.",
    role: "Hackathon team",
    year: "2025",
    stack: ["Python", "LangChain", "Microsoft SEAL (FHE)", "Next.js", "EVM"],
    highlights: [
      "Retrieval-augmented memory over encrypted embeddings, computed with SEAL's homomorphic encryption.",
      "Contracts deployed on Sepolia, Base Sepolia, Flow EVM, Zircuit and Somnia testnets.",
      "Won the zkSync, Flow and Somnia bounties at ETHDenver 2025.",
    ],
    links: [
      { label: "Repository", href: "https://github.com/Arthur-Jacobina/cran" },
      { label: "Devfolio", href: "https://devfolio.co/projects/cranberry-bd29" },
    ],
    video: null,
    landmark: "eth",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
