// Community: talks, mentoring, the league and teaching.
// - A `youtube` entry renders as a still that loads the YouTube player on click (youtube-nocookie),
//   cut to `start`–`end` seconds when set.
// - A `video` entry is self-hosted and plays in the site's own theater player (components/html/TalkPlayer).
//   Media paths are relative to MEDIA_BASE: /media locally (gitignored), the R2 bucket in production.

export type YouTubeClip = { id: string; start?: number; end?: number };

export type VideoChapter = { start: number; title: string };

export type TalkVideo = {
  /** Stable id: the resume position and deep links key off it. */
  id: string;
  src: string;
  poster: string;
  /** Seconds, of the full file. Known up front so the card can show it before anything loads. */
  duration: number;
  /** Play only this window of the file: a cut without re-encoding. */
  clip?: { start: number; end: number };
  chapters?: VideoChapter[];
  captions?: { src: string; lang: string; label: string }[];
  /** Normalized loudness per second of the file (0–1), as JSON `{ perSecond: number[] }`: drives the Aurora timeline. */
  energy?: string;
  /** Scrub-preview sprite sheets: one `w`×`h` frame every `every` seconds, `cols`×`rows` per sheet. */
  thumbs?: { sheets: string[]; every: number; cols: number; rows: number; w: number; h: number };
};

/** A small living emblem drawn in the world's palette (components/html/EventEmblem), used instead of a share image.
 * Events, roles, the builds under a role and project cards all use the same frame. */
export type EmblemKind =
  | "rio"
  | "obelisk"
  | "herodotus"
  | "daloc"
  | "hdp"
  | "ravi"
  | "turborepo";

export type CommunityItem = {
  title: string;
  where: string;
  period: string;
  href?: string;
  image?: string;
  emblem?: EmblemKind;
  /** A sentence or two, shown in the theater player beside the video. */
  summary?: string;
  youtube?: YouTubeClip;
  video?: TalkVideo;
  language?: string;
};

export const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "/media").replace(/\/$/, "");
export const media = (path: string) => `${MEDIA_BASE}/${path}`;

const voxDomusThumbs = Array.from({ length: 4 }, (_, i) => media(`vox-domus/thumbs-${String(i + 1).padStart(2, "0")}.jpg`));

export const community: CommunityItem[] = [
  {
    title: "Podcast: real estate meets blockchain",
    where: "Vox Domus Podcast, with Rio de Janeiro real estate investors",
    period: "2026",
    language: "PT",
    summary:
      "Guilherme hosts Pedro Rosalba (blockchain engineering) and Sérgio Rotenberg (real estate investment) on renovating Rio's older buildings, house flipping, tokenizing property with ERC-20 and ERC-721, and whether property registries can move on-chain.",
    video: {
      id: "vox-domus",
      src: media("vox-domus/episode-720p.mp4"),
      poster: media("vox-domus/poster.jpg"),
      duration: 3519.75,
      chapters: [
        { start: 0, title: "Introductions" },
        { start: 151, title: "Engineering turns property into an asset" },
        { start: 282, title: "Investing without technique is a bet" },
        { start: 536, title: "What a blockchain actually is" },
        { start: 790, title: "Tokens, NFTs and proving ownership" },
        { start: 952, title: "Property becomes technology" },
        { start: 1054, title: "The investor's view: the gain is in the purchase" },
        { start: 1225, title: "Price is not value" },
        { start: 1641, title: "The engineer's view: old buildings, hidden risk" },
        { start: 1786, title: "Tokens as fractions of real property" },
        { start: 2016, title: "Smart contracts aren't magic" },
        { start: 2141, title: "How crypto markets price and lend" },
        { start: 2276, title: "Fractionalizing a property on-chain" },
        { start: 2543, title: "Collective financing: three models" },
        { start: 2735, title: "Registries, cartórios and the law" },
        { start: 2875, title: "Privacy and Drex" },
        { start: 2984, title: "The future of buying property" },
        { start: 3237, title: "Why the real world is messy" },
        { start: 3336, title: "Closing thoughts" },
      ],
      energy: media("vox-domus/energy.json"),
      captions: [{ src: media("vox-domus/captions-pt.vtt"), lang: "pt", label: "Português" }],
      thumbs: { sheets: voxDomusThumbs, every: 10, cols: 10, rows: 10, w: 160, h: 90 },
    },
  },
  {
    title: "Talk: goroutines vs Tokio in agent harnesses",
    where: "Devin Meetup, Rio de Janeiro",
    period: "2026",
    href: "https://luma.com/l2f11j2p",
    emblem: "rio",
  },
  {
    title: "Mentor: Herodotus Data Processor session",
    where: "Invisible Garden, Buenos Aires",
    period: "2025",
    href: "https://luma.com/porsxgac",
    emblem: "obelisk",
  },
  {
    title: "Founder: Rio de Janeiro University Blockchain League",
    where: "Workshops, hackathons and meetups",
    period: "2024 – 2026",
    href: "https://linktr.ee/liga_carioca_de_blockchain",
  },
  {
    title: "Math Olympiad Instructor",
    where: "Colégio e Curso Pensi",
    period: "2023 – 2025",
  },
];
