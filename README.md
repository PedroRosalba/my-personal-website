# Pedro Rosalba — portfolio

A professional portfolio presented as a short cinematic journey ("Threshold"): a small traveller walks one causeway
through a dark world toward an eclipse. Scroll or swipe to move; click or tap a gateway to open a project.

The 3D world is a progressive enhancement. All content is server-rendered HTML and works without WebGL or JavaScript.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the production origin for canonical URLs, sitemap and Open Graph.
Append `?nowebgl` to any URL to see the static fallback.

## Where things live

| Path | What |
|---|---|
| `content/profile.ts`, `content/projects.ts` | The only place content is edited. Feeds HTML, project pages, metadata, JSON-LD and the 3D gateways. |
| `content/journey.ts` | Maps each HTML section to a position on the causeway. |
| `app/` | Routes: home, `/projects/[slug]`, the intercepted project panel (`@panel`), sitemap, robots, Open Graph image. |
| `components/html/` | Navigation, project card/article/panel, scroll driver. |
| `components/scene/` | The world (React Three Fiber): sky and Eclipse, fog sea, structures, gateways, traveller, camera rig. |
| `.claude/skills/immersive-portfolio/` | Design brief and reference board. |
| `CONTENT_TODO.md` | Personal content still missing. |
| `PROGRESS.md` | Build log and next steps. |
