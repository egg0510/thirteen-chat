export type ActivityEvent = {
  id: string;
  ts: number;          // Date.now()
  type: string;        // 'task:add' | 'task:done' | 'speech:send' | ...
  payload?: any;
};

type Listener = (events: ActivityEvent[]) => void;

const KEY = 'activity_events_v1';
let events: ActivityEvent[] = [];
let listeners: Listener[] = [];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) events = JSON.parse(raw);
  } catch {}
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-1000)));
  } catch {}
}

export function initActivityLogger() { if (!events.length) load(); }
export function logEvent(type: string, payload?: any) {
  const ev: ActivityEvent = { id: (crypto as any).randomUUID?.() || String(Date.now()), ts: Date.now(), type, payload };
  events.push(ev);
  save();
  listeners.forEach(l => l(events));
  return ev;
}
export function getEvents() { return events; }
export function subscribe(l: Listener) {
  listeners.push(l);
  return () => { listeners = listeners.filter(x => x !== l); };
}
