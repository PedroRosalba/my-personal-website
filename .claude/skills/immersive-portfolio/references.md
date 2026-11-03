# Immersive Portfolio — References

Keep this reference set intentionally small. These are references for **different layers of the same experience**, not styles to mash together.

Chosen concept: **Threshold** (see `DESIGN.md`). The board is closed; no new references without a concrete unresolved design problem.

## Reference priority

When references disagree, the higher one wins for its layer:

1. **V1 — overall atmosphere** (Lost in Parallel Universe)
2. **V4 — character/world composition** (Intelligence Layer)
3. **V5 — gateway/material language** (Monolith Hero)
4. **V2 — tunnel/transit** (Sci-Fi Tunnel)
5. **V3 — interaction mechanic** (Three.js Portal)

Each reference governs only its layer. E.g. V5 decides what a gateway looks like, never the palette (V1 + DESIGN.md) or the framing (V4).

## V1 — Lost in Parallel Universe

URL: https://exp-lost-in-parallel-universe.lusion.co/

Role: **PRIMARY VISUAL REFERENCE**

Extract:
- surreal sci-fi atmosphere
- feeling of entering another world
- darkness + luminous focal structures
- atmospheric depth
- mysterious scale
- restrained but dramatic lighting
- sense of cinematic discovery

Do not copy:
- exact geometry
- exact effects
- exact color treatment
- exact interaction

This is the strongest reference for the overall emotional target.

## V2 — Sci-Fi Tunnel

URL: https://mesh3d.gallery/experiment/scifi-tunnel

Role: **TRANSITION / DEPTH REFERENCE**

Extract:
- forward motion
- tunnel / wormhole spatial language
- vanishing-point depth
- acceleration
- repeating environmental structure

Use this as a visual transition primitive between portfolio moments, not as the permanent environment.

Do not copy:
- exact geometry
- rainbow/color treatment
- endless-loop behavior

## V3 — Three.js Portal

URL: https://threejs.org/examples/webgpu_portal.html

Role: **INTERACTION REFERENCE**

Extract:
- simple portal interaction
- one visual object producing a strong spatial effect
- sense of looking/transitioning into another space
- high visual payoff from a very small interaction

Do not turn the site into a collection of portals. Use the idea selectively for section transitions or project reveals.

## V4 — Intelligence Layer (MotionSites)

URL: https://motionsites.ai/?prompt=intelligence-layer
Local: `refs/v4-intelligence-layer.png`

Role: **CHARACTER × SCALE COMPOSITION REFERENCE** (Threshold key frame)

Extract:
- tiny human silhouette against one colossal vertical gateway — exactly the Threshold scale contrast
- near-black void; the gateway is the only light source
- low ground fog catching light at the base of the opening
- dead-centre symmetry, huge negative space above
- UI pushed to one side, environment carries the frame

This is the target composition for the Arrival and Contact shots.

Do not copy:
- the overexposed white light — translate to restrained violet (a thin seam on approach; full violet only at Contact)
- the SaaS landing-page UI, buttons and logo row

## V5 — Monolith Hero (MotionSites)

URL: https://motionsites.ai/?prompt=monolith-hero
Local: `refs/v5-monolith-hero.png`

Role: **GATEWAY FORM / MATERIAL REFERENCE**

Extract:
- gateway as a heavy closed monolith with a single cut opening (arch + steps) — reads as architecture, not sci-fi gadget
- matte stone material with faint interior light
- still reflective floor doubling the focal object
- cold, desaturated palette around one focal object

Do not copy:
- photoreal mountain landscape (Threshold is a void, not terrain)
- blue night grade (base stays near-black/charcoal; accent stays violet)
- warm interior light colour
- real-estate site chrome, side menu, framed UI border

## E1 — Ethereum 3D spinner

URL: https://ethereum3d.netlify.app/
Authoritative shape reference: https://ethereum.org/assets/

Role: **SINGLE LANDMARK REFERENCE** (Ethereum diamond)

Extract:
- ETH diamond geometry (upper and lower pyramids, split faces)
- slow rotation, subtle float
- restrained glow / material treatment

Do not copy:
- its colours or bright presentation — ours is dark metallic/matte with a faint violet rim
- any crypto branding, prices, token data or UI

Used exactly once, as the landmark of the Web3-related project gateway.

## MCP log

Budget: 3 calls. **Used: 1. Remaining: 2** — reserve for a concrete unresolved design problem only.

1. 2026-10-03 — `search_prompts`: "tiny lone human figure dwarfed by colossal monolith gateway portal in dark misty void, surreal cinematic sci-fi, strong scale contrast, restrained violet light, monumental architecture". 12 results, 9 previews inspected. Kept V4, V5. Discarded: Global Gateway (glowing slab portal, but saturated sunset pink/orange palette), Golden Portal / Vertex Sci (warm, painterly or daylight), Quantum Human / Futuristic Cinematic / Monolithic / Gateway Portal (product or abstract heroes, no world).

## Conceptual mood references

These are not implementation references and should never become literal copies:

- Star Wars: hyperspace, cinematic travel, enormous scale
- Rick and Morty: strange dimensions, portals, absurd sci-fi machinery
- Marvel / Iron Man: futuristic interfaces and technological spectacle

Use these only as high-level mood vocabulary.

## Reference synthesis rule

The result should feel like:

**Lost in Parallel Universe's atmosphere**
+ **tiny figure vs. colossal gateway composition (V4)**
+ **heavy monolithic gateway form (V5)**
+ **tunnel/wormhole depth and travel**
+ **simple portal-like interaction**
+ **quiet professional portfolio UI**

Do not introduce another major visual style without a strong reason.
