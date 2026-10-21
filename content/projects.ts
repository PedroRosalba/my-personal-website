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
  /** 3D hint only: which landmark the gateway carries. */
  landmark: "portal" | "eth";
};

export const projects: Project[] = [
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
      { label: "Repository", href: "https://github.com/PedroRosalba/ravi" },
      { label: "PRs upstream", href: "https://github.com/filipexyz/ravi/pulls?q=is%3Apr+author%3APedroRosalba" },
    ],
    image: {
      src: "/shots/ravi-github.jpg",
      alt: "Ravi on GitHub: run AI agents on machines you control.",
      href: "https://github.com/filipexyz/ravi",
    },
    video: null,
    landmark: "portal",
  },
  {
    slug: "turborepo",
    title: "Turborepo",
    tagline: "Active contributor to Turborepo's Rust core: cache correctness and hashing.",
    outcome:
      "Merged fixes to Turborepo's Rust core, most of them places where the cache said hit, or skipped a task, when it should not have.",
    role: "Open-source contributor",
    year: "2026",
    stack: ["Rust", "Cargo", "uv", "pnpm", "Git internals"],
    focus: [
      { label: "Cache correctness", post: "turbo-cache-hit-wrong-outputs" },
      { label: "Affected detection and hashing", post: "turbo-skipped-task-whose-inputs-changed" },
      { label: "Rust, Go and Python support", post: "stress-testing-turborepo-rust-go-python" },
    ],
    highlights: [
      "Cargo.lock changes are attributed to the crates whose dependencies changed, instead of invalidating the whole workspace.",
      "File hashing matches git's text=auto binary detection, so the same checkout hashes the same everywhere.",
      "Cached symlinks are restored when outputs already exist on disk, and the restore manifest is written before a local hit returns.",
      "Python and Rust tool configuration (ruff, pytest, uv, Clippy) is part of the task hash, and survives turbo prune.",
    ],
    links: [
      {
        label: "Merged PRs",
        href: "https://github.com/vercel/turborepo/pulls?q=is%3Apr+author%3APedroRosalba+is%3Amerged",
      },
    ],
    image: {
      src: "/shots/turborepo-cache-hit.jpg",
      alt: "Diagram: both cache bugs lived in the shortcut that skips opening the archive.",
      post: "turbo-cache-hit-wrong-outputs",
    },
    video: null,
    landmark: "portal",
  },
  {
    slug: "cloudflare",
    title: "Cloudflare Workers",
    tagline: "Fixes for the Workers Rust SDK and the runtime's TypeScript types.",
    outcome:
      "Fixes to Cloudflare's Workers stack: workers-rs, the Rust SDK, and workerd's TypeScript types. Each one is a binding that panicked, dropped data or described the wrong type.",
    role: "Open-source contributor",
    year: "2026",
    stack: ["Rust", "wasm-bindgen", "TypeScript", "workerd"],
    focus: [{ label: "Rust SDK bindings" }, { label: "Runtime type definitions" }],
    highlights: [
      "KV and Queues: Rust maps were serialised as {}; they now reach JavaScript as JSON objects.",
      "R2: Object::range() panicked on a plain JS object, and listed objects without metadata failed to parse.",
      "Durable Objects: alarm options are sent in camelCase, and Storage gains its get options (allowConcurrency, noCache).",
      "workerd types: ArrayBufferView inputs, missing cloudflare:workers exports, and a bulk getWithMetadata result without cacheStatus.",
    ],
    links: [
      { label: "workers-rs PRs", href: "https://github.com/cloudflare/workers-rs/pulls?q=is%3Apr+author%3APedroRosalba" },
      { label: "workerd PRs", href: "https://github.com/cloudflare/workerd/pulls?q=is%3Apr+author%3APedroRosalba" },
    ],
    image: null,
    video: null,
    landmark: "portal",
  },
];

/** Focus areas with the URL of their write-up when it is public here (null otherwise). */
export function focusLinks(project: Project) {
  return project.focus.map((f) => ({ label: f.label, href: f.post ? postHref(f.post) : null }));
}

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
