// Single source of truth for projects.
// Drives: home project cards, /projects/[slug] pages, metadata, JSON-LD, sitemap
// and the 3D gateways (order = gateway order along the causeway).
// Every fact below can be checked from the linked repositories and PRs.

import { profile } from "./profile";
import type { YouTubeClip } from "./media";

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
  /** Click-to-load YouTube clip shown in the panel. */
  youtube?: YouTubeClip & { language?: string };
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
    slug: "cloudflare",
    title: "Cloudflare Workers, upstream",
    outcome:
      "Sixteen fixes to Cloudflare's Workers stack, in review: ten to workers-rs, the Rust SDK, and six to workerd's TypeScript types. Each one is a binding that panicked, dropped data or described the wrong type.",
    role: "Open-source contributor",
    year: "2026",
    stack: ["Rust", "wasm-bindgen", "TypeScript", "workerd"],
    highlights: [
      "KV and Queues: Rust maps were serialised as {}; they now reach JavaScript as JSON objects.",
      "R2: Object::range() panicked on a plain JS object, and listed objects without metadata failed to parse.",
      "Durable Objects: alarm options are sent in camelCase, and Storage gains its get options (allowConcurrency, noCache).",
      "workerd types: ArrayBufferView inputs, missing cloudflare:workers exports, and a bulk getWithMetadata result without cacheStatus.",
    ],
    links: [
      { label: "workers-rs PRs", href: "https://github.com/cloudflare/workers-rs/pulls?q=is%3Apr+author%3APedroRosalba" },
      { label: "workerd PRs", href: "https://github.com/cloudflare/workerd/pulls?q=is%3Apr+author%3APedroRosalba" },
      ...writing,
    ],
    video: null,
    landmark: "portal",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
