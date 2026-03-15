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

// The scene grid — row by row
// Each cell: [ground, building|null, prop|null]
export const SCENE_MAP = [
  // Row 0 — northern tree line
  [[G,null,'tree-evergreen'], [G,null,'tree-round'],     [G,null,'tree-evergreen'], [G,null,'tree-round'],     [G,null,'tree-evergreen'], [G,null,'tree-round'],     [G,null,'tree-evergreen'], [G,null,'tree-round'],     [G,null,'tree-evergreen'], [G,null,'tree-round'],     [G,null,'tree-evergreen'], [G,null,'tree-round'],     [G,null,'tree-evergreen'], [G,null,'tree-round']],
  // Row 1 — residential ridge
  [[G,null,'tree-round'],     [G,null,'fence-picket'],   [G,'cottage-red',null],    [G,null,'mailbox'],        [G,null,'tree-round'],     [G,null,'fence-picket'],   [G,'cottage-green',null],  [G,null,'mailbox'],        [G,null,'tree-evergreen'], [G,null,'fence-picket'],   [G,'cottage-red',null],    [G,null,'mailbox'],        [G,null,'fence-picket'],   [G,null,'tree-round']],
  // Row 2 — residential lane
  [[G,null,'tree-evergreen'], [G,null,'tree-round'],     [G,null,'fence-picket'],   [G,null,'tree-round'],     [G,'saltbox',null],        [G,null,'fence-picket'],   [P,null,null],             [G,null,'tree-round'],     [G,'inn',null],            [G,null,'fence-picket'],   [G,null,'tree-round'],     [G,null,'fence-picket'],   [G,null,'tree-evergreen'], [G,null,'tree-round']],
  // Row 3 — path down from the homes
  [[G,null,'tree-round'],     [G,null,null],             [P,null,null],             [P,null,null],             [P,null,null],            [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [G,null,null],             [G,null,'tree-evergreen']],
  // Row 4 — Main Street upper bend
  [[G,null,'tree-evergreen'], [G,null,null],             [P,null,null],             [C,'shop',null],           [C,null,'lamppost'],      [C,null,null],             [C,'post-office',null],    [C,null,'lamppost'],       [C,null,null],             [C,null,null],             [C,'library',null],        [P,null,null],             [G,null,null],             [G,null,'tree-round']],
  // Row 5 — Main Street lower bend / approach to the Green
  [[G,null,'tree-round'],     [G,'clubhouse',null],      [P,null,null],             [C,null,null],             [C,null,null],            [C,'general-store',null],  [P,null,null],             [G,null,'bench'],          [G,null,'flagpole'],       [C,null,null],             [C,'chapel',null],         [P,null,null],             [G,null,'tree-round'],     [G,null,'tree-evergreen']],
  // Row 6 — the Green
  [[G,null,'tree-evergreen'], [G,null,null],             [P,null,null],             [G,null,'garden-shed'],    [G,null,'lamppost'],      [G,null,'bench'],          [G,null,null],             [G,'gazebo',null],         [G,null,null],             [G,null,'bench'],          [G,null,'lamppost'],       [P,null,null],             [G,null,null],             [G,null,'tree-round']],
  // Row 7 — path to harbor
  [[G,null,'tree-round'],     [G,null,null],             [G,null,'tree-round'],     [P,null,null],             [P,null,null],            [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [P,null,null],             [G,null,null],             [G,null,'tree-evergreen']],
  // Row 8 — village edge before the harbor
  [[G,null,'tree-evergreen'], [G,null,'fence-picket'],   [G,null,null],             [G,null,null],             [G,null,null],            [G,null,null],             [P,null,null],             [G,null,null],             [G,null,null],             [G,null,null],             [P,null,null],             [G,null,null],             [G,null,'fence-picket'],   [G,null,'tree-round']],
  // Row 9 — harbor front
  [[G,null,'tree-round'],     [G,null,null],             [G,null,null],             [G,null,null],             [G,null,null],            [P,null,null],             [G,'boathouse',null],      [P,null,null],             [G,null,null],             [P,null,null],             [G,'dock-warehouse',null], [P,null,null],             [G,null,null],             [G,null,'tree-evergreen']],
  // Row 10 — waterfront / piers
  [[W,null,'tree-evergreen'], [W,null,null],             [W,'lighthouse',null],     [W,null,null],             [W,null,null],            [W,null,'sailboat'],       [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,'tree-round']],
  // Row 11 — open water with framed edge
  [[W,null,'tree-round'],     [W,null,'tree-evergreen'], [W,null,null],             [W,null,null],             [W,null,null],            [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,null],             [W,null,'tree-evergreen'], [W,null,'tree-round']],
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

// Sprite paths — predefined routes between districts
export const SPRITE_PATHS = [
  // Residential → Main Street
  [{row:1,col:2},{row:2,col:3},{row:3,col:3},{row:4,col:3}],
  [{row:1,col:6},{row:2,col:6},{row:3,col:6},{row:4,col:6}],
  [{row:2,col:8},{row:3,col:8},{row:4,col:9},{row:4,col:10}],

  // Main Street → The Green
  [{row:4,col:3},{row:5,col:4},{row:5,col:5},{row:6,col:6},{row:6,col:7}],
  [{row:4,col:6},{row:5,col:6},{row:6,col:7}],
  [{row:5,col:10},{row:6,col:10},{row:6,col:9},{row:6,col:8},{row:6,col:7}],

  // Green → Harbor
  [{row:6,col:7},{row:7,col:7},{row:7,col:6},{row:8,col:6},{row:9,col:6}],
  [{row:6,col:7},{row:7,col:8},{row:7,col:9},{row:8,col:10},{row:9,col:10}],
  [{row:6,col:7},{row:7,col:7},{row:7,col:6},{row:8,col:6},{row:9,col:5},{row:10,col:5}],

  // Clubhouse corner → The Green
  [{row:5,col:1},{row:5,col:2},{row:6,col:2},{row:7,col:3},{row:7,col:4},{row:7,col:5},{row:7,col:6},{row:6,col:7}],
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
