// Single source of truth for projects.
// Drives: home project cards, /projects/[slug] pages, metadata, JSON-LD, sitemap
// and the 3D gateways (order = gateway order along the causeway).
// No counts here: the PR links carry the numbers. Every fact can be checked from the linked repositories.

import type { YouTubeClip } from "./media";
import { postHref } from "./writing";

export type Focus = { label: string; post?: string };

export type Project = {
  slug: string;
  title: string;
  /** One line for the card; the panel shows `outcome`. */
  tagline: string;
  outcome: string;
  role: string;
  year: string;
  stack: string[];
  /** "Focused on …": each area links to its write-up when one is public. */
  focus: Focus[];
  highlights: string[];
  links: { label: string; href: string }[];
  /** A snapshot of the work, linking to the post it comes from when there is one. */
  image: { src: string; alt: string; post?: string; href?: string } | null;
  video: string | null;
  /** Click-to-load YouTube clip shown in the panel. */
  youtube?: YouTubeClip & { language?: string };
  /** More snapshots for the panel, shown after `image`. */
  gallery?: { src: string; alt: string; href?: string }[];
  /** 3D hint only: which landmark the gateway carries. */
  landmark: "portal" | "eth" | "turbo" | "cloud" | "robot";
  /** The portal's tunnel of light. Only the Herodotus (Ethereum) gateway keeps it; the rest show their mark alone. */
  portal?: boolean;
};

