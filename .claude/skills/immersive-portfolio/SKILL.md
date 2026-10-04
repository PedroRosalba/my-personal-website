---
name: immersive-portfolio
description: Design and implement a professional personal portfolio as a guided cinematic sci-fi 3D experience. Use for concept development, visual design, Three.js/React Three Fiber implementation, and visual iteration.
---

# Immersive Portfolio

## Read first

Before design or implementation, read these files in this directory:

- `DESIGN.md` — creative brief and UX constraints
- `references.md` — small curated reference board

`DESIGN.md` is the current project brief. `references.md` provides visual vocabulary. Do not invent a second visual direction elsewhere.

## Core objective

Build a **professional portfolio that happens to feel like a cinematic sci-fi experience**.

The portfolio content is the product. The 3D world is the presentation and navigation layer.

Primary audience:
- recruiters
- hiring managers
- admissions reviewers
- technical interviewers

Assume a reviewer may spend only 15–30 seconds initially.

They must quickly understand:
1. who Pedro is
2. what he builds
3. how to reach Projects
4. how to inspect a project
5. how to contact him

## Interaction rules

Primary input:
`scroll / swipe`

Secondary input:
`click / tap`

Persistent navigation:
`About · Education · Projects · Experience · Contact`

Never require:
- WASD
- arrow-key movement
- gamepads
- free roaming
- puzzles
- quests
- combat
- inventory
- scores

Do not hide portfolio information behind exploration.

The intended model is a **guided spatial timeline**, not a game.

## 3D philosophy

Use Three.js / React Three Fiber when it materially improves:
- environment
- character movement
- camera choreography
- landmarks
- portals
- transitions
- meaningful shaders/materials

Use HTML/CSS/React for:
- navigation
- headings and body copy
- project details
- buttons and links
- accessibility-sensitive content

A recruiter should still be able to understand the site if the 3D layer is simplified.

## Art direction

Follow `DESIGN.md` and the reference board.

The target is:
- surreal cinematic sci-fi
- dark and spacious
- mysterious
- technically sophisticated
- restrained
- coherent

Default accent direction:
- electric violet

Green is an alternative direction, not a second simultaneous accent.

Do not drift into:
- generic cyberpunk
- colorful AI gradients
- game HUDs
- rainbow neon
- cartoon styling
- visual noise

Neon belongs primarily to the environment; UI should remain quiet.

## Scene architecture

Start with a small journey:

`INTRO → ABOUT → EDUCATION → PROJECTS → EXPERIENCE → CONTACT`

A small character should act as the visual anchor as the visitor progresses.

The environment may contain:
- a tunnel/wormhole transition
- calm spatial chambers
- strange large-scale structures
- one or two meaningful landmarks per section

Do not create a large explorable world for the MVP.

## Project reveal

Projects are the most important content.

Preferred interaction:

`scroll → arrive at project landmark → landmark reacts → click/tap → short cinematic reveal → readable project panel`

Project panel should expose, without multiple layers:
- title
- value/outcome
- role
- stack
- technical highlights
- video/demo when available
- GitHub/live link

## MCP strategy — limited budget

The MotionSites MCP is a **reference retrieval tool, not the source of truth**.

Assume a hard budget of **3 calls total** for this project unless the user explicitly says otherwise.

Never call it casually or repeatedly.

### MCP Call 1 — only after reading the brief

Purpose: fill a specific visual gap in the reference board.

Do NOT ask for broad “3D portfolio inspiration”.

Good query shape:
- immersive surreal sci-fi environment
- dark cinematic sci-fi world
- futuristic dimensional space
- alien architecture / wormhole atmosphere

Return only references visually compatible with `DESIGN.md` and V1.

The goal is to find **one stronger world/environment reference**, not a long list.

### MCP Call 2 — after concept proposals

First propose 2–3 possible world concepts without implementation.

Choose one direction.

Only then use the second MCP call to find references for that **specific chosen direction**, for example:
- character + sci-fi environment composition
- cinematic scroll transition
- portal/landmark reveal

Do not reopen the entire visual search.

### MCP Call 3 — only before final visual polish

Use only if there is a real unresolved gap, such as:
- project reveal choreography
- one missing interaction pattern
- mobile spatial presentation

If the existing references are sufficient, do not spend the third call.

### MCP discipline

Every MCP call must have a concrete question.

After each call:
1. inspect the results
2. keep at most 1–2 useful references
3. record why they were selected
4. discard conflicting references

Never paste a large collection of references into context.

## Design workflow

### Phase 1 — concept

Read `DESIGN.md` and `references.md`.

Do not code.

Produce:
- 2–3 coherent world concepts
- the visitor journey
- first-10-second experience
- project reveal model
- MVP scope

Recommend one concept.

### Phase 2 — art direction

Once a concept is selected:
- define the world rules
- define the single accent color
- define scene hierarchy
- define camera language
- define typography/UI relationship

Use MCP only if a specific gap remains.

### Phase 3 — implementation

Build only the MVP first:
- one coherent environment
- small character
- guided scroll progression
- persistent navigation
- 3–4 sections
- 2–3 project landmarks
- one polished project reveal
- mobile fallback

Do not build every section to full fidelity before one section looks excellent.

### Phase 4 — visual iteration

Run the actual application.

Inspect the rendered experience at:
- desktop
- tablet
- mobile

Fix the largest problems in this order:
1. clarity / navigation
2. composition
3. typography
4. 3D lighting/environment
5. motion
6. effects
7. performance

Do not add effects before fixing composition.

## Scope rule

If a decision is between:

`more impressive 3D`

and

`clearer portfolio communication`

choose clearer communication.

If a feature makes the reviewer spend significantly more time figuring out how to navigate, remove it.
