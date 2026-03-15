// Isometric renderer — handles projection, tile drawing, sprites

import { GRID_COLS, GRID_ROWS, BUILDINGS } from './scene.js';

// Isometric tile dimensions (screen space)
export const TILE_W = 120;  // width of isometric diamond
export const TILE_H = 60;   // height of isometric diamond

// Building render size — buildings are roughly 100-130px wide
const BUILDING_RENDER_W = 115;
const PROP_RENDER_W = 48;

// Convert grid coords to screen (isometric) coords
export function gridToScreen(col, row, offsetX, offsetY) {
  const x = (col - row) * (TILE_W / 2) + offsetX;
  const y = (col + row) * (TILE_H / 2) + offsetY;
  return { x, y };
}

// Convert screen coords back to grid (for hover/click)
export function screenToGrid(sx, sy, offsetX, offsetY) {
  const mx = sx - offsetX;
  const my = sy - offsetY;
  const col = (mx / (TILE_W / 2) + my / (TILE_H / 2)) / 2;
  const row = (my / (TILE_H / 2) - mx / (TILE_W / 2)) / 2;
  return { col: Math.floor(col), row: Math.floor(row) };
}

// Calculate camera offset to center the grid
export function calcOffset(canvasW, canvasH) {
  // Center of grid in screen space
  const centerCol = GRID_COLS / 2;
  const centerRow = GRID_ROWS / 2;
  const cx = (centerCol - centerRow) * (TILE_W / 2);
  const cy = (centerCol + centerRow) * (TILE_H / 2);
  return {
    x: canvasW / 2 - cx,
    y: canvasH / 2 - cy - 30, // slight upward shift
  };
}

// Seeded random for consistent per-tile detail
function tileRand(x, y, seed) {
  let h = (x * 374761 + y * 668265 + seed * 982451) | 0;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return (h & 0x7fffffff) / 0x7fffffff;
}

// Clip to isometric diamond path
function clipDiamond(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y - TILE_H / 2);
  ctx.lineTo(x + TILE_W / 2, y);
  ctx.lineTo(x, y + TILE_H / 2);
  ctx.lineTo(x - TILE_W / 2, y);
  ctx.closePath();
}

