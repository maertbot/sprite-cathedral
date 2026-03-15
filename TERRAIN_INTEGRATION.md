# Terrain Integration Task

## Goal
Replace the tile-by-tile ground rendering with a single pre-rendered terrain image (`public/assets/terrain-v1.png`), switch to the upgraded v3 building tiles (`public/assets/buildings-v3/`), and make the buildings feel integrated with the terrain.

## Current Architecture
- `src/renderer.js` draws each grid cell's ground as a procedural isometric diamond via `drawGroundTile()`
- Buildings are individual PNGs composited at `BUILDING_RENDER_W = 115` pixels wide
- Props are composited at `PROP_RENDER_W = 48` pixels wide
- Grid is 14×12, tiles are 120×60 px (isometric)
- `src/main.js` loads assets from `TILE_MANIFEST`, renders in depth-sorted order
- All animation (sprites, smoke, glow, labels, timeline) must be preserved

## What to Change

### 1. Terrain Background Layer
- Load `terrain-v1.png` as a single background image
- Instead of calling `drawGroundTile()` for each cell, draw the terrain image ONCE as a background layer
- The terrain image is 1024×1024. It needs to be scaled/positioned so it covers the same area as the current grid
- Calculate the bounding box of the full grid in screen space, then scale the terrain image to fit that bounding box
- The terrain replaces ALL ground tile drawing (grass, path, cobblestone, water diamonds)
- Keep `drawGroundTile()` function in renderer.js as fallback but don't call it in the main render loop

### 2. Building Asset Swap
- Change `TILE_MANIFEST` in `main.js` to point building keys to `buildings-v3/` instead of `buildings/`
- Keep props pointing to `props/` (they still look fine)
- The v3 buildings are terrain-style-matched and have richer detail

### 3. Building Scale Increase
- Change `BUILDING_RENDER_W` from `115` to `160` — buildings need to be bigger relative to terrain trees
- The lighthouse and inn should feel like prominent structures
- Adjust `drawBuilding()` y-offset so buildings still sit on the ground plane correctly

### 4. Soft Ground Shadow
- Update the ground shadow ellipse in `drawBuilding()` to be slightly larger and softer to help buildings feel grounded on the terrain
- Shadow opacity from `0.18` to `0.22`, radius from `0.38` to `0.45`

### 5. Remove Grid Edge Lines
- The current `drawGroundTile()` draws a diamond edge stroke at the end (`ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'`). Since we're not drawing ground tiles anymore, these grid lines disappear automatically. Good.

### 6. Water Shimmer
- Keep `drawWaterShimmer()` in main.js — it adds a subtle animated overlay over the lower portion. It should still work on top of the terrain image's water area.

### 7. Background Gradient
- The current background is a gradient (`#c8d8c0` → `#b0c4a0` → `#6a9aaa`). Keep this — it fills any area outside the terrain image. The terrain sits on top of it.

## What NOT to Change
- `src/scene.js` — grid layout, building metadata, paths, sprite paths all stay the same
- `src/events.js` — event replay system stays the same
- `src/ui.js` — UI stays the same
- `src/particles.js` — particle system stays the same
- Sprite rendering, depth sorting, event labels, tooltips, click handling — all stay the same
- Props rendering stays the same (they still use the old prop images)
- The ground tiles in `public/assets/ground/` can stay on disk, they just won't be loaded

## Implementation Details

In `main.js`:
```js
// Add terrain to manifest
const TERRAIN_IMG_PATH = 'terrain-v1.png';

// In loadImages(), also load the terrain:
// images['__terrain__'] = loaded terrain image

// In render(), replace the ground tile loop with:
// 1. Draw background gradient (already exists)
// 2. Draw terrain image, scaled to cover the grid bounding box
// 3. Draw water shimmer on top
// 4. Then draw buildings/props/sprites as before (depth sorted)
```

For terrain positioning:
```js
// Calculate grid bounding box in screen coords
const topLeft = gridToScreen(0, 0, offset.x, offset.y);
const topRight = gridToScreen(GRID_COLS - 1, 0, offset.x, offset.y);
const bottomLeft = gridToScreen(0, GRID_ROWS - 1, offset.x, offset.y);
const bottomRight = gridToScreen(GRID_COLS - 1, GRID_ROWS - 1, offset.x, offset.y);

const minX = Math.min(topLeft.x, bottomLeft.x) - TILE_W/2;
const maxX = Math.max(topRight.x, bottomRight.x) + TILE_W/2;
const minY = Math.min(topLeft.y, topRight.y) - TILE_H/2;
const maxY = Math.max(bottomLeft.y, bottomRight.y) + TILE_H/2;

const gridW = maxX - minX;
const gridH = maxY - minY;

// Draw terrain scaled to fill this bounding box
ctx.drawImage(terrainImg, minX, minY, gridW, gridH);
```

## Verification
After changes:
1. `npm run build` must succeed
2. Buildings should appear larger and with richer detail
3. No visible grid diamonds — just the organic terrain underneath
4. All sprites, smoke, glow, labels, timeline scrubber must still work
5. Tooltips and click-to-select buildings must still work
6. Water shimmer should still animate over the terrain's water area

## Commit
- Commit message: `Integrate terrain background and v3 building tiles`
- Do NOT push (local commit only)
