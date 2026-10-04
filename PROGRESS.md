# Threshold — overnight build log

Branch: `immersive-threshold-overnight` (never merged, never rebased). Docs: `.claude/skills/immersive-portfolio/`.

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

## Next (highest value first)
1. Arrival: the transit monolith is a plain dark slab — add restrained surface detail; let more corona show.
2. Traveller: check the Contact turn and walk cycle in motion; it should read as a silhouette at Contact.
3. Motion pass: verify the dash and the transit corridor in motion (record frames), tune FOV kick and ribs.
4. Mobile: check About, Projects index, Contact with footer; panel scroll.
5. Open Graph image, README, performance check (draw calls, DPR), reduced-motion screenshots.
6. Education / Experience: content from Pedro; 3D stays simplified.

## QA
`next build && next start -p 3210`, then the Playwright scripts kept outside the repo (scratchpad) drive Chrome.
MotionSites MCP: 1 of 3 calls used; 2 remain, none needed so far.
