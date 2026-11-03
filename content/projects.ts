// Single source of truth for projects.
// Drives: home project cards, /projects/[slug] pages, metadata, JSON-LD, sitemap
// and the 3D gateways (order = gateway order along the causeway).
// No counts here: the PR links carry the numbers. Every fact can be checked from the linked repositories.

import type { EmblemKind, YouTubeClip } from "./media";
import { postHref } from "./writing";

export type Focus = { label: string; post?: string };

/** The live product, shown in the panel as a window tinted into the world's violet; true colours on hover. */
export type ProductWindow = { src: string; alt: string; href: string; /** The address shown in the window's bar. */ label: string };

/** One pull request (or a reported issue) in the panel: what it is, how big, and what it changed for users. */
export type Receipt = {
  state: "merged" | "review" | "reported";
  repo: string;
  number: number;
  /** For a reported issue: the PR that fixed it. */
  fixedIn?: number;
  added?: number;
  removed?: number;
  title: string;
  /** One line on what it fixed, in plain words. */
  what: string;
  /** ISO date: merged, opened (in review) or reported. */
  date: string;
  href: string;
};

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
  /** A living cover drawn in the world's palette. The card shows it instead of `image`; the panel shows it when
   * there is no video, clip or image. */
  emblem?: EmblemKind;
  /** A snapshot of the work, linking to the post it comes from when there is one. */
  image: { src: string; alt: string; post?: string; href?: string } | null;
  video: string | null;
  /** Click-to-load YouTube clip shown in the panel. */
  youtube?: YouTubeClip & { language?: string };
  /** More snapshots for the panel, shown after `image`. */
  gallery?: { src: string; alt: string; href?: string }[];
  /** The live product, under the cover in the panel. */
  product?: ProductWindow;
  /** Two or three real PRs, under the product in the panel. */
  receipts?: Receipt[];
  /** 3D hint only: which landmark the gateway carries. */
  landmark: "portal" | "eth" | "turbo" | "cloud" | "robot";
  /** The portal's tunnel of light behind the mark. Off everywhere now: the holograms carry the gateways. */
  portal?: boolean;
};

export const projects: Project[] = [
  {
    slug: "herodotus",
    title: "Herodotus",
    tagline: "Zero-knowledge state proofs for Ethereum, then DeFi infrastructure.",
    outcome:
      "At Herodotus I worked on storage proofs and the Herodotus Data Processor, then on infrastructure for DeFi lending. Builds I worked on: Daloc, an onchain prime brokerage, and its documentation.",
    role: "Software Engineer",
    year: "2024 – 2026",
    stack: ["Cairo", "Rust", "TypeScript", "Python"],
    focus: [{ label: "State proofs" }, { label: "Prime brokerage" }, { label: "DeFi risk" }],
    highlights: [
      "State proofs: extended hdp-cairo from EVM storage proofs to plain Merkle and Patricia-trie proofs, so off-chain systems such as matching engines and oracles can prove the state they read.",
      "Prime brokerage: real-time order-book pipelines and RFQ quoting behind Daloc, for trading on credit across chains.",
      "Risk: on-chain credit pricing, and an AI risk analysis of DeFi protocols mapped onto the infrastructure they depend on.",
      "Community: mentored a Herodotus Data Processor session at Invisible Garden, Buenos Aires 2025.",
    ],
    links: [
      { label: "Daloc", href: "https://daloc.xyz" },
      { label: "Daloc Docs", href: "https://docs.daloc.xyz" },
      { label: "hdp-cairo PRs", href: "https://github.com/HerodotusDev/hdp-cairo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged" },
    ],
    image: null,
    video: null,
    emblem: "daloc",
    product: { src: "/shots/daloc-site.jpg", alt: "daloc.xyz, onchain prime brokerage.", href: "https://daloc.xyz", label: "daloc.xyz" },
    receipts: [
      {
        state: "merged",
        repo: "HerodotusDev/hdp-cairo",
        number: 196,
        added: 15928,
        removed: 2121,
        title: "Injected state",
        what: "Programs read state injected from off-chain systems and prove it against a Merkle root.",
        date: "2025-09-19",
        href: "https://github.com/HerodotusDev/hdp-cairo/pull/196",
      },
      {
        state: "merged",
        repo: "HerodotusDev/hdp-cairo",
        number: 206,
        added: 466,
        removed: 295,
        title: "Injected state: Patricia-trie reads",
        what: "The same proofs over Patricia tries, the structure Ethereum's own state uses.",
        date: "2025-08-27",
        href: "https://github.com/HerodotusDev/hdp-cairo/pull/206",
      },
      {
        state: "merged",
        repo: "HerodotusDev/hdp-cairo",
        number: 193,
        added: 513,
        removed: 344,
        title: "MPT verifier abstraction",
        what: "One verifier interface for Merkle-Patricia proofs, so new trie types plug in.",
        date: "2025-08-12",
        href: "https://github.com/HerodotusDev/hdp-cairo/pull/193",
      },
    ],
    landmark: "eth",
  },
  {
    slug: "ravi",
    title: "Ravi",
    tagline: "Open-source agents on machines you control.",
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
    emblem: "ravi",
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
    emblem: "turborepo",
    landmark: "turbo",
  },
  {
    slug: "cloudflare",
    title: "Cloudflare Workers",
    tagline: "Async Rust on Cloudflare Workers: Rust on V8's event loop, through Emscripten.",
    outcome:
      "In a Worker the thread belongs to V8's event loop, so an async Rust runtime cannot block and sockets are JavaScript streams. Cloudflare's experimental runtime compiles Rust to Emscripten and lets the JavaScript loop drive it. I run real Rust apps on it, find what breaks at each layer, and fix it upstream in Emscripten and workers-rs.",
    role: "Open-source contributor",
    year: "2026",
    stack: ["Rust", "Emscripten", "WebAssembly", "workerd"],
    focus: [{ label: "Async Rust on the V8 event loop" }, { label: "Emscripten" }, { label: "Rust SDK" }],
    highlights: [
      "Async Rust on the V8 event loop: tested the experimental runtime with axum, sqlx and reqwest and reported the gaps, such as four sockets leaked per cancelled request and bytes lost when a request ends.",
      "Emscripten: pipe buffers that grow on demand as a ring (in review), and an epoll listener that could exhaust workerd's 10,000-timer cap, now fixed upstream.",
      "Rust SDK: KV, Queues, R2 and Durable Object bindings in workers-rs carry Rust data to JavaScript faithfully, and workerd's TypeScript types match what the runtime returns.",
    ],
    links: [
      { label: "Emscripten", href: "https://github.com/emscripten-core/emscripten/issues?q=involves%3APedroRosalba" },
      { label: "workers-rs", href: "https://github.com/cloudflare/workers-rs/issues?q=involves%3APedroRosalba" },
      { label: "workerd PRs", href: "https://github.com/cloudflare/workerd/pulls?q=is%3Apr+author%3APedroRosalba" },
    ],
    image: null,
    video: null,
    emblem: "cloudflare",
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
