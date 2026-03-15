// Sprite Cathedral — Entry Point
// A living isometric village diorama

import './style.css';
import {
  GRID_COLS, GRID_ROWS,
  parseScene, createActivityState, tickActivity,
  SPRITE_PATHS, SPRITE_COLORS, BUILDINGS
} from './scene.js';
import {
  TILE_W, TILE_H,
  gridToScreen, screenToGrid, calcOffset,
  drawGroundTile, drawBuilding, drawSprite,
  drawTimeTint, drawVignette
} from './renderer.js';
import { ParticleSystem } from './particles.js';
import { initUI, updateStatusLine, showTooltip, handleClick } from './ui.js';

// --- Image Preloader ---
const ASSET_BASE = import.meta.env.BASE_URL + 'assets/';

const TILE_MANIFEST = {
  // Ground tiles
  'grass-light': 'ground/grass-light.png',
  'path': 'ground/path.png',
  'cobblestone': 'ground/cobblestone.png',
  'water': 'ground/water.png',
  // Buildings
  'cottage-red': 'buildings/cottage-red.png',
  'cottage-green': 'buildings/cottage-green.png',
  'saltbox': 'buildings/saltbox.png',
  'shop': 'buildings/shop.png',
  'post-office': 'buildings/post-office.png',
  'general-store': 'buildings/general-store.png',
  'clubhouse': 'buildings/clubhouse.png',
  'garden-shed': 'buildings/garden-shed.png',
  'lighthouse': 'buildings/lighthouse.png',
  'gazebo': 'buildings/gazebo.png',
  'boathouse': 'buildings/boathouse.png',
  'chapel': 'buildings/chapel.png',
  'library': 'buildings/library.png',
  'inn': 'buildings/inn.png',
  'dock-warehouse': 'buildings/dock-warehouse.png',
  // Props
  'tree-round': 'props/tree-round.png',
  'tree-evergreen': 'props/tree-evergreen.png',
  'bench': 'props/bench.png',
  'fence-picket': 'props/fence-picket.png',
  'flagpole': 'props/flagpole.png',
  'lamppost': 'props/lamppost.png',
  'mailbox': 'props/mailbox.png',
  'sailboat': 'props/sailboat.png',
};

