// Posts on the blog that the site links to. Mirror `live` with the post's `draft` flag on the blog:
// a post that is not live yet is linked only when NEXT_PUBLIC_SHOW_DRAFTS=1 (local and preview),
// so production never links to a 404.

import { profile } from "./profile";

export type PostRef = { slug: string; title: string; series: SeriesKey; live: boolean };

export const series = {
  turborepo: { title: "Turborepo, upstream", blurb: "Cache keys, change detection and the remote cache for Cargo, Go and uv." },
  agents: { title: "Agents on machines you control", blurb: "Who may act, where the agent runs, and how Ravi contains it." },
} as const;
export type SeriesKey = keyof typeof series;

export const posts: PostRef[] = [
  { slug: "turbo-native-cache-keys", title: "When the Cache Key Lies", series: "turborepo", live: true },
  { slug: "turbo-discovery-and-change-detection", title: "How Turbo Knows What Changed", series: "turborepo", live: true },
  { slug: "turbo-remote-cache-native-toolchains", title: "The Remote Cache Under Cargo, Go and uv", series: "turborepo", live: true },
  { slug: "who-is-typing-agents-shells-and-money", title: "Who Is Typing?", series: "agents", live: true },
  { slug: "where-does-the-agent-live", title: "Where Does the Agent Live?", series: "agents", live: true },
  { slug: "ravi-sandboxes-context-shared-data-security", title: "What a Ravi Sandbox Needs", series: "agents", live: true },
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
