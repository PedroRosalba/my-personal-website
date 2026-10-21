// Talks, podcasts and selected writing. A YouTube entry renders as a still that loads the player
// on click (youtube-nocookie), cut to `start`–`end` seconds when set; anything else is a link card.

import { profile } from "./profile";

export type YouTubeClip = { id: string; start?: number; end?: number };

export type MediaItem = {
  kind: "talk" | "podcast";
  title: string;
  where: string;
  period: string;
  href: string;
  youtube?: YouTubeClip;
  language?: string;
};

export const media: MediaItem[] = [
  // Podcast: add here once Pedro sends the link, e.g.
  // { kind: "podcast", title: "…", where: "…", period: "2025", href: "https://…", youtube: { id: "…", start: 600, end: 780 } },
  {
    kind: "talk",
    title: "Herodotus Data Processor, mentor session",
    where: "Invisible Garden, Buenos Aires",
    period: "2025",
    href: "https://luma.com/porsxgac",
  },
  {
    kind: "talk",
    title: "Goroutines vs Tokio in agent harnesses",
    where: "Devin Meetup, Rio de Janeiro",
    period: "2026",
    href: "https://luma.com/l2f11j2p",
  },
];

// Posts shown on the site. Each must be published (draft: false) on the blog, or its link 404s in production.
const featuredPosts = [
  { slug: "who-is-typing-agents-shells-and-money", title: "Who is typing? Agents, shells and money", series: "Ravi" },
  { slug: "turbo-skipped-task-whose-inputs-changed", title: "Why did Turbo skip a task whose inputs changed?", series: "Turborepo" },
  { slug: "turbo-cache-hit-wrong-outputs", title: "Why did Turbo say cache hit and leave my outputs wrong?", series: "Turborepo" },
];

export const writing = profile.writing
  ? featuredPosts.map((p) => ({ ...p, href: `${profile.writing}/posts/${p.slug}` }))
  : [];
