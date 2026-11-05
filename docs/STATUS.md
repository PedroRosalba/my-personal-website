# Where the portfolio stands — 2026-10-21

Branch to deploy: **`feature/portfolio-release`** (PR #7), the same tree as `feature/real-experience` (PR #6) with one commit per file. It is stacked on `feature/traveller-walks-in` (PR #4) and
`feature/pillar-light-wave` (PR #3), so deploying it ships all three: the light swell, the traveller walking into
gateways and everything below. `main` has none of this yet.

## Deploying

**Development environment (what Pedro uses now).** Every push to `feature/portfolio-release` builds a Vercel
preview, and this URL always points at the latest one:
https://my-personal-website-git-feature-3c2886-pedro-rosalbas-projects.vercel.app
Public: Vercel Authentication is off for this project's previews (turned off 2026-10-21), so the link works for anyone.

**Production** tracks `main`, which has no app yet (its 404 on 2026-10-21 came from building `main`). Production is
left alone for now; `vercel.json` declares Next.js, because the project was created with the "Other" preset.

| Variable | Where | Value / effect |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Preview (this branch) and Production | set; canonical URLs, sitemap, Open Graph |
| `BLOG_ORIGIN` | Preview and Production | the blog deployment's own URL; `/blog/*` is rewritten there (`next.config.ts`) |
| `NEXT_PUBLIC_BLOG_URL` | Preview and Production | `/blog`; turns on every Writing link |
| `NEXT_PUBLIC_SHOW_DRAFTS` | local, preview; production while the blog ships drafts | `1` links unpublished posts |
| `DEV_ORIGINS` | local only | extra hostnames for hot reload, e.g. a Tailscale name |

Checks run on the last commit: `npm run typecheck` and `npm run build` pass (12 static pages). Headless Chrome at
1440×900 and 390×844: every stop fits one screen, no horizontal scroll, no console errors.

## What the site shows now

Order along the causeway (each item is a scroll stop; `content/journey.ts`):

1. **Hero** — "A native problem solver, across the stack." Former mathlete, then cryptography and blockchain, now
   core software. CV button.
2. **Experience** — Herodotus first, with its H as a living cover (what Pedro did, and a link into the
   Herodotus gateway; the Invisible Garden session lives in Community). Under it, "Builds I worked on": Daloc (app and docs) and
   hdp-cairo (repo and PRs) as rows, each with its own cover. Then **Also**: eNor (one line, closed source, scope on the CV) and Mediolano (PR links),
   as rows with covers. Covers are `EventEmblem` kinds (`components/html/EventEmblem.tsx`); Risklayer is gone (the
   site is down).
3. **Selected work** — four gateways, each with a card (one-line tagline, living cover, "Focused on" chips that link to
   the matching blog post when it is public) and a panel that opens the same way for all four (no cover: the card already showed it): the
   live product as a window tinted violet (true colours on hover, links to the site), then **Receipts**, two or three
   real PRs as cards (status, repo and number, size, what it fixed, date). Then meta, focus, highlights, links. Data:
   `product` and `receipts` in `content/projects.ts`; components `ProductWindow.tsx` and `Receipts.tsx`.
   - **Herodotus** — Ethereum diamond. Card and panel use the Daloc cover; the panel's window is daloc.xyz.
   - **Ravi** — a floating robot that wakes as you arrive. The card's cover is the same robot as a living emblem;
     the panel's window is ravi.bot. Links to ravi.bot, the fork and the upstream PRs.
   - **Turborepo** — a ring of blue-to-pink arcs that spins up near the gateway and on open. The card's cover is
     a speedometer emblem; the panel's window is turborepo.dev.
   - **Cloudflare Workers** — orange sparks that assemble into a cloud near the gateway. The card's
     cover is that cloud in light: Rust in the big cloud, a JS tile in the small one, a map entry crossing the cut. The panel's window is the Workers product page.
4. **Writing** — the blog's two series (Turborepo upstream, Agents on machines you control), linking only
   published posts in production.
5. **Community** — Devin Meetup Rio talk (2026), Invisible Garden mentor session (2025), Blockchain League founder,
   olympiad instructor.
6. **Education** — IMPA Tech (2024–2025), IMC honorable mention, 12th in the Brazil IMO selection test, OBM medals.
   **Hackathon awards** as dropdowns: QuantumLeap (ETHGlobal Prague 2025), Cran (ETHDenver 2025), Goals
   (ETHGlobal Brussels 2024), with prizes from the certificates and Devfolio.
7. **Contact** — email, GitHub, LinkedIn, X (@0xrosalbito), CV download, Writing.

Rules the content follows: the site shows proof a visitor can click; numbers stay on the CV
(`public/pedro-rosalba-cv.pdf`, built from `~/CV/CV.tex`); contributions describe what improved and why, not
"fixed X"; nothing claims a review status.

## What changed today

The branch history is one commit per changed file (36 files), in build order: tooling, assets, content, 3D scene,
HTML components, page and styles, docs. `git log --oneline feature/traveller-walks-in..` reads as the change list.

In the order the work happened: real content from the CV and the CV PDF; talks, Cran placings, X; hot reload over
Tailscale; experience first; snapshots and focus chips linked to posts; Herodotus leading, Hackathons and
Community; Turborepo and Cloudflare landmarks, awards dropdowns and the panel/scroll fix; the Herodotus gateway,
the Ravi robot and the contribution wording.

**Panel/scroll fix (`c7f25ed`).** Opening a project from a gateway, the list or "Next" used to leave the page on
whatever stop it was at, so closing showed a different card from the gateway just seen. The page now moves under
the panel to that project's stop, and closing lands there (`components/html/ProjectPanel.tsx`).

## The blog (separate repo)

Served at `/blog` on this domain (Next.js multi-zones): the blog has `basePath: "/blog"` and this app rewrites
`/blog/*` to `BLOG_ORIGIN`. Same origin, so moving between the two is a cross-document view transition
(`@view-transition` in both `globals.css`, mirrored): the name holds, the menus swap, the world goes out of focus.
Links into the blog must stay plain `<a>`, never `<Link>`.

Private GitHub repo `PedroRosalba/blog`; `feature/oss-posts` is its default and Vercel production branch. Every post is
published (`draft: false`). The production deployment is `https://blog-pedro-rosalbas-projects.vercel.app`.

When a post is published on the blog, set its `live: true` in `content/writing.ts` here so production links it.

## Open items

- [ ] Podcast link(s) → `community` in `content/media.ts` (a YouTube link becomes a click-to-play clip)
- [ ] A Cloudflare write-up (then add `post` to its focus chips)
- [ ] Commits from this session are unsigned (the SSH signing key needed its passphrase): `ssh-add
      ~/.ssh/id_ed25519_signing` before the next ones
- [ ] Merge order for `main`: #3 → #4 → #6
