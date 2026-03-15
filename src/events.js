const DATA_URL = `${import.meta.env.BASE_URL}data/demo-day.json`;
const REPLAY_START_HOUR = 6;
const REPLAY_END_HOUR = 23;
const REPLAY_DURATION_MS = 120000;
const DAY_SPAN_MS = (REPLAY_END_HOUR - REPLAY_START_HOUR) * 60 * 60 * 1000;

const DEFAULT_DURATIONS = {
  subagent_start: 6 * 60 * 1000,
  subagent_complete: 2 * 60 * 1000,
  tool_call: 12 * 60 * 1000,
  cron_trigger: 8 * 60 * 1000,
  message_sent: 4 * 60 * 1000,
  message_received: 4 * 60 * 1000,
  heartbeat: 3 * 60 * 1000,
  ingestion: 8 * 60 * 1000,
  deploy: 10 * 60 * 1000,
  memory_write: 7 * 60 * 1000,
};

const state = {
  events: [],
  eventCount: 0,
  replayMs: 0,
  lastNow: 0,
  lastEvent: null,
  currentEvent: null,
  activeBuildings: new Set(['gazebo']),
  activeUntil: new Map(),
  firedEvents: [],
  ready: false,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toReplayMs(eventTime) {
  const date = new Date(eventTime);
  const dayMs = ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000;
  return clamp(dayMs - REPLAY_START_HOUR * 60 * 60 * 1000, 0, DAY_SPAN_MS);
}

function eventDuration(event) {
  return event.duration ?? DEFAULT_DURATIONS[event.type] ?? 5 * 60 * 1000;
}

function resetActiveState() {
  state.activeBuildings = new Set(['gazebo']);
  state.activeUntil = new Map([['gazebo', Infinity]]);
  state.currentEvent = null;
}

function fireEvent(event) {
  const until = event.replayMs + eventDuration(event);
  state.activeBuildings.add(event.building);
  state.activeUntil.set(event.building, until);
  state.currentEvent = event;
  state.lastEvent = event;
  state.firedEvents.push(event);
}

function expireBuildings(replayMs) {
  for (const [building, until] of state.activeUntil.entries()) {
    if (building === 'gazebo') continue;
    if (replayMs >= until) {
      state.activeUntil.delete(building);
      state.activeBuildings.delete(building);
    }
  }
}

function processRange(fromMs, toMs) {
  state.firedEvents = [];
  for (const event of state.events) {
    if (event.replayMs > fromMs && event.replayMs <= toMs) {
      fireEvent(event);
    }
  }
  expireBuildings(toMs);
}

function rebuildStateAt(replayMs) {
  resetActiveState();
  state.firedEvents = [];
  for (const event of state.events) {
    if (event.replayMs <= replayMs) {
      const until = event.replayMs + eventDuration(event);
      if (until > replayMs) {
        state.activeBuildings.add(event.building);
        state.activeUntil.set(event.building, until);
      }
      state.lastEvent = event;
      state.currentEvent = event;
    } else {
      break;
    }
  }
}

export async function initEvents() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load event data: ${response.status}`);
  }

  const data = await response.json();
  state.events = (data.events || [])
    .map((event, index) => ({
      ...event,
      id: `${event.time}-${index}`,
      replayMs: toReplayMs(event.time),
    }))
    .sort((a, b) => a.replayMs - b.replayMs);

  state.eventCount = data.eventCount ?? state.events.length;
  state.replayMs = 0;
  state.lastNow = 0;
  state.lastEvent = null;
  resetActiveState();
  state.ready = true;

  return state.events;
}

export function tickEvents(now) {
  if (!state.ready) return { looped: false, firedEvents: [] };

  if (!state.lastNow) {
    state.lastNow = now;
    rebuildStateAt(state.replayMs);
    return { looped: false, firedEvents: [] };
  }

  const elapsed = now - state.lastNow;
  state.lastNow = now;
  const advanceMs = (elapsed / REPLAY_DURATION_MS) * DAY_SPAN_MS;
  const nextReplayMs = state.replayMs + advanceMs;

  if (nextReplayMs >= DAY_SPAN_MS) {
    const wrapped = nextReplayMs % DAY_SPAN_MS;
    processRange(state.replayMs, DAY_SPAN_MS);
    const tailEvents = [...state.firedEvents];
    rebuildStateAt(wrapped);
    state.replayMs = wrapped;
    return { looped: true, firedEvents: tailEvents };
  }

  processRange(state.replayMs, nextReplayMs);
  state.replayMs = nextReplayMs;
  return { looped: false, firedEvents: state.firedEvents };
}

export function getActiveBuildings() {
  return new Set(state.activeBuildings);
}

export function getCurrentEvent() {
  return state.currentEvent;
}

export function getReplayProgress() {
  return state.replayMs / DAY_SPAN_MS;
}

export function seekTo(fraction) {
  state.replayMs = clamp(fraction, 0, 1) * DAY_SPAN_MS;
  state.lastNow = 0;
  rebuildStateAt(state.replayMs);
}

export function getEventStats() {
  return {
    totalEvents: state.eventCount,
    activeCount: state.activeBuildings.size,
    lastEvent: state.lastEvent,
    currentEvent: state.currentEvent,
  };
}

export function getReplayClock() {
  const totalMinutes = REPLAY_START_HOUR * 60 + Math.floor(state.replayMs / 60000);
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}
