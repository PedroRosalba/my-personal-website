// Single source of truth for projects.
// Drives: home project cards, /projects/[slug] pages, metadata, JSON-LD, sitemap
// and the 3D gateways (order = gateway order along the causeway).
// No counts here: the PR links carry the numbers. Every fact can be checked from the linked repositories.

import type { EmblemKind, YouTubeClip } from "./media";
import { postHref } from "./writing";

export type Focus = { label: string; post?: string };

/** The live product, shown in the panel as a window tinted into the world's violet; true colours on hover. */
export type ProductWindow = { src: string; alt: string; href: string; /** The address shown in the window's bar. */ label: string };

/** The work running in a terminal, in the same window as a product. `alt` says what it shows for screen readers. */
export type TerminalWindow = {
  label: string;
  href: string;
  alt: string;
  lines: { text: string; tone?: "command" | "dim" | "good" | "warn"; task?: string; badge?: string }[];
};

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
  /** Headline results, in place of receipts for a project with no public pull requests. */
  stats?: { value: string; label: string }[];
  /** Shown instead of `product` when the work reads better running than as a page. */
  terminal?: TerminalWindow;
  /** Two or three real PRs, under the product in the panel. */
  receipts?: Receipt[];
  /** 3D hint only: which landmark the gateway carries. */
  landmark: "portal" | "eth" | "turbo" | "cloud" | "robot" | "di";
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
    image: null,
    video: null,
    emblem: "ravi",
    product: { src: "/shots/ravi-site.jpg", alt: "ravi.bot: agents that work together, from anywhere.", href: "https://ravi.bot", label: "ravi.bot" },
    receipts: [
      {
        state: "merged",
        repo: "filipexyz/ravi",
        number: 627,
        added: 1801,
        removed: 60,
        title: "fix(security): stop sending API keys in cleartext; warn when NATS is reachable from the network",
        what: "Keys stay off the wire, and the bus says so when it is open to more than this machine.",
        date: "2026-11-02",
        href: "https://github.com/filipexyz/ravi/pull/627",
      },
      {
        state: "merged",
        repo: "filipexyz/ravi",
        number: 624,
        added: 528,
        removed: 35,
        title: "fix(permissions): explicit-only agents and a stricter bash guard",
        what: "An agent acts only with an explicit grant, and its shell commands pass a stricter guard.",
        date: "2026-10-07",
        href: "https://github.com/filipexyz/ravi/pull/624",
      },
      {
        state: "review",
        repo: "filipexyz/ravi",
        number: 662,
        added: 8782,
        removed: 481,
        title: "fix(sandbox): E2B isolation — deny-all egress, API key never in the VM, least-privilege worker, safe signals",
        what: "Sandboxed agents can't reach the network unless allowed, and never see the API key.",
        date: "2026-10-15",
        href: "https://github.com/filipexyz/ravi/pull/662",
      },
    ],
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
      { label: "Caching", post: "turbo-native-cache-keys" },
      { label: "Change detection", post: "turbo-discovery-and-change-detection" },
      { label: "Multi-language support", post: "turbo-remote-cache-native-toolchains" },
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
    image: null,
    video: null,
    emblem: "turborepo",
    terminal: {
      label: "turbo run lint: vercel/turborepo#14448",
      href: "https://github.com/vercel/turborepo/pull/14448",
      alt: "A terminal: turbo run lint replays from the cache, clippy.toml is edited, and the next run misses the cache and lints again instead of replaying a stale pass.",
      lines: [
        { tone: "command", text: "turbo run lint" },
        { task: "api:lint:", text: "cache hit, replaying logs" },
        { tone: "dim", text: " Tasks:    1 successful, 1 total" },
        { tone: "dim", text: "Cached:    1 cached, 1 total", badge: ">>> FULL TURBO" },
        { text: " " },
        { tone: "command", text: "echo 'msrv = \"1.85\"' >> clippy.toml" },
        { tone: "command", text: "turbo run lint" },
        { task: "api:lint:", tone: "warn", text: "cache miss, executing" },
        { task: "api:lint:", text: "    Checking api v0.1.0" },
        { task: "api:lint:", text: "    Finished `dev` profile" },
        { tone: "good", text: " Tasks:    1 successful, 1 total" },
        { tone: "dim", text: "Cached:    0 cached, 1 total" },
      ],
    },
    receipts: [
      {
        state: "merged",
        repo: "vercel/turborepo",
        number: 14448,
        added: 183,
        removed: 3,
        title: "Hash Clippy configuration for Cargo lint tasks",
        what: "Editing clippy.toml now reruns lint instead of replaying a stale pass from the cache.",
        date: "2026-10-11",
        href: "https://github.com/vercel/turborepo/pull/14448",
      },
      {
        state: "merged",
        repo: "vercel/turborepo",
        number: 14807,
        added: 632,
        removed: 128,
        title: "Restore cached symlinks when outputs are already on disk",
        what: "A cache hit leaves symlinks exactly as a fresh build would.",
        date: "2026-10-19",
        href: "https://github.com/vercel/turborepo/pull/14807",
      },
      {
        state: "merged",
        repo: "vercel/turborepo",
        number: 14656,
        added: 233,
        removed: 4,
        title: "Attribute Cargo.lock changes to the crates whose dependencies changed",
        what: "--affected reruns only the crates whose dependencies moved, not the whole workspace.",
        date: "2026-10-16",
        href: "https://github.com/vercel/turborepo/pull/14656",
      },
    ],
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
    product: {
      src: "/shots/cf-workers-docs.jpg",
      alt: "The Cloudflare Workers documentation.",
      href: "https://developers.cloudflare.com/workers/",
      label: "developers.cloudflare.com/workers",
    },
    receipts: [
      {
        state: "review",
        repo: "emscripten-core/emscripten",
        number: 28098,
        added: 106,
        removed: 123,
        title: "[FS] Grow pipe buffers on demand as a ring",
        what: "Pipes allocate as data arrives, like Linux, instead of one fixed 64 KiB buffer each.",
        date: "2026-10-29",
        href: "https://github.com/emscripten-core/emscripten/pull/28098",
      },
      {
        state: "reported",
        repo: "emscripten-core/emscripten",
        number: 28073,
        fixedIn: 28075,
        title: "The epoll listener schedules one setImmediate per readiness edge",
        what: "Busy sockets could exhaust workerd's 10,000-timer cap; the wakes are now coalesced.",
        date: "2026-10-26",
        href: "https://github.com/emscripten-core/emscripten/issues/28073",
      },
      {
        state: "merged",
        repo: "cloudflare/workers-rs",
        number: 1097,
        added: 96,
        removed: 7,
        title: "fix(r2): read Object::range() as a plain JS object",
        what: "R2 range reads reach Rust intact.",
        date: "2026-10-30",
        href: "https://github.com/cloudflare/workers-rs/pull/1097",
      },
    ],
    landmark: "cloud",
  },
  {
    slug: "di-studio",
    title: "di.studio",
    tagline: "Booking and an owner's panel for barbershops, sold through the look of the shop.",
    outcome:
      "A booking site and owner's panel for appointment-based businesses, starting with barbers in Portugal.",
    role: "Design and engineering",
    year: "2026",
    stack: ["React", "TanStack Start", "Supabase"],
    focus: [{ label: "Booking without an account" }, { label: "Owner's panel" }],
    highlights: [
      "Booking: a client marks a time in under a minute without creating an account.",
      "Owner's panel: agenda, clients, services, team and locations in one place, in light and dark.",
    ],
    links: [{ label: "Live landing", href: "https://di-studio-landing.vercel.app" }],
    emblem: "distudio",
    image: null,
    video: null,
    product: {
      src: "/di-studio/landing.jpg",
      alt: "The di.studio landing page: Eleva o teu negócio, over the D among orbiting planets.",
      href: "https://di-studio-landing.vercel.app",
      label: "di-studio-landing.vercel.app",
    },
    stats: [
      { value: "10+", label: "barbershops in Portugal" },
      { value: "€30k+", label: "revenue in about two months" },
    ],
    landmark: "di",
  },
];

/** Focus areas with the URL of their write-up when it is public here (null otherwise). */
export function focusLinks(project: Project) {
  return project.focus.map((f) => ({ label: f.label, href: f.post ? postHref(f.post) : null }));
}

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