async function loadImages() {
  const images = {};
  const entries = Object.entries(TILE_MANIFEST);
  let loaded = 0;

  const statusEl = document.getElementById('status-line');

  await Promise.all(entries.map(([key, path]) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        images[key] = img;
        loaded++;
        if (statusEl) {
          statusEl.textContent = `establishing village... ${Math.floor(loaded / entries.length * 100)}%`;
        }
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load: ${path}`);
        images[key] = null;
        loaded++;
        resolve(); // Don't fail the whole load
      };
      img.src = ASSET_BASE + path;
    });
  }));

  return images;
}

// --- Sprites ---
class Sprite {
  constructor(pathIndex, colorIndex) {
    const path = SPRITE_PATHS[pathIndex % SPRITE_PATHS.length];
    this.path = path;
    this.color = SPRITE_COLORS[colorIndex % SPRITE_COLORS.length];
    this.pathIndex = 0;
    this.progress = 0; // 0-1 between current and next waypoint
    this.speed = 0.3 + Math.random() * 0.3; // cells per second
    this.forward = true;
    this.active = true;
    this.waitTime = 0;
  }

  get currentPos() {
    const from = this.path[this.pathIndex];
    const toIdx = this.forward ? this.pathIndex + 1 : this.pathIndex - 1;
    const to = this.path[toIdx] || from;
    return {
      row: from.row + (to.row - from.row) * this.progress,
      col: from.col + (to.col - from.col) * this.progress,
    };
  }

  update(dt) {
    if (this.waitTime > 0) {
      this.waitTime -= dt;
      return;
    }

    this.progress += this.speed * (dt / 1000);

    if (this.progress >= 1) {
      this.progress = 0;
      if (this.forward) {
        this.pathIndex++;
        if (this.pathIndex >= this.path.length - 1) {
          this.forward = false;
          this.waitTime = 1000 + Math.random() * 2000; // pause at destination
        }
      } else {
        this.pathIndex--;
        if (this.pathIndex <= 0) {
          this.forward = true;
          this.waitTime = 1000 + Math.random() * 2000; // pause at home
        }
      }
    }
  }
}

// --- Main ---
async function main() {
  const canvas = document.getElementById('cathedral');
  const ctx = canvas.getContext('2d');

  // Hi-DPI support
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Load images
  const images = await loadImages();

  // Parse scene
  const cells = parseScene();
  const activityState = createActivityState();

  // Start some buildings as active for visual interest
  activityState['gazebo'].active = true;
  activityState['shop'].active = true;
  activityState['post-office'].active = true;
  activityState['lighthouse'].active = true;

  // Init particles
  const particles = new ParticleSystem();

  // Init sprites
  const sprites = [];
  for (let i = 0; i < SPRITE_PATHS.length; i++) {
    sprites.push(new Sprite(i, i));
  }

  // Init UI
  initUI();

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  let hoveredCell = null;

  canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const offset = calcOffset(window.innerWidth, window.innerHeight);
    const grid = screenToGrid(mouseX, mouseY, offset.x, offset.y);
    hoveredCell = null;
    if (grid.row >= 0 && grid.row < GRID_ROWS && grid.col >= 0 && grid.col < GRID_COLS) {
      const cell = cells[grid.row * GRID_COLS + grid.col];
      if (cell && cell.building) {
        hoveredCell = cell;
        showTooltip(cell.building, mouseX, mouseY);
        canvas.style.cursor = 'pointer';
      } else {
        showTooltip(null);
        canvas.style.cursor = 'default';
      }
    } else {
      showTooltip(null);
      canvas.style.cursor = 'default';
    }
  });

  canvas.addEventListener('click', (e) => {
    const offset = calcOffset(window.innerWidth, window.innerHeight);
    const grid = screenToGrid(e.clientX, e.clientY, offset.x, offset.y);
    if (grid.row >= 0 && grid.row < GRID_ROWS && grid.col >= 0 && grid.col < GRID_COLS) {
      const cell = cells[grid.row * GRID_COLS + grid.col];
      if (cell && cell.building) {
        handleClick(cell.building);
        return;
      }
    }
    handleClick(null);
  });

  // --- Render Loop ---
  let lastTime = performance.now();

  function render(now) {
    const dt = Math.min(now - lastTime, 50); // cap delta
    lastTime = now;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const offset = calcOffset(w, h);

    // Update
    tickActivity(activityState, now);
    updateStatusLine(activityState);
    particles.resize(w, h);
    particles.update(dt);
    sprites.forEach(s => s.update(dt));

    // Spawn smoke for active buildings
    for (const cell of cells) {
      if (cell.building && activityState[cell.building]?.active) {
        const pos = gridToScreen(cell.col, cell.row, offset.x, offset.y);
        // Chimney position — top of building
        const img = images[cell.building];
        if (img) {
          const renderW = 120;
          const aspect = img.naturalHeight / img.naturalWidth;
          const renderH = renderW * aspect;
          particles.spawnSmoke(pos.x + 10, pos.y - renderH + TILE_H / 2 + 15);
        }
      }
    }

    // Clear — warm sage background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#c8d8c0');
    bgGrad.addColorStop(0.6, '#b0c4a0');
    bgGrad.addColorStop(1, '#6a9aaa');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Draw water shimmer background for bottom rows
    drawWaterShimmer(ctx, offset, w, h, now);

    // Draw ground tiles
    for (const cell of cells) {
      const pos = gridToScreen(cell.col, cell.row, offset.x, offset.y);
      drawGroundTile(ctx, cell.ground, pos.x, pos.y, now);
    }

    // Collect drawables (buildings, props, sprites) and sort by depth
    const drawables = [];

    for (const cell of cells) {
      const depth = cell.row + cell.col;
      if (cell.building) {
        drawables.push({
          type: 'building',
          cell,
          depth,
          key: cell.building,
        });
      }
      if (cell.prop) {
        drawables.push({
          type: 'prop',
          cell,
          depth: depth + 0.1, // props slightly in front
          key: cell.prop,
        });
      }
    }

    for (const sprite of sprites) {
      const pos = sprite.currentPos;
      drawables.push({
        type: 'sprite',
        sprite,
        depth: pos.row + pos.col + 0.2,
      });
    }

    // Sort by depth (painter's algorithm)
    drawables.sort((a, b) => a.depth - b.depth);

    // Draw
    for (const d of drawables) {
      if (d.type === 'building') {
        const pos = gridToScreen(d.cell.col, d.cell.row, offset.x, offset.y);
        const isActive = activityState[d.key]?.active || false;
        drawBuilding(ctx, images[d.key], pos.x, pos.y, true, isActive, now);
      } else if (d.type === 'prop') {
        const pos = gridToScreen(d.cell.col, d.cell.row, offset.x, offset.y);
        drawBuilding(ctx, images[d.key], pos.x, pos.y, false, false, now);
      } else if (d.type === 'sprite') {
        const spos = d.sprite.currentPos;
        const screen = gridToScreen(spos.col, spos.row, offset.x, offset.y);
        drawSprite(ctx, screen.x, screen.y, d.sprite.color, now, d.sprite.forward ? 1 : -1);
      }
    }

    // Particles (above everything)
    particles.draw(ctx);

    // Post-processing
    drawTimeTint(ctx, w, h);
    drawVignette(ctx, w, h);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// Subtle water shimmer effect
function drawWaterShimmer(ctx, offset, w, h, time) {
  // Draw ambient harbor reflection aligned to the bottom two water rows
  const harborStartRow = GRID_ROWS - 2;
  const sample = gridToScreen(0, harborStartRow, offset.x, offset.y);
  const shimmerY = sample.y - TILE_H;
  if (shimmerY < h) {
    const alpha = 0.03 + 0.02 * Math.sin(time / 2000);
    ctx.fillStyle = `rgba(100, 180, 220, ${alpha})`;
    ctx.fillRect(0, shimmerY - 40, w, h - shimmerY + 40);
  }
}

main().catch(console.error);
