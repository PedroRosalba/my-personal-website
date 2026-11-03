# Threshold — overnight build log

Branch: `immersive-threshold-overnight` (never merged, never rebased). Docs: `.claude/skills/immersive-portfolio/`.
Current work: `feature/real-experience` (PR #6). Status and deploy notes: `docs/STATUS.md`.

## Done
- Docs: world identity (Eclipse, fog sea, colonnade, sky), Ethereum landmark, E1 reference.
- Site: Next.js App Router, server-rendered sections, `/projects/[slug]` (static), intercepted project panel,
  metadata, Open Graph basics, JSON-LD (Person, WebSite, SoftwareSourceCode, BreadcrumbList), sitemap, robots.
- Content: `content/profile.ts`, `content/projects.ts`, `content/journey.ts` — one source for HTML, pages and 3D.
  Projects are real (from public GitHub repos). Unknown personal facts are empty, see `CONTENT_TODO.md`.
- 3D (`components/scene`): Eclipse + corona, stars, ring arc, fog sea, colonnade, causeway, transit gateway,
  About stele, three project gateways (ETH diamond on the Starknet project), final gateway, traveller.
  Camera and figure are derived from native scroll; nav jumps become a short dash; reveal pushes into the gateway.
- Fallbacks: static CSS backdrop before load / without WebGL (`?nowebgl` forces it), reduced-motion snapping.
- Verified with real screenshots (desktop 1440×900, mobile 390×844): all stations, reveal, no-WebGL, no-JS content,
  direct project URL, keyboard tab order, Enter to open, Esc/Close/Back to close.

## Iteration 2
- Reviewed motion frames (transit corridor, nav dash, Contact settle).
- Transit corridor now has faint ribs of light that wake only while the traveller is inside (V2 language).
- Hairline seam above the transit and final arches; Contact stop moved back so the Eclipse wraps the final gateway.
- Experience and Contact are now distinct stops; Open Graph image and README added.

## Iteration 3
- Traveller: walk cycle verified in motion; no walk cycle during a nav dash; becomes a dark silhouette and faces
  the camera at Contact.
- Stops are now reached when a section is aligned to the top of the viewport, so nav jumps land exactly on a stop
  (they used to land ~8% short, leaving the traveller half-turned at Contact).
- Mobile verified at 390 and 360 wide (no horizontal overflow); stations are one screen tall on mobile.
- Reduced motion verified (camera snaps, no dash); ~60 fps in headless Chrome at 1440×900.

## Iteration 4 — background light wave (branch `feature/pillar-light-wave`, on top of PR #2)
- One slow swell of the accent rolls through the whole background toward the traveller (`LIGHT_WAVE` in
  `components/scene/lightWave.ts`: length, speed, shape, ground, pillars, haze). The fog sea brightens as the
  crest crosses it and the colonnade monoliths wake as it passes them, so the background rises and falls together,
  about one beat every 7–8 s. Shared GLSL and uniforms keep the sea and the monoliths in step; the clock is
  `frame.time`, so it freezes under reduced motion.
- Monolith glow is injected into the existing standard material via `onBeforeCompile` and added after the scene
  fog through a thinner haze; the monoliths stand deep enough in the fog to lose it otherwise.
- Rejected on the way (Pedro): per-pillar vertical bands and anything on the project gateways. The motion belongs
  to the background and the ground, never the landmarks.
- Lesson: never put a non-linear function of `uv`/`position` in the vertex shader for a box — every corner has
  u ∈ {0, 1}, so the varying interpolates flat. Compute it in the fragment shader.

## Iteration 5 — the traveller walks into the project (branch `feature/traveller-walks-in`, on top of PR #3)
- Opening a project no longer hides the traveller: he leaves the causeway, crosses the forecourt, steps into
  the arch and dissolves violet into the portal glow, while the camera swings round and the panel slides in
  (2.2 s walk, content never waits). `frame.walk` (0→1) is advanced by the Rig; `Figure.tsx` follows a
  Catmull-Rom way-in built from the figure's position when the reveal starts (or the gateway's stop, if he was
  far away). Closing the panel plays the same way in reverse: he fades back in at the arch and walks out to the
  causeway while the camera returns. Reduced motion keeps the old cut.
- The reveal camera stands a little further back and lower (25 m instead of 19 m) so the forecourt and the walk
  are in frame; Pedro found the old framing too tight for the animation. Gateways and the panel are untouched.

## Iteration 6 — real experience (branch `feature/real-experience`, on top of PR #4)
- Content from the CV, not drafts: positioning, About, Education & Honors (IMPA Tech, ETHGlobal, ETHDenver,
  olympiads), Experience (eNor, Herodotus, Mediolano, Blockchain League, Pensi) with proof links per row.
  eNor shows "Closed source. Full scope on the CV." and links the PDF.
- Gateways are now Ravi, Turborepo (upstream fixes) and Cran (ETHDenver 2025, ETH landmark). The three old
  repos are gone from the causeway. Daloc and Risklayer are deliberately absent (Pedro can't claim them).
- New `open-source` stop between the last gateway and Experience (`content/openSource.ts`), its own camera stop.
- CV PDF at `/pedro-rosalba-cv.pdf`, linked from the nav, Experience and Contact. Writing links appear only when
  `NEXT_PUBLIC_BLOG_URL` is set.
- Nav: Education, Writing and Skills hide on phones; Writing and Skills also hide at 761–1100 px.
- Verified 1440×900, 1024×768, 390×844: every station fits one screen, no horizontal scroll, no console errors.

## Iteration 7 — proof layout (2026-10-21)
- Order: hero → experience (Herodotus, then "also": eNor, Mediolano) → projects (Ravi, Turborepo, Cloudflare) →
  writing → community → education & awards (hackathons are dropdowns) → contact. No numbers on projects.
- Gateway landmarks: `TurboMark` (outer arcs spin up near the gateway and on open) and `CloudMark` (orange sparks
  assemble into a cloud near the gateway, swirl on open). Ravi keeps the plain portal.
- Fix: opening a project (gateway click, list link or "Next") scrolls the page under the panel to that project's
  station, and closing lands there too, so the card and the gateway always agree.

## Iteration 8 — Herodotus gateway (2026-10-21)
- Four gateways: Herodotus (Ethereum diamond, the only one with the portal's tunnel of light), Ravi (`RobotMark`),
  Turborepo (`TurboMark`), Cloudflare (`CloudMark`). `Gateway portal={false}` keeps the opening dark.
- Copy rule: contributions say what improved and why, never "fixed X"; no review status anywhere.

## Next (highest value first)
1. Content from Pedro (see CONTENT_TODO.md): podcast, Risklayer capture, blog URL, domain.
2. Optional polish: fog sea billows near the camera at Arrival; Education/Experience 3D landmarks (post-MVP).
3. Real-device check (touch scrolling on iOS/Android, low-power GPU).

## QA
`next build && next start -p 3210`, then the Playwright scripts kept outside the repo (scratchpad) drive Chrome.
MotionSites MCP: 1 of 3 calls used; 2 remain, none needed so far.
