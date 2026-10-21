# Content still needed from Pedro

Everything on the site comes from `content/profile.ts`, `content/projects.ts` and `content/openSource.ts`.
Rule: the site shows clickable proof; the CV (`public/pedro-rosalba-cv.pdf`, built from `~/CV/CV.tex`) holds the numbers.

Done (feature/real-experience): positioning and About from the CV, contact email + LinkedIn, CV download,
Education & Honors, Experience with proof links, Open source stop, gateways = Ravi, Turborepo, Cran.

- [ ] Talk / podcast URLs (Invisible Garden at Devconnect 2025, Ethereum Brasil 2025, Devin Rio meetup, Herodotus podcast) → proof links on the Herodotus row, or a "Transmissions" stop
- [ ] Ravi demo videos → `projects[ravi].video`
- [ ] X posts about Risklayer (only as links, never "I built this")
- [ ] A real photo for About (`public/…` + `profile.about.photo`)
- [ ] Blog URL → `NEXT_PUBLIC_BLOG_URL` (turns on Writing in the nav, the Open source stop, Contact and the project panels)
- [ ] Production domain (`NEXT_PUBLIC_SITE_URL`) for canonical URLs, sitemap and Open Graph
- [ ] Refresh PR counts in `content/openSource.ts` when Cloudflare PRs merge
