# Sprite Cathedral — Polish Plan (4 Phases, 56 Steps)

## Philosophy
Each phase follows the compound engineering loop: **Plan → Work → Review → Compound**.
- Opus handles design decisions, judgment calls, and QA
- Codex handles implementation and heavy token work
- Every step has a concrete test gate
- At the end of each phase: visual verification screenshot + honest assessment
- At the end of all phases: full integration QA pass

---

## PHASE 1: Clean Tile Art (Steps 1–14)
**Goal:** Remove all background halos from building/prop images so they composite cleanly over any ground tile.

### Plan
1. **Inventory audit** — List every tile PNG, screenshot each one rendered on-scene, identify which have visible halo artifacts. **Test:** produce a checklist with pass/fail per tile.
2. **Choose approach** — For each failing tile, decide: (a) regenerate with Gemini using explicit "transparent background" prompt, (b) use Python/Pillow to remove background programmatically, or (c) accept current state. **Test:** approach documented per tile.
3. **Set up Pillow bg-removal script** — Write a Python script that takes a tile PNG, samples corner color, removes all pixels within a tolerance, and outputs a transparent PNG. **Test:** script runs on cottage-red.png and produces a visually clean result.

### Work
4. **Process all building tiles** (10 images) through the bg-removal script. **Test:** each output PNG has transparent corners when opened.
5. **Process all prop tiles** (8 images) through the bg-removal script. **Test:** each output PNG has transparent corners.
6. **Visual spot-check** — Render the scene with processed tiles. Compare before/after for the 3 worst offenders. **Test:** no visible rectangular halo on any building.
7. **Edge refinement** — For any tiles where automated removal damaged the building art (ate into chimneys, roof edges, etc.), manually adjust tolerance or regenerate that specific tile with Gemini. **Test:** no building detail is visibly degraded.
8. **Remove runtime bg-removal code** from renderer.js — since tiles are now pre-processed, the expensive per-frame `processImageTransparency` function is no longer needed. **Test:** `npm run build` succeeds, scene renders identically but faster.

### Review
9. **Full scene screenshot** — capture and visually inspect. **Test:** zero visible halos on any tile at default zoom.
10. **Performance check** — verify 60fps now that runtime image processing is removed. **Test:** `requestAnimationFrame` callback time < 16ms measured via console.

### Compound
11. **Document** the Pillow bg-removal script path and settings in BUILDSPEC.md for future tile additions.
12. **Commit** with descriptive message.

### QA Gate (Steps 13–14)
13. **Opus visual QA** — Send screenshot to vision model, ask specifically about halo artifacts. **Test:** model reports no visible background rectangles.
14. **Phase 1 sign-off** — If QA passes, proceed. If not, loop back to step 7.

---

## PHASE 2: Scene Composition (Steps 15–28)
**Goal:** Rearrange the village layout for better visual rhythm, intentional sight lines, and a more lived-in feel.

### Plan
15. **Critique current layout** — Screenshot the scene and write a detailed composition critique: where are the dead zones, where is it crowded, where does the eye path go, what feels wrong. **Test:** critique document with specific grid coordinates.
16. **Design new layout on paper** — Sketch a revised 12×10 grid with: (a) clear visual center (the Green/gazebo), (b) residential cluster with breathing room, (c) Main Street as a diagonal or curved path (not a straight row), (d) harbor as a distinct waterfront edge, (e) trees/props as rhythm elements, not random fill. **Test:** new SCENE_MAP written out with clear district boundaries.
17. **Add path connectivity** — Ensure paths visually connect districts (residential → Main St → Green → harbor). **Test:** a sprite could logically walk from any cottage to any shop to the harbor via path tiles.

### Work
18. **Implement new SCENE_MAP** in scene.js. **Test:** `npm run build` succeeds.
19. **Update sprite paths** to match new building positions. **Test:** sprites walk on path tiles, never through buildings or water.
20. **Add 2–3 grass shade variants** — Currently all grass is one shade. Add a darker variant for subtle lawn-mowing-stripe effect across the village. **Test:** visible alternating grass shades in scene.
21. **Tune building spacing** — No two buildings should share adjacent tiles (minimum 1-tile gap). **Test:** visual inspection confirms breathing room.
22. **Add edge landscaping** — Trees and fences along the scene edges to frame the village. **Test:** scene edges feel intentional, not cut off.
23. **Adjust camera offset** — Center the village more precisely on typical screen sizes (1440×900, 1920×1080). **Test:** village centered at both resolutions.

### Review
24. **Full scene screenshot at two resolutions** — 1440px and 1920px wide. **Test:** village is centered and complete at both.
25. **Eye-path test** — Does the eye naturally flow from residential → Main Street → Green → harbor? **Test:** Opus vision model confirms logical visual flow.

### Compound
26. **Document** the layout design rationale in BUILDSPEC.md.
27. **Commit** with descriptive message.

### QA Gate (Step 28)
28. **Opus composition QA** — Full visual critique of the new layout. Pass/fail on: centering, breathing room, visual flow, edge treatment. If fail, loop to step 16.

---

## PHASE 3: More Building Variety (Steps 29–42)
**Goal:** Add 5 new building/prop tiles to fill out the village and give each district more character.

