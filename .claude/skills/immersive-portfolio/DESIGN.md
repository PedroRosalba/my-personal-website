# Immersive Portfolio — Design Brief

Owner: **Pedro Rosalba**

Chosen concept: **Threshold** (locked — do not reopen concept exploration without an explicit request).

## Core idea

A professional personal portfolio presented as a short cinematic journey through a surreal sci-fi environment.

The visitor does **not** play a game. They scroll/swipe through a guided path while a small character walks through the environment. The world changes as the visitor progresses, revealing portfolio sections naturally.

The experience should feel like **absolute cinema for a few seconds at a time**, while remaining extremely easy for a recruiter or reviewer to understand.

The immersive layer is a **progressive enhancement of a real professional website**, not a WebGL application pretending to be a website.

## Experience model

Primary input:
- Scroll on desktop
- Swipe on mobile

Secondary input:
- Click/tap to inspect a meaningful object or open project details

Never require:
- WASD
- arrow-key movement
- free roaming
- puzzles
- quests
- exploration to find information
- combat
- game HUDs

A minimal persistent navigation allows direct jumps to:
- About
- Education
- Projects
- Experience
- Contact

A reviewer must be able to understand who Pedro is and reach Projects almost immediately, without exploring the environment.

### Hard UX rule — Projects from the first frame

From the very first rendered frame, a reviewer must be able to reach Projects **without learning or using the 3D experience**:
- a visible "View projects" action and the persistent nav are present in the initial server-rendered HTML
- both work before WebGL loads, while it loads, and if it never loads
- both are plain links (`#projects`, `/projects/<slug>`), keyboard-focusable, no scroll-through required
- no intro animation, loader, or tunnel may block or delay them

Any design that violates this rule is rejected regardless of visual quality.

## Concept — Threshold

A small human figure walks a narrow causeway suspended across a dark, fog-filled void, toward a sequence of colossal gateways.

### World rules

- One causeway, one direction: forward. Scroll = walk forward. Never branches.
- The void is near-black; distant megastructures are only half-visible through fog.
- Each portfolio section is a calm **station** on the causeway with **one** focal landmark.
- Stations are separated by a gateway. Crossing a gateway triggers a brief wormhole/tunnel transit (~1.5 s), used only between stations.
- Scale shifts per station to avoid monotony: intimate (About) → large (Education) → monumental (Projects) → open emptiness (Contact).
- Accent light intensity grows along the journey: violet starts faint and is strongest at Contact. The colour itself signals progress.

### Character

- Small, faceless human figure; matte off-white/pale grey; no glow, no costume detail.
- Roughly 1/12–1/15 of frame height. Secondary to the environment — an anchor for scale, not a protagonist.
- Clips: walk, idle, look-up. Walk speed follows scroll velocity; when scrolling stops the figure stops and looks toward the nearest landmark.
- Turns toward the camera exactly once: at Contact.

**Rule — the character is a scale/atmosphere device, not a gameplay system.**
- It is never controlled directly; its position is derived from scroll progress only.
- No physics, collisions, pathfinding, state machines, inventory, interaction prompts or abilities.
- No customization, dialogue, facial animation or close-ups.
- Three clips maximum (walk, idle, look-up) plus the single Contact turn.
- If a character feature does not improve scale, atmosphere or legibility, do not build it.

### Camera

- Low, behind and slightly above the figure; long lens; centred vanishing point.
- At landmarks, slow arc to frame the object and free the left or right third for HTML text.
- No shake, no spring overshoot.
- Persistent-nav jumps play a **hyperspace dash**: a fast (<2 s) compressed flight down the causeway to the target station. Navigation itself becomes the spectacle.

### Journey

#### 00 — Arrival

Black frame. Immediately visible as HTML (before 3D is ready):
- Pedro Rosalba
- Software / AI / Systems
- one concise positioning sentence
- persistent nav + a "View projects" action

As 3D loads, the figure steps out of a short tunnel onto the causeway. First scroll starts the walk.

#### 01 — About

First station. Intimate scale: a single nearby structure, a colossal shape barely visible in the distance. 3–4 lines of text. No interaction.

#### 02 — Education

A hovering stack of thin plates beside the causeway. Click/tap fans the plates apart — one plate per institution/degree — while HTML entries align beside them. Must read as an object unfolding, not a modal or dropdown. The same content is always present in the HTML.

#### 03 — Projects

The most important section. Three monumental stone gateways on alternating sides of the causeway.

On approach, a thin violet seam traces the active gateway's edge — the only affordance.

Reveal sequence:
scroll → arrive → seam lights → click/tap → gateway surface opens into a portal (project video or a tiny scene) → camera push-in ~0.8 s → readable project panel at `/projects/<slug>`

Panel exposes, in one layer:
- title
- one-line value/outcome
- role
- stack
- technical highlights
- video/demo when available
- GitHub/live link

Close / Esc / browser Back pulls the camera back to the causeway.

#### 04 — Experience / Skills

A row of evenly spaced pylons along the causeway, one per role. Environment stays quiet; HTML carries concise evidence.

