// Scene map — defines the village layout
// Each cell: { ground, building?, prop?, name?, jobType?, description? }

export const GRID_COLS = 14;
export const GRID_ROWS = 12;

// Ground types
const G = 'grass-light';
const P = 'path';
const C = 'cobblestone';
const W = 'water';

// Building definitions with metadata
export const BUILDINGS = {
  'cottage-red':    { name: 'Red Cottage',       jobType: 'Subagent Worker', jobTypeGroup: 'Residential', desc: 'A cozy cottage where subagents rest between tasks.' },
  'cottage-green':  { name: 'Green Cottage',     jobType: 'Subagent Worker', jobTypeGroup: 'Residential', desc: 'Another worker cottage — always a warm light on.' },
  'saltbox':        { name: 'Saltbox House',     jobType: 'Subagent Worker', jobTypeGroup: 'Residential', desc: 'The tall saltbox — veteran workers quarter here.' },
  'inn':            { name: 'The Inn',           jobType: 'Sessions',        jobTypeGroup: 'Residential', desc: 'Persistent sessions rest between tasks.' },
  'shop':           { name: 'The Shop',          jobType: 'Tool Calls',      desc: 'API calls and tool invocations flow through here.' },
  'post-office':    { name: 'Post Office',       jobType: 'Messaging',       desc: 'Telegrams, emails, and messages dispatched from here.' },
  'general-store':  { name: 'General Store',     jobType: 'Data Processing', desc: 'Bulk operations and data crunching headquarters.' },
  'library':        { name: 'Library',           jobType: 'Knowledge',       desc: 'Web search and document retrieval.' },
  'chapel':         { name: 'Chapel',            jobType: 'Memory',          desc: 'Long-term memory writes happen here.' },
  'clubhouse':      { name: 'The Clubhouse',     jobType: 'Cron Jobs',       desc: 'Scheduled tasks keep the village running on time.' },
  'garden-shed':    { name: 'Garden Shed',       jobType: 'Maintenance',     desc: 'Cleanup tasks and system hygiene.' },
  'gazebo':         { name: 'The Gazebo',        jobType: 'Orchestrator',    desc: 'The main agent surveys the village from here.' },
  'boathouse':      { name: 'Boathouse',         jobType: 'Data Ingestion',  desc: 'Incoming data arrives by sea.' },
  'dock-warehouse': { name: 'Dock Warehouse',    jobType: 'Storage',         desc: 'File operations and data persistence.' },
  'lighthouse':     { name: 'Lighthouse',        jobType: 'System Health',   desc: 'The heartbeat beacon — always watching the horizon.' },
};

// Prop definitions
export const PROPS = {
  'tree-round':     { name: 'Oak Tree' },
  'tree-evergreen': { name: 'Evergreen' },
  'bench':          { name: 'Bench' },
  'fence-picket':   { name: 'Picket Fence' },
  'flagpole':       { name: 'Flagpole' },
  'lamppost':       { name: 'Lamppost' },
  'mailbox':        { name: 'Mailbox' },
  'sailboat':       { name: 'Sailboat' },
};

