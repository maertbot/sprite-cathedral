// Sprite Cathedral — Entry Point
// A living isometric village diorama

import './style.css';
import {
  GRID_COLS, GRID_ROWS,
  parseScene,
  SPRITE_PATHS, SPRITE_COLORS
} from './scene.js';
import {
  TILE_H,
  gridToScreen, screenToGrid, calcOffset,
  drawGroundTile, drawBuilding, drawSprite,
  drawTimeTint, drawVignette
} from './renderer.js';
import { ParticleSystem } from './particles.js';
import {
  initUI, updateStatusLine, showTooltip, handleClick,
  updateTimeline, setTimelineSeekHandler,
} from './ui.js';
import {
  initEvents, tickEvents, getActiveBuildings, getReplayProgress,
  getReplayClock, getEventStats, seekTo,
} from './events.js';

const ASSET_BASE = import.meta.env.BASE_URL + 'assets/';
const GAZEBO_HOME = { row: 6, col: 7 };
const LABEL_DURATION_MS = 3000;

const TILE_MANIFEST = {
  'grass-light': 'ground/grass-light.png',
  'path': 'ground/path.png',
  'cobblestone': 'ground/cobblestone.png',
  'water': 'ground/water.png',
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

  await Promise.all(entries.map(([key, path]) => new Promise((resolve) => {
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
      resolve();
    };
    img.src = ASSET_BASE + path;
  })));

  return images;
}

class Sprite {
  constructor(pathIndex, colorIndex) {
    const path = SPRITE_PATHS[pathIndex % SPRITE_PATHS.length];
    this.path = path;
    this.color = SPRITE_COLORS[colorIndex % SPRITE_COLORS.length];
    this.pathIndex = 0;
    this.progress = 0;
    this.speed = 0.3 + Math.random() * 0.3;
    this.forward = true;
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
          this.waitTime = 1000 + Math.random() * 2000;
        }
      } else {
        this.pathIndex--;
        if (this.pathIndex <= 0) {
          this.forward = true;
          this.waitTime = 1000 + Math.random() * 2000;
        }
      }
    }
  }
}

class DispatchSprite {
  constructor(path, colorIndex) {
    this.path = path;
    this.color = SPRITE_COLORS[colorIndex % SPRITE_COLORS.length];
    this.pathIndex = 0;
    this.progress = 0;
    this.speed = 1.25;
    this.done = false;
  }

  get currentPos() {
    const from = this.path[this.pathIndex];
    const to = this.path[this.pathIndex + 1] || from;
    return {
      row: from.row + (to.row - from.row) * this.progress,
      col: from.col + (to.col - from.col) * this.progress,
    };
  }

  update(dt) {
    if (this.done) return;
    this.progress += this.speed * (dt / 1000);
    while (this.progress >= 1 && !this.done) {
      this.progress -= 1;
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length - 1) {
        this.pathIndex = this.path.length - 1;
        this.progress = 0;
        this.done = true;
      }
    }
  }
}

function createActivityState() {
  const state = {};
  for (const key of Object.keys(TILE_MANIFEST)) {
    state[key] = { active: false };
  }
  return state;
}

function buildBuildingCells(cells) {
  const map = {};
  for (const cell of cells) {
    if (cell.building) {
      map[cell.building] = { row: cell.row, col: cell.col };
    }
  }
  return map;
}

function buildDispatchPath(target) {
  const path = [{ ...GAZEBO_HOME }];
  let current = { ...GAZEBO_HOME };

  while (current.row !== target.row) {
    current = { ...current, row: current.row + Math.sign(target.row - current.row) };
    path.push(current);
  }
  while (current.col !== target.col) {
    current = { ...current, col: current.col + Math.sign(target.col - current.col) };
    path.push(current);
  }

  return path;
}

