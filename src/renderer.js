// Isometric renderer — handles projection, tile drawing, sprites

import { GRID_COLS, GRID_ROWS, BUILDINGS } from './scene.js';

// Isometric tile dimensions (screen space)
export const TILE_W = 120;  // width of isometric diamond
export const TILE_H = 60;   // height of isometric diamond

// Building render size — buildings are roughly 100-130px wide
const BUILDING_RENDER_W = 120;
const PROP_RENDER_W = 60;

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

// Draw a single ground tile (isometric diamond)
export function drawGroundTile(ctx, img, x, y) {
  if (!img) {
    // Fallback — draw a colored diamond
    drawDiamond(ctx, x, y, TILE_W, TILE_H, '#4a7c59');
    return;
  }
  // Draw the image scaled to tile size
  // Ground tiles are isometric diamonds — draw them centered on the tile position
  const drawW = TILE_W + 2; // slight overlap to prevent gaps
  const drawH = TILE_H + 2;
  ctx.drawImage(img, x - drawW / 2, y - 1, drawW, drawH);
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

  ctx.drawImage(img, drawX, drawY, renderW, renderH);
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

// Draw vignette
export function drawVignette(ctx, w, h) {
  const grad = ctx.createRadialGradient(w/2, h/2, w * 0.3, w/2, h/2, w * 0.75);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function darkenColor(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r},${g},${b})`;
}
