# Content still needed from Pedro

Content lives in `content/`: `profile.ts` (hero, education, honors, contact), `experience.ts`, `projects.ts`
(gateways), `hackathons.ts`, `media.ts` (community), `writing.ts` (blog posts the site links to).
Rule: the site shows clickable proof; the CV (`public/pedro-rosalba-cv.pdf`, built from `~/CV/CV.tex`) holds the numbers.
Full status: `docs/STATUS.md`.

- [ ] Podcast link(s) → `community` in `content/media.ts` (YouTube gets a click-to-play clip, cut to start/end seconds)
- [ ] Risklayer snapshot or screen recording → Herodotus `gallery` in `content/projects.ts`
      (risklayer.online refused connections on 2026-10-21; idea: a muted loop inside the Herodotus arch)
- [ ] Cloudflare snapshot → `projects[cloudflare].image`; Cloudflare write-up → `post` on its focus chips
- [ ] Blog URL → `NEXT_PUBLIC_BLOG_URL`; when a post is published, `live: true` in `content/writing.ts`
- [ ] A real photo, if wanted (no slot on the page right now)
- [ ] Production domain → `NEXT_PUBLIC_SITE_URL`
- [ ] Ethereum Brasil 2025 talk: no public page or recording found — send a link if one exists
