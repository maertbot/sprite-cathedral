# Polish Pass — Building Placement + Prop Refresh + Halo Fix

## 1. Scene Layout Redesign

The terrain image has specific features: roads, clearings, waterfront, trees. Buildings must align with these features. The current grid layout was designed for procedural ground tiles and doesn't match the terrain.

### New SCENE_MAP Design Principles:
- **Buildings go on the terrain's open grassy clearings**, NOT on tree clusters or water
- **Remove most props** — the terrain already has its own trees, benches, lampposts. Adding prop sprites on top creates visual clutter and doubles up on trees.
- **Keep only functional props**: flagpole at the gazebo, sailboat in water, maybe 1-2 mailboxes
- **Ground types in SCENE_MAP are cosmetic only** — the terrain image covers them. But keep them roughly accurate for any fallback rendering.
- **Reduce the grid to use fewer cells** — don't fill every cell. Leave most cells empty so buildings have breathing room.

### New Building Placements (grid col, row):
Based on terrain analysis — these positions correspond to actual clearings/pads in the terrain image:

```
Row 0-1: Upper residential area (terrain has clearings here)
  cottage-red:    col=2, row=1   — upper-left clearing
  cottage-green:  col=4, row=0   — mid clearing
  saltbox:        col=7, row=0   — large NE clearing  
  inn:            col=8, row=1   — right of NE clearing

Row 2-3: Along the main road (terrain road runs through here)
  chapel:         col=1, row=2   — left of road entrance
  shop:           col=3, row=2   — roadside
  post-office:    col=6, row=2   — roadside
  library:        col=8, row=3   — right of road fork

Row 4-5: Main Street / town center
  general-store:  col=3, row=4   — south side of road
  clubhouse:      col=7, row=4   — east of intersection
  garden-shed:    col=2, row=5   — west side, tucked away

Row 6: Village green
  gazebo:         col=5, row=6   — center of the village green

Row 7-8: Waterfront
  boathouse:      col=4, row=7   — near the dock area
  dock-warehouse: col=6, row=7   — right at the dock
  
Row 9-10: Water
  lighthouse:     col=2, row=9   — on rocky outcrop in water (terrain has rocks here)
```

### Updated GAZEBO_HOME
Change from `{ row: 6, col: 7 }` to `{ row: 6, col: 5 }` to match the new gazebo position.

### Updated Sprite Paths
Redesign SPRITE_PATHS to connect the new building positions along terrain roads:
```js
// Residential → Main Street
[{row:1,col:2},{row:2,col:2},{row:2,col:3}],  // cottage-red to shop
[{row:0,col:4},{row:1,col:4},{row:2,col:4},{row:2,col:5},{row:2,col:6}],  // cottage-green to post-office
[{row:0,col:7},{row:1,col:7},{row:2,col:7},{row:2,col:6}],  // saltbox to post-office

// Main Street → Green
[{row:2,col:3},{row:3,col:3},{row:4,col:3},{row:5,col:4},{row:6,col:5}],  // shop to gazebo
[{row:2,col:6},{row:3,col:6},{row:4,col:6},{row:5,col:5},{row:6,col:5}],  // post-office to gazebo
[{row:4,col:7},{row:5,col:6},{row:6,col:5}],  // clubhouse to gazebo

// Green → Harbor
[{row:6,col:5},{row:7,col:5},{row:7,col:4}],  // gazebo to boathouse
[{row:6,col:5},{row:7,col:5},{row:7,col:6}],  // gazebo to dock-warehouse

// Gazebo dispatch route (for dispatch sprites)
[{row:6,col:5},{row:5,col:4},{row:4,col:3},{row:3,col:3},{row:2,col:3}],  // gazebo to shop
```

### Updated SCENE_MAP
Sparse — mostly empty cells with just buildings placed at the right positions. No tree props (terrain has its own). Keep it clean.

## 2. Halo Fix

Some v3 building tiles have a faint green/sage halo where the feathered alpha edge doesn't perfectly blend with the terrain underneath. 

Fix approach:
- In `drawBuilding()`, before drawing each building image, draw a small terrain-colored patch underneath the building footprint to help the feathered edge blend
- OR: pre-multiply the alpha in the building PNGs so the feathered edge fades to transparent rather than to the original background color

Better approach: Re-run background removal with **premultiplied alpha** — set RGB to (0,0,0) where alpha < 255 proportionally, so semi-transparent edge pixels don't carry the sage green color.

In the bg removal script, after computing alpha:
```python
# Premultiply: blend RGB toward neutral as alpha decreases
alpha_norm = alpha_arr / 255.0
result[:,:,0] = (result[:,:,0] * alpha_norm).astype(np.uint8)
result[:,:,1] = (result[:,:,1] * alpha_norm).astype(np.uint8) 
result[:,:,2] = (result[:,:,2] * alpha_norm).astype(np.uint8)
```

Wait — canvas expects non-premultiplied alpha. Instead, simply set the RGB of near-transparent pixels to match the terrain's average green:
```python
# Where alpha is low (feathered edge), shift RGB toward terrain green
terrain_green = np.array([142, 190, 120])  # approximate terrain grass color
blend = 1.0 - (alpha_arr / 255.0)
for c in range(3):
    result[:,:,c] = (result[:,:,c] * (1-blend) + terrain_green[c] * blend).astype(np.uint8)
```

## 3. Prop Regeneration

The current props (tree-round, tree-evergreen, bench, fence-picket, etc.) were generated in an earlier batch with a different style. Since we're mostly removing props from the scene (terrain has its own), we only need to keep:
- `sailboat` (in water, visible)
- `flagpole` (at gazebo)

These can stay as-is since they're small and unobtrusive.

Remove from SCENE_MAP: all tree-round, tree-evergreen, bench, fence-picket, lamppost, mailbox props. The terrain already has all of these baked in.

## Implementation Steps

1. Rewrite `SCENE_MAP` in `src/scene.js` with the new sparse layout
2. Update `GAZEBO_HOME` in `src/main.js` to `{ row: 6, col: 5 }`
3. Update `SPRITE_PATHS` in `src/scene.js` with new paths
4. Run the halo fix script on all buildings-v3 tiles
5. `npm run build`
6. Commit locally: "Polish: terrain-aligned layout, halo fix, sparse props"
7. Do NOT push