export const projects: Project[] = [
  {
    slug: "herodotus",
    title: "Herodotus",
    tagline: "Zero-knowledge state proofs for Ethereum, then DeFi infrastructure.",
    outcome:
      "At Herodotus I worked on storage proofs and the Herodotus Data Processor, then on infrastructure for DeFi lending. Builds I worked on: Daloc, an onchain prime brokerage, and Risklayer, a DeFi risk terminal.",
    role: "Software Engineer",
    year: "2024 – 2026",
    stack: ["Cairo", "Rust", "TypeScript", "Python"],
    focus: [{ label: "State proofs" }, { label: "Prime brokerage" }, { label: "DeFi risk" }],
    highlights: [
      "State proofs: extended hdp-cairo from EVM storage proofs to plain Merkle and Patricia-trie proofs, so off-chain systems such as matching engines and oracles can prove the state they read.",
      "Prime brokerage: real-time order-book pipelines and RFQ quoting behind Daloc, for trading on credit across chains.",
      "Risk: on-chain credit pricing, and an AI risk analysis of DeFi protocols mapped onto the infrastructure they depend on, behind Risklayer.",
      "Community: mentored a Herodotus Data Processor session at Invisible Garden, Buenos Aires 2025.",
    ],
    links: [
      { label: "Daloc", href: "https://daloc.xyz" },
      { label: "Risklayer", href: "https://risklayer.online" },
      { label: "hdp-cairo PRs", href: "https://github.com/HerodotusDev/hdp-cairo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged" },
    ],
    image: { src: "/shots/daloc.jpg", alt: "Daloc: one account, every chain. Onchain prime brokerage.", href: "https://daloc.xyz" },
    video: null,
    landmark: "eth",
    portal: true,
  },
  {
    slug: "ravi",
    title: "Ravi",
    tagline: "Open-source agents on machines you control. I help maintain it.",
    outcome:
      "An open-source platform for running AI agents on machines you control, reached from WhatsApp, Slack and the CLI. I help maintain it and work on who may act, where the agent runs and how it is contained.",
    role: "Maintainer — permissions, security, sandboxes",
    year: "2026",
    stack: ["TypeScript", "Bun", "NATS", "E2B", "Cloudflare Workers"],
    focus: [
      { label: "Permissions: who is typing", post: "who-is-typing-agents-shells-and-money" },
      { label: "Where the agent lives", post: "where-does-the-agent-live" },
      { label: "Sandboxes and secrets", post: "ravi-sandboxes-context-shared-data-security" },
    ],
    highlights: [
      "Permissions: agents act only with an explicit grant, behind a stricter bash guard.",
      "Secrets at rest: owner-only state files, an HTTPS-only gateway, and context keys stored as digests.",
      "Sandboxes: E2B VMs with deny-all egress, the API key kept out of the VM, and every output treated as hostile.",
      "Connected sandboxes: a Cloudflare Tunnel and a Gate Worker check short-lived grants before a task reaches a machine.",
    ],
    links: [
      { label: "ravi.bot", href: "https://ravi.bot" },
      { label: "Repository", href: "https://github.com/PedroRosalba/ravi" },
      { label: "PRs upstream", href: "https://github.com/filipexyz/ravi/pulls?q=is%3Apr+author%3APedroRosalba" },
    ],
    image: {
      src: "/shots/ravi-site.jpg",
      alt: "ravi.bot: agents that work together, from anywhere.",
      href: "https://ravi.bot",
    },
    video: null,
    landmark: "robot",
  },
  {
    slug: "turborepo",
    title: "Turborepo",
    tagline: "Active contributor to Turborepo's Rust core: caching, change detection and multi-language support.",
    outcome:
      "I contribute to Turborepo's Rust core, mostly its cache and its support for Rust, Go and Python workspaces: cache hits you can trust, and hashes that follow exactly what changed.",
    role: "Open-source contributor",
    year: "2026",
    stack: ["Rust", "Cargo", "uv", "pnpm", "Git internals"],
    focus: [
      { label: "Caching", post: "turbo-cache-hit-wrong-outputs" },
      { label: "Change detection", post: "turbo-skipped-task-whose-inputs-changed" },
      { label: "Multi-language support", post: "stress-testing-turborepo-rust-go-python" },
    ],
    highlights: [
      "Caching: improved local cache restores, symlinks included, so a cache hit leaves outputs exactly as a fresh build would.",
      "Change detection: task hashes and --affected follow the files and Cargo.lock entries that really changed, so fewer tasks rerun and none are skipped.",
      "Multi-language support: Rust, Go and Python workspaces hash their tool configuration (Clippy, ruff, pytest, uv) and keep it through turbo prune, part of Turborepo's move beyond JavaScript.",
      "Consistency: file hashing matches git's own text detection and pnpm 8 single-project lockfiles are understood, so the same repository hashes the same on every machine.",
    ],
    links: [
      {
        label: "Merged PRs",
        href: "https://github.com/vercel/turborepo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged",
      },
    ],
    image: { src: "/shots/turborepo-site.jpg", alt: "turborepo.dev: your codebase, faster.", href: "https://turborepo.dev" },
    video: null,
    landmark: "turbo",
  },
  {
    slug: "cloudflare",
    title: "Cloudflare Workers",
    tagline: "Contributor to the Workers Rust SDK and the runtime's TypeScript types.",
    outcome:
      "I contribute to Cloudflare's Workers platform from Rust and TypeScript: bringing the Rust SDK's bindings in line with their JavaScript counterparts, and making the runtime's types describe what it really returns.",
    role: "Open-source contributor",
    year: "2026",
    stack: ["Rust", "wasm-bindgen", "TypeScript", "workerd"],
    focus: [{ label: "Rust SDK parity" }, { label: "Runtime types" }, { label: "Build tooling" }],
    highlights: [
      "Storage bindings: KV, Queues and R2 in workers-rs carry Rust data to JavaScript faithfully, maps and partial metadata included.",
      "Durable Objects: alarm and storage options reach the runtime as it expects, with the read options JavaScript already had.",
      "Runtime types: workerd's TypeScript definitions match the runtime for byte inputs, RPC exports and bulk KV reads.",
      "Build tooling: worker-build reads wasm-bindgen's package metadata and keeps the project's pinned version.",
    ],
    links: [
      { label: "workers-rs PRs", href: "https://github.com/cloudflare/workers-rs/pulls?q=is%3Apr+author%3APedroRosalba" },
      { label: "workerd PRs", href: "https://github.com/cloudflare/workerd/pulls?q=is%3Apr+author%3APedroRosalba" },
    ],
    image: null,
    video: null,
    landmark: "cloud",
  },
];

/** Focus areas with the URL of their write-up when it is public here (null otherwise). */
export function focusLinks(project: Project) {
  return project.focus.map((f) => ({ label: f.label, href: f.post ? postHref(f.post) : null }));
}

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
