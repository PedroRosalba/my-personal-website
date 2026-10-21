// Talks, podcasts and selected writing. A YouTube entry renders as a still that loads the player
// on click (youtube-nocookie), cut to `start`–`end` seconds when set; anything else is a link card.

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