### Plan
29. **Identify gaps** — What building types are missing? Candidates: Chapel, Library, Dock Warehouse, Garden Shed, Covered Bridge, Inn/Hotel, Bandstand variant, Water Tower. **Test:** list of 5 chosen buildings with district assignments.
30. **Write Gemini prompts** — Using the style-anchor approach (cottage-red.png as reference), write prompts for all 5 new buildings. **Test:** prompts written and reviewed for style consistency language.

### Work
31. **Generate 5 new building tiles** via Gemini with style anchor. **Test:** 5 new PNGs saved to assets/buildings/.
32. **Process backgrounds** — Run each through the Pillow bg-removal script from Phase 1. **Test:** transparent backgrounds on all 5.
33. **Visual consistency check** — Compare all 5 new tiles against the existing set. **Test:** Opus vision model rates cohesion ≥ 8/10 with existing tiles.
34. **Regenerate any outliers** — If any tile breaks style consistency, regenerate with tighter prompt. **Test:** all tiles pass consistency check.
35. **Add to TILE_MANIFEST** in main.js. **Test:** preloader loads all new tiles without 404s.
36. **Place in SCENE_MAP** — Assign each new building to a grid position in the layout from Phase 2. **Test:** new buildings appear in the scene.
37. **Add BUILDINGS metadata** — name, jobType, description for each new building. **Test:** hover tooltips work on all new buildings.
38. **Add new sprite paths** if needed to connect new buildings. **Test:** sprites visit new buildings.

### Review
39. **Full scene screenshot** with all 15 buildings + 10+ props. **Test:** scene feels populated but not crowded.
40. **Performance check** — still 60fps with additional tiles. **Test:** frame time < 16ms.

### Compound
41. **Document** new tile generation prompts in BUILDSPEC.md for reproducibility.
42. **Commit** with descriptive message.

---

## PHASE 4: Real Data Connection (Steps 43–56)
**Goal:** Replace random demo activity with a static export of real OpenClaw session data so the village reflects actual work.

### Plan
43. **Design event schema** — Define a JSON format for events: `{ timestamp, type, building, description, duration }`. Types: subagent_start, subagent_complete, tool_call, cron_trigger, message_sent, heartbeat, ingestion. **Test:** schema documented.
44. **Map events to buildings** — Each event type maps to a specific building lighting up. **Test:** mapping table in code.
45. **Design replay mode** — A timeline scrubber at the bottom that replays a day's activity. Time compression: 24 hours → 2 minutes. **Test:** UI mockup described.

### Work
46. **Export today's real session data** — Pull from OpenClaw session history, cron results, and subagent completions. Write to `public/data/demo-day.json`. **Test:** JSON file contains ≥ 20 real events with timestamps.
47. **Build event player** — A module that reads the JSON, advances through events based on wall clock or scrubber position, and triggers building state changes. **Test:** buildings activate/deactivate in chronological order during replay.
48. **Build timeline scrubber UI** — A thin bar at the bottom of the screen showing the day's timeline. Current position indicator. Click to jump. **Test:** clicking at 50% jumps to noon; clicking at 75% jumps to 6pm.
49. **Add event labels** — When a building activates, briefly show the event description as a floating label above it. **Test:** labels appear and fade after 3 seconds.
50. **Add sprite dispatch** — When a subagent event fires, a new sprite walks from the Gazebo (orchestrator) to the relevant building. **Test:** sprite appears at gazebo and walks to the correct building.
51. **Live mode fallback** — When replay reaches the end (current time), switch to the existing random-toggle demo mode so the scene stays alive. **Test:** transition is seamless.
52. **Connect status line** — Show real event counts: "12 jobs completed · 3 active · last: catalog-nc-deep (2m ago)". **Test:** status line updates during replay.

### Review
53. **Full replay test** — Watch the entire 2-minute compressed replay of today. **Test:** events fire in order, no visual glitches, buildings activate correctly, sprites move sensibly.
54. **Performance check** — 60fps during replay with event labels + sprite spawning. **Test:** frame time < 16ms.

### Compound
55. **Document** the event schema and data export process so it can be refreshed daily.
56. **Final commit + deploy** with descriptive message.

---

## FINAL INTEGRATION QA (after all 4 phases)
- Full-page screenshot at 1920×1080
- Opus vision model comprehensive critique (composition, cohesion, polish, atmosphere)
- Performance profiling (60fps sustained for 5 minutes)
- Hover/click interaction test on every building
- Replay scrubber full playthrough
- Compare against the original YOLO brief's "morning deliverable" spec
- Write honest assessment of what shipped vs. what was promised
- Update memory/YYYY-MM-DD.md with the full build log

---

## Execution Model
- **Phase 1** (tile art): Opus designs, Python/Pillow script does the work, Opus QAs
- **Phase 2** (composition): Opus designs the layout, Codex implements, Opus QAs
- **Phase 3** (new tiles): Opus writes prompts, Gemini generates, Pillow processes, Codex integrates, Opus QAs
- **Phase 4** (data connection): Opus designs schema, Codex builds the player/UI, Opus QAs

Estimated total: 2–3 hours of build time across the phases.