// Draw a single ground tile with rich detail
export function drawGroundTile(ctx, groundType, x, y, time) {
  ctx.save();
  clipDiamond(ctx, x, y);
  ctx.clip();

  const hw = TILE_W / 2;
  const hh = TILE_H / 2;

  if (groundType === 'grass-light') {
    // Base grass gradient (light to slightly darker, top-left lighting)
    const grd = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    grd.addColorStop(0, '#8ebe78');
    grd.addColorStop(0.5, '#7daa6a');
    grd.addColorStop(1, '#6e9a5c');
    ctx.fillStyle = grd;
    ctx.fillRect(x - hw, y - hh, TILE_W, TILE_H);

    // Mow stripe (alternating based on position)
    const stripe = (Math.floor(x / 60) + Math.floor(y / 30)) % 2 === 0;
    if (stripe) {
      ctx.fillStyle = 'rgba(100, 180, 80, 0.12)';
      ctx.fillRect(x - hw, y - hh, TILE_W, TILE_H);
    }

    // Grass detail — tiny texture dots
    ctx.fillStyle = 'rgba(50, 80, 40, 0.08)';
    for (let i = 0; i < 8; i++) {
      const dx = (tileRand(x, y, i * 3) - 0.5) * TILE_W * 0.7;
      const dy = (tileRand(x, y, i * 3 + 1) - 0.5) * TILE_H * 0.7;
      const sz = tileRand(x, y, i * 3 + 2) * 2 + 1;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    // Lighter highlights
    ctx.fillStyle = 'rgba(160, 220, 120, 0.1)';
    for (let i = 0; i < 4; i++) {
      const dx = (tileRand(x, y, i * 5 + 100) - 0.5) * TILE_W * 0.5;
      const dy = (tileRand(x, y, i * 5 + 101) - 0.5) * TILE_H * 0.5;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (groundType === 'path') {
    // Oyster shell / gravel path
    const grd = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    grd.addColorStop(0, '#ddd2bc');
    grd.addColorStop(0.5, '#d0c4a8');
    grd.addColorStop(1, '#c4b898');
    ctx.fillStyle = grd;
    ctx.fillRect(x - hw, y - hh, TILE_W, TILE_H);

    // Gravel speckle
    for (let i = 0; i < 12; i++) {
      const dx = (tileRand(x, y, i * 7) - 0.5) * TILE_W * 0.7;
      const dy = (tileRand(x, y, i * 7 + 1) - 0.5) * TILE_H * 0.7;
      const shade = tileRand(x, y, i * 7 + 2);
      ctx.fillStyle = shade > 0.5 ? 'rgba(180, 170, 150, 0.3)' : 'rgba(100, 90, 70, 0.1)';
      const sz = tileRand(x, y, i * 7 + 3) * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, sz, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (groundType === 'cobblestone') {
    // Warm gray cobblestones
    const grd = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    grd.addColorStop(0, '#a89888');
    grd.addColorStop(0.5, '#9a8a7a');
    grd.addColorStop(1, '#8c7e70');
    ctx.fillStyle = grd;
    ctx.fillRect(x - hw, y - hh, TILE_W, TILE_H);

    // Individual cobbles
    ctx.strokeStyle = 'rgba(60, 50, 40, 0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 6; i++) {
      const dx = (tileRand(x, y, i * 11) - 0.5) * TILE_W * 0.6;
      const dy = (tileRand(x, y, i * 11 + 1) - 0.5) * TILE_H * 0.6;
      const w = tileRand(x, y, i * 11 + 2) * 8 + 6;
      const h = tileRand(x, y, i * 11 + 3) * 4 + 3;
      ctx.beginPath();
      ctx.ellipse(x + dx, y + dy, w, h, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      // Highlight on top
      ctx.fillStyle = 'rgba(180, 170, 155, 0.12)';
      ctx.beginPath();
      ctx.ellipse(x + dx - 1, y + dy - 1, w * 0.6, h * 0.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (groundType === 'water') {
    // Ocean / harbor water
    const t = time || 0;
    const wavePhase = t / 2000 + x * 0.005 + y * 0.008;
    const grd = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
    grd.addColorStop(0, '#6aacc4');
    grd.addColorStop(0.4, '#5a9cb8');
    grd.addColorStop(1, '#4a8caa');
    ctx.fillStyle = grd;
    ctx.fillRect(x - hw, y - hh, TILE_W, TILE_H);

    // Wave lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      const wy = y - hh * 0.4 + i * hh * 0.4;
      const waveOff = Math.sin(wavePhase + i * 1.5) * 4;
      ctx.beginPath();
      ctx.moveTo(x - hw * 0.6, wy + waveOff);
      ctx.quadraticCurveTo(x, wy + waveOff + 3, x + hw * 0.6, wy + waveOff);
      ctx.stroke();
    }

    // Shimmer highlight
    const shimmer = Math.sin(t / 1200 + x * 0.02) * 0.06 + 0.04;
    ctx.fillStyle = `rgba(255, 255, 255, ${shimmer})`;
    const sx = x + Math.sin(t / 3000) * 8;
    ctx.beginPath();
    ctx.ellipse(sx, y, 6, 2, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Diamond edge stroke (outside clip)
  clipDiamond(ctx, x, y);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

// Remove sage-green background from tile images at load time
// by replacing near-sage pixels with transparent
const _processedImages = new WeakSet();

function processImageTransparency(img) {
  if (_processedImages.has(img)) return img._transparent || img;
  _processedImages.add(img);
  
  const offscreen = document.createElement('canvas');
  offscreen.width = img.naturalWidth;
  offscreen.height = img.naturalHeight;
  const octx = offscreen.getContext('2d');
  octx.drawImage(img, 0, 0);
  
  const imgData = octx.getImageData(0, 0, offscreen.width, offscreen.height);
  const d = imgData.data;
  
  // Sample the corner pixel as the background color
  const bgR = d[0], bgG = d[1], bgB = d[2];
  
  // Remove pixels close to the background color (within tolerance)
  const tolerance = 42;
  for (let i = 0; i < d.length; i += 4) {
    const dr = Math.abs(d[i] - bgR);
    const dg = Math.abs(d[i+1] - bgG);
    const db = Math.abs(d[i+2] - bgB);
    if (dr < tolerance && dg < tolerance && db < tolerance) {
      // Fade based on distance from bg color
      const dist = Math.sqrt(dr*dr + dg*dg + db*db);
      const alpha = Math.min(255, Math.max(0, (dist / (tolerance * 1.7)) * 255));
      d[i+3] = alpha;
    }
  }
  
  octx.putImageData(imgData, 0, 0);
  img._transparent = offscreen;
  return offscreen;
}

// Draw a building or prop
export function drawBuilding(ctx, img, x, y, isBuilding, isActive, time) {
  if (!img) return;

  const renderW = isBuilding ? BUILDING_RENDER_W : PROP_RENDER_W;
  const aspect = img.naturalHeight / img.naturalWidth;
  const renderH = renderW * aspect;

  // Position: bottom-center of the tile
  const drawX = x - renderW / 2;
  const drawY = y - renderH + TILE_H / 2 + (isBuilding ? 5 : 8);

  // Active glow effect
  if (isActive && isBuilding) {
    drawActiveGlow(ctx, x, y - renderH / 2 + TILE_H / 2, renderW, renderH, time);
  }

  // Ground shadow under building
  if (isBuilding) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#1a2a1a';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 6, renderW * 0.38, TILE_H * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw with background removed
  const processed = processImageTransparency(img);
  ctx.drawImage(processed, drawX, drawY, renderW, renderH);
}

// Warm golden glow behind active buildings
function drawActiveGlow(ctx, cx, cy, w, h, time) {
  const pulse = 0.6 + 0.15 * Math.sin(time / 800);
  const radius = Math.max(w, h) * 0.7;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, `rgba(255, 200, 80, ${0.35 * pulse})`);
  grad.addColorStop(0.5, `rgba(255, 180, 60, ${0.15 * pulse})`);
  grad.addColorStop(1, 'rgba(255, 160, 40, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}

// Draw a colored isometric diamond (fallback for missing tiles)
function drawDiamond(ctx, x, y, w, h, color) {
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x - w / 2, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// Draw a sprite (small humanoid figure)
export function drawSprite(ctx, screenX, screenY, color, time, direction) {
  const bobY = Math.sin(time / 250) * 2;
  const x = screenX;
  const y = screenY + bobY - 10; // offset above ground

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(x, screenY + 2, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (polo shirt)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#FFE0C2';
  ctx.beginPath();
  ctx.arc(x, y - 14, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = darkenColor(color, 40);
  ctx.beginPath();
  ctx.arc(x, y - 16.5, 3.5, Math.PI, 0);
  ctx.fill();

  // Legs (walking animation)
  const legSwing = Math.sin(time / 180) * 3;
  ctx.strokeStyle = '#4A4A6A';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  // Left leg
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 2);
  ctx.lineTo(x - 2 - legSwing, y + 9);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 2);
  ctx.lineTo(x + 2 + legSwing, y + 9);
  ctx.stroke();

  // Collar detail
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(x, y - 10, 3, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw the time-of-day tint overlay
export function drawTimeTint(ctx, w, h) {
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  let r, g, b, a;

  if (hour < 6 || hour > 20) {
    // Night — deep blue
    r = 10; g = 15; b = 40; a = 0.35;
  } else if (hour < 8) {
    // Dawn — warm pink
    const t = (hour - 6) / 2;
    r = 255 * (1 - t) + 255 * t;
    g = 150 * (1 - t) + 230 * t;
    b = 120 * (1 - t) + 200 * t;
    a = 0.12 * (1 - t);
  } else if (hour < 17) {
    // Day — very slight warm
    r = 255; g = 245; b = 220; a = 0.04;
  } else if (hour < 20) {
    // Sunset — golden
    const t = (hour - 17) / 3;
    r = 255; g = 180 - 60 * t; b = 80 - 40 * t;
    a = 0.08 + 0.15 * t;
  } else {
    r = 10; g = 15; b = 40; a = 0.35;
  }

  ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${a})`;
  ctx.fillRect(0, 0, w, h);
}

// Draw vignette — very subtle
export function drawVignette(ctx, w, h) {
  const grad = ctx.createRadialGradient(w/2, h/2, w * 0.35, w/2, h/2, w * 0.8);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function darkenColor(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r},${g},${b})`;
}
