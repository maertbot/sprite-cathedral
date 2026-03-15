// UI — tooltips, detail panel, status line, interaction

import { BUILDINGS } from './scene.js';

const tooltip = document.getElementById('tooltip');
const detailPanel = document.getElementById('detail-panel');
const detailTitle = document.getElementById('detail-title');
const detailDesc = document.getElementById('detail-desc');
const detailClose = document.getElementById('detail-close');
const statusLine = document.getElementById('status-line');

let hoveredBuilding = null;
let selectedBuilding = null;

export function initUI() {
  detailClose.addEventListener('click', () => {
    selectedBuilding = null;
    detailPanel.classList.add('hidden');
  });
}

export function updateStatusLine(activityState) {
  const activeCount = Object.values(activityState).filter(s => s.active).length;
  const totalDistricts = 5; // residential, main st, the green, harbor approach, harbor
  statusLine.textContent = `${activeCount} active jobs · ${totalDistricts} districts · est. 2026`;
}

export function showTooltip(building, screenX, screenY) {
  if (!building) {
    tooltip.classList.add('hidden');
    hoveredBuilding = null;
    return;
  }
  if (hoveredBuilding === building) {
    // Just update position
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