function drawEventLabel(ctx, label, buildingCell, images, offset, now) {
  const img = images[buildingCell.building];
  const pos = gridToScreen(buildingCell.col, buildingCell.row, offset.x, offset.y);
  const age = now - label.startedAt;
  const t = Math.min(1, age / LABEL_DURATION_MS);
  const alpha = 1 - t;
  const floatY = t * 18;
  const renderW = img ? 115 : 100;
  const renderH = img ? renderW * (img.naturalHeight / img.naturalWidth) : 90;
  const x = pos.x;
  const y = pos.y - renderH + TILE_H / 2 - 8 - floatY;

  ctx.save();
  ctx.font = '12px "DM Sans", sans-serif';
  const paddingX = 10;
  const textW = ctx.measureText(label.desc).width;
  const bubbleW = textW + paddingX * 2;
  const bubbleH = 24;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(24, 24, 32, 0.78)';
  roundRect(ctx, x - bubbleW / 2, y - bubbleH, bubbleW, bubbleH, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 248, 240, 0.98)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.desc, x, y - bubbleH / 2 + 1);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function main() {
  const canvas = document.getElementById('cathedral');
  const ctx = canvas.getContext('2d');

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

  const images = await loadImages();
  await initEvents();

  const cells = parseScene();
  const buildingCells = buildBuildingCells(cells);
  const activityState = createActivityState();
  const particles = new ParticleSystem();
  const sprites = [];
  for (let i = 0; i < SPRITE_PATHS.length; i++) sprites.push(new Sprite(i, i));
  const dispatchSprites = [];
  const eventLabels = [];

  initUI();
  setTimelineSeekHandler((fraction) => seekTo(fraction));

  let hoveredCell = null;

  canvas.addEventListener('mousemove', (e) => {
    const offset = calcOffset(window.innerWidth, window.innerHeight);
    const grid = screenToGrid(e.clientX, e.clientY, offset.x, offset.y);
    hoveredCell = null;
    if (grid.row >= 0 && grid.row < GRID_ROWS && grid.col >= 0 && grid.col < GRID_COLS) {
      const cell = cells[grid.row * GRID_COLS + grid.col];
      if (cell && cell.building) {
        hoveredCell = cell;
        showTooltip(cell.building, e.clientX, e.clientY);
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

  let lastTime = performance.now();

  function render(now) {
    const dt = Math.min(now - lastTime, 50);
    lastTime = now;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const offset = calcOffset(w, h);

    const { firedEvents } = tickEvents(now);
    const activeBuildings = getActiveBuildings();
    Object.keys(activityState).forEach((key) => {
      activityState[key].active = activeBuildings.has(key);
    });
    activityState.gazebo.active = true;

    for (const event of firedEvents) {
      if (buildingCells[event.building]) {
        eventLabels.push({ ...event, startedAt: now });
      }
      if (event.type === 'subagent_start' && buildingCells[event.building]) {
        dispatchSprites.push(new DispatchSprite(buildDispatchPath(buildingCells[event.building]), dispatchSprites.length + sprites.length));
      }
    }

    while (eventLabels.length && now - eventLabels[0].startedAt > LABEL_DURATION_MS) {
      eventLabels.shift();
    }

    updateStatusLine(getEventStats());
    updateTimeline(getReplayProgress(), getReplayClock());
    particles.resize(w, h);
    particles.update(dt);
    sprites.forEach((s) => s.update(dt));
    dispatchSprites.forEach((s) => s.update(dt));

    for (let i = dispatchSprites.length - 1; i >= 0; i--) {
      if (dispatchSprites[i].done) dispatchSprites.splice(i, 1);
    }

    for (const cell of cells) {
      if (cell.building && activityState[cell.building]?.active) {
        const pos = gridToScreen(cell.col, cell.row, offset.x, offset.y);
        const img = images[cell.building];
        if (img) {
          const renderW = 120;
          const renderH = renderW * (img.naturalHeight / img.naturalWidth);
          particles.spawnSmoke(pos.x + 10, pos.y - renderH + TILE_H / 2 + 15);
        }
      }
    }

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#c8d8c0');
    bgGrad.addColorStop(0.6, '#b0c4a0');
    bgGrad.addColorStop(1, '#6a9aaa');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    drawWaterShimmer(ctx, offset, w, h, now);

    for (const cell of cells) {
      const pos = gridToScreen(cell.col, cell.row, offset.x, offset.y);
      drawGroundTile(ctx, cell.ground, pos.x, pos.y, now);
    }

    const drawables = [];
    for (const cell of cells) {
      const depth = cell.row + cell.col;
      if (cell.building) {
        drawables.push({ type: 'building', cell, depth, key: cell.building });
      }
      if (cell.prop) {
        drawables.push({ type: 'prop', cell, depth: depth + 0.1, key: cell.prop });
      }
    }
    for (const sprite of sprites) {
      const pos = sprite.currentPos;
      drawables.push({ type: 'sprite', sprite, depth: pos.row + pos.col + 0.2 });
    }
    for (const sprite of dispatchSprites) {
      const pos = sprite.currentPos;
      drawables.push({ type: 'dispatch', sprite, depth: pos.row + pos.col + 0.22 });
    }

    drawables.sort((a, b) => a.depth - b.depth);

    for (const d of drawables) {
      if (d.type === 'building') {
        const pos = gridToScreen(d.cell.col, d.cell.row, offset.x, offset.y);
        drawBuilding(ctx, images[d.key], pos.x, pos.y, true, activityState[d.key]?.active || false, now);
      } else if (d.type === 'prop') {
        const pos = gridToScreen(d.cell.col, d.cell.row, offset.x, offset.y);
        drawBuilding(ctx, images[d.key], pos.x, pos.y, false, false, now);
      } else {
        const spos = d.sprite.currentPos;
        const screen = gridToScreen(spos.col, spos.row, offset.x, offset.y);
        drawSprite(ctx, screen.x, screen.y, d.sprite.color, now, 1);
      }
    }

    for (const label of eventLabels) {
      const buildingCell = buildingCells[label.building];
      if (buildingCell) drawEventLabel(ctx, label, { ...buildingCell, building: label.building }, images, offset, now);
    }

    particles.draw(ctx);
    drawTimeTint(ctx, w, h);
    drawVignette(ctx, w, h);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function drawWaterShimmer(ctx, offset, w, h, time) {
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