#### 05 — Contact

The causeway ends at the edge of the void. Fog clears; the final gateway stands open and lit at full violet. The figure stops and turns toward the camera. Clear contact block: email, LinkedIn, GitHub, CV.

## Visual language

Base:
- near-black / deep charcoal void
- dark grey matte environmental surfaces
- soft off-white text

Accent:
- **one** luminous accent for the whole experience: restrained **electric violet**
- alternate direction (not simultaneous): restrained alien green
- never combine purple, green, cyan, pink, orange, etc. as equal accents
- no rainbow gradients

Neon is very limited and belongs to gateway seams, portals, the tunnel and the final gateway — not to UI elements.

The UI is intentionally quiet (no cyberpunk HUD, no glowing frames) so the environment carries the spectacle.

## Composition

Favor:
- one strong focal object per station
- large negative space
- deep perspective and strong scale contrast
- controlled lighting
- atmospheric fog
- restrained particles
- clear visual hierarchy

Avoid:
- busy scenes
- walls of floating objects
- excessive glow/bloom
- generic neon cyberpunk
- rainbow effects
- decorative particles everywhere
- random abstract geometry without narrative purpose

## Motion

Good:
- smooth camera travel along the causeway
- subtle character walking
- environmental parallax
- brief tunnel transit between stations
- portal opening on project reveal
- objects unfolding when inspected

Bad:
- constant camera shaking
- excessive spring/bounce
- animation on every element
- effects that make reading difficult
- long transitions that delay access to content

`prefers-reduced-motion`: tunnel and dash become short crossfades; camera cuts instead of flies.

## Architecture rules

Portfolio content is **real semantic HTML**. Nothing essential exists only inside WebGL.

Three.js / React Three Fiber owns:
- environment
- character
- camera
- lighting
- fog
- portals
- transitions
- visual effects

HTML / React owns:
- navigation
- headings and descriptions
- project information
- buttons and links
- videos
- accessibility
- SEO content

Rules:
- Every project has a stable, server-rendered URL: `/projects/<slug>`.
- One shared, typed data source drives the HTML sections, the project pages, metadata, JSON-LD **and** the 3D landmarks. No parallel copies of content.
- Every clickable 3D landmark has an equivalent real link/button in the HTML.
- The site is fully usable with WebGL unavailable or disabled (static fallback backdrop).
- Next.js metadata on every route; JSON-LD where appropriate (`Person` on home, project schema on project pages).

## MVP boundary

**Fully built (HTML + full 3D treatment):**
`Intro/Arrival → About → Projects → Contact`
- including the persistent nav, the hyperspace dash, three project gateways, one fully polished project reveal, and the mobile / reduced-motion / no-WebGL fallbacks

**Real but simplified:**
`Education` and `Experience`
- must exist as real semantic HTML sections with complete content and working nav targets (`#education`, `#experience`)
- 3D treatment stays minimal (a quiet stretch of causeway, no unfolding plates, no pylon row) until the core experience is proven
- their full 3D landmarks are post-MVP

Do not start Education/Experience 3D work until Arrival, About, Projects and Contact look excellent on desktop and mobile.

## Dependencies

Only add a package after verifying it on the npm registry (exists, maintained, compatible peer ranges). Record the check here.

Verified 2026-10-03 (`npm view`):

| Package | Version | Use |
|---|---|---|
| `next` | 16.3.8 | App Router, metadata, static generation |
| `react` / `react-dom` | 19.3.0 | UI (R3F peer requires `>=19 <19.4`) |
| `three` | 0.186.1 | 3D engine |
| `@react-three/fiber` | 9.8.1 | React renderer for three |
| `@react-three/drei` | 10.7.9 | helpers (GLTF loading, animations, `MeshPortalMaterial`) |
| `zustand` | 5.0.15 | shared scene/UI state |
| `zod` | 4.6.5 | build-time validation of shared content data |

Removed / deferred:
- `@react-three/p` — **does not exist** (npm 404). It was a truncation of `@react-three/postprocessing`.
- `@react-three/postprocessing` (3.1.3, exists) + `postprocessing` (6.39.5) — **not in MVP**. Fog, emissive materials and tone mapping must carry the look first. Reconsider only during the effects pass (step 6 of visual iteration) if a specific, named problem needs selective bloom; re-verify peer ranges then (`postprocessing` currently requires `three < 0.187`).

## Modularity

The environment is built from a small reusable kit:
- causeway segment (instanced)
- gateway (one model, scaled/rotated per use)
- plate stack (Education)
- pylon (Experience)
- distant megastructure silhouettes (low detail, fog-hidden)
- tunnel transit (procedural)

No bespoke environment per section.

## Professional constraint

The portfolio must communicate before it impresses.

Within approximately 10 seconds, a visitor should understand:
1. who Pedro is
2. what he does
3. where the main content is
4. how to get to Projects

Within approximately 30 seconds, a reviewer should be able to inspect at least one real project.

The 3D experience is the memorable presentation layer, not a maze standing between the reviewer and the evidence.
