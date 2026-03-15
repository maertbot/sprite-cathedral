// UI — tooltips, detail panel, status line, interaction

import { BUILDINGS } from './scene.js';

const tooltip = document.getElementById('tooltip');
const detailPanel = document.getElementById('detail-panel');
const detailTitle = document.getElementById('detail-title');
const detailDesc = document.getElementById('detail-desc');
const detailClose = document.getElementById('detail-close');
const statusLine = document.getElementById('status-line');
const overlay = document.getElementById('overlay');

let hoveredBuilding = null;
let selectedBuilding = null;
let timelineFill = null;
let timelineLabel = null;
let timelineHitbox = null;
let onSeek = null;

export function initUI() {
  detailClose.addEventListener('click', () => {
    selectedBuilding = null;
    detailPanel.classList.add('hidden');
  });

  if (!document.getElementById('timeline-scrubber')) {
    const scrubber = document.createElement('div');
    scrubber.id = 'timeline-scrubber';
    scrubber.innerHTML = `
      <div class="timeline-range timeline-range-start">6:00 AM</div>
      <div class="timeline-track" id="timeline-track">
        <div class="timeline-fill" id="timeline-fill"></div>
        <div class="timeline-hitbox" id="timeline-hitbox"></div>
      </div>
      <div class="timeline-label" id="timeline-label">6:00 AM</div>
      <div class="timeline-range timeline-range-end">11:00 PM</div>
    `;
    overlay.appendChild(scrubber);
  }

  timelineFill = document.getElementById('timeline-fill');
  timelineLabel = document.getElementById('timeline-label');
  timelineHitbox = document.getElementById('timeline-hitbox');

  timelineHitbox.addEventListener('click', (event) => {
    if (!onSeek) return;
    const rect = timelineHitbox.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    onSeek(Math.min(1, Math.max(0, fraction)));
  });
}

export function setTimelineSeekHandler(handler) {
  onSeek = handler;
}

export function updateTimeline(progress, label) {
  if (timelineFill) {
    timelineFill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  }
  if (timelineLabel) {
    timelineLabel.textContent = label;
  }
}

export function updateStatusLine(stats) {
  const lastDesc = stats.lastEvent?.desc || 'awaiting first event';
  statusLine.textContent = `${stats.totalEvents} events · ${stats.activeCount} active · last: ${lastDesc}`;
}

export function showTooltip(building, screenX, screenY) {
  if (!building) {
    tooltip.classList.add('hidden');
    hoveredBuilding = null;
    return;
  }
  if (hoveredBuilding === building) {
    tooltip.style.left = (screenX + 15) + 'px';
    tooltip.style.top = (screenY - 30) + 'px';
    return;
  }
  hoveredBuilding = building;
  const meta = BUILDINGS[building];
  if (!meta) {
    tooltip.classList.add('hidden');
    return;
  }
  tooltip.innerHTML = `<strong>${meta.name}</strong><br/><span style="opacity:0.6">${meta.jobType}</span>`;
  tooltip.classList.remove('hidden');
  tooltip.style.left = (screenX + 15) + 'px';
  tooltip.style.top = (screenY - 30) + 'px';
}

export function handleClick(building) {
  if (!building) {
    selectedBuilding = null;
    detailPanel.classList.add('hidden');
    return;
  }
  const meta = BUILDINGS[building];
  if (!meta) return;

  selectedBuilding = building;
  detailTitle.textContent = meta.name;
  detailDesc.innerHTML = `
    <div style="margin-bottom:6px;color:rgba(255,200,100,0.8);font-size:12px;letter-spacing:0.5px">${meta.jobType.toUpperCase()}</div>
    <div>${meta.desc}</div>
  `;
  detailPanel.classList.remove('hidden');
}

export function getSelectedBuilding() {
  return selectedBuilding;
}
