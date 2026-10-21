// Upstream work, one row per project. Counts come from GitHub (author:PedroRosalba)
// and are checked when this file changes — update them with the links.

export type OpenSourceItem = {
  project: string;
  what: string;
  count: string;
  href: string;
};

const prs = (repo: string, state = "") =>
  `https://github.com/${repo}/pulls?q=is%3Apr+author%3APedroRosalba${state ? `+is%3A${state}` : ""}`;

export const openSource: OpenSourceItem[] = [
  {
    project: "Turborepo",
    what: "Cache correctness and lockfile fixes in the Rust core",
    count: "16 merged",
    href: prs("vercel/turborepo", "merged"),
  },
  {
    project: "Cloudflare workers-rs",
    what: "KV, R2, Queues and Durable Objects bindings in the Rust SDK",
    count: "10 in review",
    href: prs("cloudflare/workers-rs"),
  },
  {
    project: "Cloudflare workerd",
    what: "Type definitions for the Workers runtime",
    count: "6 in review",
    href: prs("cloudflare/workerd"),
  },
  {
    project: "hdp-cairo",
    what: "Injected state and Patricia trie reads for Herodotus' ZK co-processor",
    count: "5 merged",
    href: prs("HerodotusDev/hdp-cairo", "merged"),
  },
  {
    project: "Ravi",
    what: "Permissions, secrets and sandbox isolation",
    count: "Maintainer",
    href: prs("filipexyz/ravi"),
  },
  {
    project: "OnlyDust",
    what: "Maintainer of a Starknet project: issues, applicants, code review",
    count: "Maintainer",
    href: "https://app.onlydust.com/users/PedroRosalba/overview",
  },
];
