// Posts on the blog that the site links to. Mirror `live` with the post's `draft` flag on the blog:
// a post that is not live yet is linked only when NEXT_PUBLIC_SHOW_DRAFTS=1 (local and preview),
// so production never links to a 404.

import { profile } from "./profile";

export type PostRef = { slug: string; title: string; series: SeriesKey; live: boolean };

export const series = {
  turborepo: { title: "Turborepo, upstream", blurb: "How an agent loop found cache and hashing bugs, and what got merged." },
  agents: { title: "Agents on machines you control", blurb: "Who may act, where the agent runs, and how Ravi contains it." },
} as const;
export type SeriesKey = keyof typeof series;

export const posts: PostRef[] = [
  { slug: "stress-testing-turborepo-rust-go-python", title: "Stress-testing Turborepo's Rust, Go and Python support", series: "turborepo", live: false },
  { slug: "turbo-skipped-task-whose-inputs-changed", title: "Why did Turbo skip a task whose inputs changed?", series: "turborepo", live: false },
  { slug: "turbo-cache-hit-wrong-outputs", title: "Why did Turbo say cache hit and leave my outputs wrong?", series: "turborepo", live: false },
  { slug: "what-a-maintainer-needs-from-agent-found-bugs", title: "What a maintainer needs from agent-found bugs", series: "turborepo", live: false },
  { slug: "bug-hunting-agent-loop-on-one-laptop", title: "How do you run a bug-hunting agent loop on one laptop?", series: "turborepo", live: false },
  { slug: "who-is-typing-agents-shells-and-money", title: "Who is typing? Agents, shells and money", series: "agents", live: true },
  { slug: "where-does-the-agent-live", title: "Where does the agent live? Docker, sandboxes and the bus", series: "agents", live: false },
  { slug: "ravi-sandboxes-context-shared-data-security", title: "Ravi sandboxes: context, shared data and security", series: "agents", live: false },
];

const showDrafts = process.env.NEXT_PUBLIC_SHOW_DRAFTS === "1";

/** The post's URL on the blog, or null when there is no blog yet or the post isn't public here. */
export function postHref(slug: string): string | null {
  const post = posts.find((p) => p.slug === slug);
  if (!profile.writing || !post || (!post.live && !showDrafts)) return null;
  return `${profile.writing}/posts/${slug}`;
}

/** Linkable posts per series, in reading order. */
export const writingBySeries = (Object.keys(series) as SeriesKey[])
  .map((key) => ({
    key,
    ...series[key],
    posts: posts
      .filter((p) => p.series === key)
      .map((p) => ({ ...p, href: postHref(p.slug) }))
      .filter((p): p is PostRef & { href: string } => p.href !== null),
  }))
  .filter((s) => s.posts.length);
