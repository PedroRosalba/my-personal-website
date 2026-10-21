// Community: talks, mentoring, the league and teaching. A YouTube entry renders as a still that loads
// the player on click (youtube-nocookie), cut to `start`–`end` seconds when set.

export type YouTubeClip = { id: string; start?: number; end?: number };

export type CommunityItem = {
  title: string;
  where: string;
  period: string;
  href?: string;
  image?: string;
  youtube?: YouTubeClip;
  language?: string;
};

export const community: CommunityItem[] = [
  // Podcast: add here once Pedro sends the link, e.g.
  // { title: "…", where: "Podcast", period: "2025", href: "https://…", youtube: { id: "…", start: 600, end: 780 } },
  {
    title: "Talk: goroutines vs Tokio in agent harnesses",
    where: "Devin Meetup, Rio de Janeiro",
    period: "2026",
    href: "https://luma.com/l2f11j2p",
    image: "/shots/devin.jpg",
  },
  {
    title: "Mentor: Herodotus Data Processor session",
    where: "Invisible Garden, Buenos Aires",
    period: "2025",
    href: "https://luma.com/porsxgac",
    image: "/shots/invisible.jpg",
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
