# Content still needed from Pedro

Everything on the site comes from `content/profile.ts`, `content/projects.ts` and `content/openSource.ts`.
Rule: the site shows clickable proof; the CV (`public/pedro-rosalba-cv.pdf`, built from `~/CV/CV.tex`) holds the numbers.

Done (feature/real-experience): positioning and About from the CV, contact email + LinkedIn, CV download,
Education & Honors, Experience with proof links, Open source stop, gateways = Ravi, Turborepo, Cran.

- [x] Talks with public pages: Invisible Garden 2025 (HDP mentor session) and the Devin Meetup Rio 2026 → About
- [ ] Ethereum Brasil 2025 talk and the Herodotus podcast: no public page or recording found — send links if they exist
- [ ] OnlyDust closed down (profile 503s); the maintainer line lives on the CV only now
- [ ] Ravi YouTube video (Portuguese) → `projects[ravi].youtube = { id, start, end, language: "PT" }`
- [ ] Podcast link(s) → `content/media.ts` (YouTube gets a click-to-play clip)
- [ ] Herodotus product links → `content/experience.ts` proof (only once Pedro confirms he can claim them)
- [ ] Featured posts in `content/media.ts` must be published on the blog (draft: false)
- [ ] X posts about Risklayer (only as links, never "I built this")
- [ ] A real photo for About (`public/…` + `profile.about.photo`)
- [ ] Blog URL → `NEXT_PUBLIC_BLOG_URL` (turns on Writing in the nav, the Open source stop, Contact and the project panels)
- [ ] Production domain (`NEXT_PUBLIC_SITE_URL`) for canonical URLs, sitemap and Open Graph
- [ ] Refresh PR counts in `content/openSource.ts` when Cloudflare PRs merge
