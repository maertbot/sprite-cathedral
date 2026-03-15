# Sprite Cathedral — Build Specification

## Overview
An isometric village visualization where AI agent activity is represented as a preppy Cape Cod / Nantucket coastal town. Buildings light up when jobs run, sprites walk between them, chimneys smoke when active.

## Tech Stack
- Vanilla JS + HTML Canvas
- Vite for bundling
- No frameworks, no dependencies beyond Vite
- All tile images are pre-generated PNGs in `assets/`

## Core Architecture

### Isometric Grid
- Standard 30° isometric projection
- Tile size: derive from actual image dimensions (images are ~1024x1024 but rendered smaller)
- Grid: approximately 12x10 tiles
- Camera centered on the village, no scrolling needed for v1

### Image Loading
All tiles in `assets/` must be loaded before rendering starts. Use a preloader that:
1. Lists all tile paths
2. Loads them as `Image` objects
3. Starts the render loop only after all are loaded
4. Shows a loading indicator ("Establishing village...")

### Scene Map (hardcoded for v1)
The village is laid out on a grid. Each cell can have:
- A ground tile (grass, path, water, cobblestone)
- Optionally a building or prop on top

#### District Layout (approximate):

```
Row 0-1 (top):     Residential — cottages, saltbox, trees, fences, mailboxes
Row 2-3 (upper mid): Trees, path leading to Main Street
Row 3-4 (center):  Main Street — shop, post office, general store on cobblestone
Row 5 (center):    The Green — gazebo, benches, flagpole, lampposts on grass
Row 6-7 (lower):   Path to Harbor
Row 8-9 (bottom):  Harbor — water tiles, boathouse, lighthouse, sailboat, dock
```

Each building maps to a job category:
- Cottages → subagent workers (one per active subagent)
- Shop/Post Office/General Store → active tool calls / API work
- Clubhouse → cron jobs
- Lighthouse → system health / heartbeat
- Gazebo → the orchestrator (main agent)
- Boathouse → data ingestion

### Rendering Order
Isometric scenes must render back-to-front (painter's algorithm):
1. Draw all ground tiles first (full grid)
2. Then draw buildings/props sorted by (row + col) ascending
3. Sprites drawn after the building in their current cell

### Building States
Each building has two states:
- **Idle**: normal appearance, pale blue/unlit windows
- **Active**: warm golden glow overlay, chimney smoke particles

For active buildings, draw a semi-transparent warm radial gradient behind them before drawing the tile image. This simulates window glow without needing separate active tile images.

### Sprites
Small colored figures that walk between buildings along paths.
- Draw as simple canvas shapes (like the mockup) — NOT from image tiles
- Each sprite has: position, target building, color (polo shirt color from preppy palette), active flag
- Movement: lerp between grid positions along a path
- Bob animation: gentle Y oscillation
- Colors: pink, kelly green, coral, nantucket red, navy, madras yellow

### Particles
Two types:
1. **Golden pollen** — ambient particles drifting gently across the scene (like the mockup)
2. **Chimney smoke** — small gray puffs rising from active building chimneys (draw these procedurally above the building tile)

### UI Overlay
- Top-left: "SPRITE CATHEDRAL" in Playfair Display, small
- Below: "N active jobs · M districts · est. 2026" in DM Sans
- Bottom: subtle footer with "powered by OpenClaw"
- All text is canvas-rendered or HTML overlay — your choice

### Interaction (v1 — keep simple)
- Hover a building: show tooltip with building name + status
- Click a building: expand a small panel showing what job type it represents
- No drag, no zoom, no scroll for v1

### Ambient Effects
- Time-of-day tint: derive from local clock, shift the overall scene warmth (same concept as Angelfire's ambient shift)
- Subtle vignette at edges
- The scene should feel alive even when nothing is "happening" — particles drift, sprites walk, flags wave

## File Structure
```
sprite-cathedral/
  index.html
  src/
    main.js          — entry point, preloader, render loop
    scene.js         — scene map definition, building/prop placement
    renderer.js      — isometric projection, tile drawing, sprite drawing
    particles.js     — ambient particles + chimney smoke
    ui.js            — tooltips, overlays, interaction
    style.css        — minimal CSS for HTML overlay elements
  assets/
    buildings/       — 10 building PNGs
    ground/          — 4 ground tile PNGs
    props/           — 8 prop PNGs
  vite.config.js
  package.json
```

## Vite Config
```js
import { defineConfig } from 'vite'
export default defineConfig({
  base: '/sprite-cathedral/',
  build: { outDir: 'dist' }
})
```

## Critical Quality Requirements
1. All tile images must render at a CONSISTENT scale — if buildings appear different sizes from each other, the scene looks broken
2. Ground tiles must tile seamlessly — no gaps between diamonds
3. Buildings must appear to "sit on" the ground, not float
4. The scene must hit 60fps on a modern laptop
5. Sprites must stay on paths (not walk through buildings)
6. The overall feel should be warm, charming, and optimistic — NOT a dashboard, NOT a monitoring tool. It's a living diorama.

## What NOT to Build (v1)
- No real event data ingestion (use simulated/demo data)
- No WebSocket/polling connection to OpenClaw
- No persistence
- No mobile layout (desktop-first, like the mockup)
- No sound

## Package Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```
