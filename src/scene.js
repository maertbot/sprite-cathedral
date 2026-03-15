// Scene map — defines the village layout
// Each cell: { ground, building?, prop?, name?, jobType?, description? }

export const GRID_COLS = 12;
export const GRID_ROWS = 10;

// Ground types
const G = 'grass-light';
const P = 'path';
const C = 'cobblestone';
const W = 'water';

// Building definitions with metadata
export const BUILDINGS = {
  'cottage-red':    { name: 'Red Cottage',      jobType: 'Subagent Worker',   desc: 'A cozy cottage where subagents rest between tasks.' },
  'cottage-green':  { name: 'Green Cottage',     jobType: 'Subagent Worker',   desc: 'Another worker cottage — always a warm light on.' },
  'saltbox':        { name: 'Saltbox House',      jobType: 'Subagent Worker',   desc: 'The tall saltbox — veteran workers quarter here.' },
  'shop':           { name: 'The Shop',           jobType: 'Tool Calls',        desc: 'API calls and tool invocations flow through here.' },
  'post-office':    { name: 'Post Office',        jobType: 'Messaging',         desc: 'Telegrams, emails, and messages dispatched from here.' },
  'general-store':  { name: 'General Store',      jobType: 'Data Processing',   desc: 'Bulk operations and data crunching headquarters.' },
  'clubhouse':      { name: 'The Clubhouse',      jobType: 'Cron Jobs',         desc: 'Scheduled tasks keep the village running on time.' },
  'lighthouse':     { name: 'Lighthouse',         jobType: 'System Health',     desc: 'The heartbeat beacon — always watching the horizon.' },
  'gazebo':         { name: 'The Gazebo',          jobType: 'Orchestrator',      desc: 'The main agent surveys the village from here.' },
  'boathouse':      { name: 'Boathouse',          jobType: 'Data Ingestion',    desc: 'Incoming data arrives by sea.' },
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
  // Row 0: residential top
  [G,null,null],        [G,null,'tree-round'],    [G,'cottage-red',null], [G,null,'mailbox'],   [G,null,null],          [G,null,'fence-picket'], [G,'cottage-green',null],[G,null,null],        [G,null,'tree-round'],  [G,'saltbox',null],     [G,null,'mailbox'],   [G,null,'tree-evergreen'],
  // Row 1: residential with trees
  [G,null,'tree-evergreen'],[G,null,null],         [G,null,null],          [G,null,null],        [G,null,'fence-picket'],[G,null,null],           [G,null,null],           [G,null,'fence-picket'],[G,null,null],        [G,null,null],          [G,null,null],        [G,null,'tree-round'],
  // Row 2: path leading down
  [G,null,'tree-round'],[G,null,null],             [P,null,null],          [P,null,null],        [P,null,null],          [P,null,null],           [P,null,null],           [P,null,null],        [P,null,null],          [P,null,null],          [G,null,null],        [G,null,'tree-evergreen'],
  // Row 3: Main Street — upper
  [G,null,null],        [G,'clubhouse',null],      [C,null,null],          [C,'shop',null],      [C,null,null],          [C,'post-office',null],  [C,null,null],           [C,'general-store',null],[C,null,null],       [C,null,'lamppost'],    [G,null,null],        [G,null,null],
  // Row 4: Main Street — lower
  [G,null,null],        [G,null,'lamppost'],       [C,null,null],          [C,null,null],        [C,null,null],          [C,null,null],           [C,null,null],           [C,null,null],        [C,null,null],          [C,null,null],          [G,null,'lamppost'],  [G,null,null],
  // Row 5: The Green
  [G,null,null],        [G,null,'tree-round'],     [G,null,'bench'],       [G,null,null],        [G,null,'flagpole'],    [G,'gazebo',null],       [G,null,null],           [G,null,'bench'],     [G,null,null],          [G,null,'tree-round'],  [G,null,null],        [G,null,null],
  // Row 6: path to harbor
  [G,null,null],        [G,null,null],             [P,null,null],          [P,null,null],        [P,null,null],          [P,null,null],           [P,null,null],           [P,null,null],        [P,null,null],          [P,null,null],          [G,null,null],        [G,null,null],
  // Row 7: harbor approach
  [G,null,null],        [G,null,'tree-evergreen'], [G,null,null],          [P,null,null],        [G,null,null],          [G,null,null],           [G,null,null],           [P,null,null],        [G,null,null],          [G,null,null],          [G,null,null],        [G,null,null],
  // Row 8: waterfront
  [W,null,null],        [W,null,null],             [G,'boathouse',null],   [G,null,null],        [W,null,null],          [W,null,null],           [W,null,null],           [W,null,null],        [W,null,'sailboat'],    [W,null,null],          [W,null,null],        [W,null,null],
  // Row 9: water
  [W,null,null],        [W,null,null],             [W,null,null],          [W,null,null],        [W,null,null],          [W,'lighthouse',null],   [W,null,null],           [W,null,null],        [W,null,null],          [W,null,null],          [W,null,null],        [W,null,null],
];

// Parse scene map into structured data
export function parseScene() {
  const cells = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const entry = SCENE_MAP[row][col];
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
    // Each building has a ~2% chance per second of toggling
    if (Math.random() < 0.003) {
      state[key].active = !state[key].active;
      if (state[key].active) state[key].lastActive = time;
    }
  }
  // Gazebo (orchestrator) is always active
  state['gazebo'].active = true;
  // Lighthouse pulses — active every other 3 seconds
  state['lighthouse'].active = (Math.floor(time / 3000) % 2) === 0;
  return state;
}

// Sprite paths — predefined routes between buildings
export const SPRITE_PATHS = [
  // Cottage red → Shop
  [{row:0,col:2},{row:1,col:2},{row:2,col:2},{row:2,col:3},{row:3,col:3}],
  // Cottage green → Post Office
  [{row:0,col:6},{row:1,col:6},{row:2,col:6},{row:2,col:5},{row:3,col:5}],
  // Saltbox → General Store
  [{row:0,col:9},{row:1,col:9},{row:2,col:9},{row:2,col:8},{row:2,col:7},{row:3,col:7}],
  // Shop → Gazebo
  [{row:3,col:3},{row:4,col:3},{row:4,col:4},{row:4,col:5},{row:5,col:5}],
  // General Store → Boathouse
  [{row:3,col:7},{row:4,col:7},{row:5,col:7},{row:6,col:7},{row:7,col:7},{row:8,col:2}],
  // Clubhouse → Gazebo
  [{row:3,col:1},{row:4,col:2},{row:4,col:3},{row:4,col:4},{row:5,col:5}],
  // Gazebo → Lighthouse
  [{row:5,col:5},{row:6,col:5},{row:7,col:5},{row:8,col:5},{row:9,col:5}],
];

// Preppy sprite colors
export const SPRITE_COLORS = [
  '#E8637A', // pink
  '#5B9F5B', // kelly green
  '#FF7F6A', // coral
  '#B94A4A', // nantucket red
  '#2C3E6B', // navy
  '#E8C84A', // madras yellow
];