// The scene grid — sparse layout aligned to terrain-v1.png features
// Terrain image provides all visual ground, trees, paths, and props.
// Grid cells only define building/prop placement positions for interactivity.
// Each cell: [ground, building|null, prop|null]
export const SCENE_MAP = [
  // Row 0 — upper residential clearing (terrain has open pads here)
  [[G,null,null], [G,null,null], [G,null,null],           [G,null,null], [G,'cottage-green',null], [G,null,null], [G,null,null], [G,'saltbox',null],      [G,null,null], [G,null,null], [G,null,null], [G,null,null], [G,null,null], [G,null,null]],
  // Row 1 — residential area
  [[G,null,null], [G,null,null], [G,'cottage-red',null],  [G,null,null], [G,null,null],            [G,null,null], [G,null,null], [G,null,null],           [G,'inn',null],[G,null,null], [G,null,null], [G,null,null], [G,null,null], [G,null,null]],
  // Row 2 — along the main road (terrain road runs diag here)
  [[G,null,null], [G,'chapel',null], [G,null,null],       [G,'shop',null], [G,null,null],          [G,null,null], [G,'post-office',null], [G,null,null],  [G,null,null], [G,null,null], [G,null,null], [G,null,null], [G,null,null], [G,null,null]],
  // Row 3 — road fork area
  [[G,null,null], [G,null,null], [G,null,null],           [G,null,null], [G,null,null],            [G,null,null], [G,null,null], [G,null,null],           [G,'library',null], [G,null,null], [G,null,null], [G,null,null], [G,null,null], [G,null,null]],
  // Row 4 — town center / main street south
  [[G,null,null], [G,null,null], [G,null,null],           [G,'general-store',null], [G,null,null],  [G,null,null], [G,null,null], [G,'clubhouse',null],   [G,null,null], [G,null,null], [G,null,null], [W,null,null], [W,null,null], [W,null,null]],
  // Row 5 — approach to the green
  [[G,null,null], [G,null,null], [G,'garden-shed',null],  [G,null,null], [G,null,null],            [G,null,null], [G,null,null], [G,null,null],           [G,null,null], [G,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null]],
  // Row 6 — the village green
  [[G,null,null], [G,null,null], [G,null,null],           [G,null,null], [G,null,null],            [G,'gazebo','flagpole'], [G,null,null], [G,null,null], [G,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null]],
  // Row 7 — harbor approach
  [[G,null,null], [G,null,null], [G,null,null],           [G,null,null], [G,'boathouse',null],     [G,null,null], [G,'dock-warehouse',null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null]],
  // Row 8 — shoreline
  [[G,null,null], [G,null,null], [G,null,null],           [G,null,null], [G,null,null],            [W,null,null], [W,null,null], [W,null,null],           [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null]],
  // Row 9 — water with lighthouse
  [[G,null,null], [G,null,null], [W,'lighthouse',null],   [W,null,null], [W,null,null],            [W,null,'sailboat'], [W,null,null], [W,null,null],    [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null]],
  // Row 10 — open water
  [[W,null,null], [W,null,null], [W,null,null],           [W,null,null], [W,null,null],            [W,null,null], [W,null,null], [W,null,null],           [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null]],
  // Row 11 — open water
  [[W,null,null], [W,null,null], [W,null,null],           [W,null,null], [W,null,null],            [W,null,null], [W,null,null], [W,null,null],           [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null], [W,null,null]],
];

// Parse scene map into structured data
export function parseScene() {
  const cells = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowData = SCENE_MAP[row];
    for (let col = 0; col < GRID_COLS; col++) {
      const entry = rowData[col];
      if (!entry) {
        cells.push({ row, col, ground: G, building: null, prop: null, buildingMeta: null, propMeta: null });
        continue;
      }
      const [ground, building, prop] = entry;
      cells.push({
        row, col, ground,
        building: building || null,
        prop: prop || null,
        buildingMeta: building ? BUILDINGS[building] : null,
        propMeta: prop ? PROPS[prop] : null,
      });
    }
  }
  return cells;
}

// Simulated building activity (demo data)
export function createActivityState() {
  const state = {};
  for (const key of Object.keys(BUILDINGS)) {
    state[key] = { active: false, lastActive: 0 };
  }
  return state;
}

// Randomly toggle building activity for demo
export function tickActivity(state, time) {
  for (const key of Object.keys(state)) {
    if (Math.random() < 0.003) {
      state[key].active = !state[key].active;
      if (state[key].active) state[key].lastActive = time;
    }
  }

  state['gazebo'].active = true;
  state['lighthouse'].active = (Math.floor(time / 3000) % 2) === 0;
  return state;
}

// Sprite paths — routes between buildings, aligned to terrain roads
export const SPRITE_PATHS = [
  // Residential → Main Street (cottages to shop/post-office)
  [{row:1,col:2},{row:2,col:2},{row:2,col:3}],
  [{row:0,col:4},{row:1,col:4},{row:2,col:4},{row:2,col:5},{row:2,col:6}],
  [{row:0,col:7},{row:1,col:7},{row:2,col:7},{row:2,col:6}],
  [{row:1,col:8},{row:2,col:8},{row:3,col:8}],

  // Main Street → Village Green
  [{row:2,col:3},{row:3,col:3},{row:4,col:3},{row:5,col:4},{row:6,col:5}],
  [{row:2,col:6},{row:3,col:6},{row:4,col:6},{row:5,col:5},{row:6,col:5}],
  [{row:4,col:7},{row:5,col:6},{row:6,col:5}],

  // Green → Harbor
  [{row:6,col:5},{row:7,col:5},{row:7,col:4}],
  [{row:6,col:5},{row:7,col:5},{row:7,col:6}],

  // Library loop
  [{row:3,col:8},{row:4,col:7},{row:5,col:6},{row:6,col:5}],
];

// Preppy sprite colors
export const SPRITE_COLORS = [
  '#E8637A', // pink
  '#5B9F5B', // kelly green
  '#FF7F6A', // coral
  '#B94A4A', // nantucket red
  '#2C3E6B', // navy
  '#E8C84A', // madras yellow
  '#6AAED6', // harbor blue
  '#8E6BBE', // hydrangea violet
];
