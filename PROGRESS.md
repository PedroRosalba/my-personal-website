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

## Next (highest value first)
1. Content from Pedro (see CONTENT_TODO.md): email, LinkedIn, CV, photo, education, experience, confirm copy.
2. Optional polish: fog sea billows near the camera at Arrival; Education/Experience 3D landmarks (post-MVP).
3. Real-device check (touch scrolling on iOS/Android, low-power GPU).

## QA
`next build && next start -p 3210`, then the Playwright scripts kept outside the repo (scratchpad) drive Chrome.
MotionSites MCP: 1 of 3 calls used; 2 remain, none needed so far.
