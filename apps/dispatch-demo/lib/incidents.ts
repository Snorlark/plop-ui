/*
 * The dispatch demo's mock world: incidents in a few barangays and the units
 * that answer them. Shared by the page (first render), the SSE stream (what
 * happens next) and the Send report action. Nothing here is real.
 */

export const STAGES = ["Reported", "Dispatched", "En route", "On scene", "Resolved"] as const;
export type Stage = 0 | 1 | 2 | 3 | 4;

export interface Unit {
  id: string;
  name: string;
  crew: string;
}

export const UNITS: Unit[] = [
  { id: "m1", name: "Mobile 1", crew: "Rosa Dela Cruz" },
  { id: "m2", name: "Mobile 2", crew: "Jun Bautista" },
  { id: "r1", name: "Rescue 1", crew: "Mika Santos" },
  { id: "f2", name: "Fire 2", crew: "Ben Reyes" },
];

export interface Incident {
  id: number;
  kind: string;
  place: string;
  critical: boolean;
  note?: string;
  stage: Stage;
  /** When each stage was reached (ms since epoch); the index is the stage. */
  times: number[];
  unit?: string;
}

export type StreamEvent = { type: "incident"; incident: Incident } | { type: "update"; id: number; stage: Stage; at: number; unit?: string };

const KINDS: Array<[string, boolean]> = [
  ["Flooding on the main road", true],
  ["Power line down", true],
  ["Medical: fainted at the market", true],
  ["Kitchen fire", true],
  ["Fallen tree blocking a lane", false],
  ["Lost child at the plaza", true],
  ["Minor road accident", false],
  ["Stray dog chasing kids", false],
  ["Clogged canal overflowing", false],
  ["Noise complaint", false],
];

export const PLACES = ["Barangay 3", "Barangay 7", "San Roque", "Poblacion", "Riverside", "Market Street"];

/** A small seeded PRNG (mulberry32), so a stream can be replayed and tests stay stable. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(r: () => number, list: readonly T[]): T => list[Math.floor(r() * list.length)]!;

export function makeIncident(id: number, r: () => number, at: number): Incident {
  const [kind, critical] = pick(r, KINDS);
  return { id, kind, place: pick(r, PLACES), critical, stage: 0, times: [at] };
}

/** The queue as it stands when the page loads: a few incidents at different stages. */
export function initialIncidents(now: number): Incident[] {
  const r = rng(1042);
  // Each starting ticket is a different kind of call (indexes into KINDS).
  const plan: Array<{ ago: number; stage: Stage; kind: number; unit?: string }> = [
    { ago: 21, stage: 3, kind: 2, unit: "Rescue 1" },
    { ago: 14, stage: 2, kind: 5, unit: "Mobile 2" },
    { ago: 9, stage: 1, kind: 8, unit: "Fire 2" },
    { ago: 4, stage: 0, kind: 1 },
    { ago: 38, stage: 4, kind: 9, unit: "Mobile 1" },
  ];
  return plan.map((p, i) => {
    const start = now - p.ago * 60_000;
    const incident = makeIncident(1040 + i, r, start);
    [incident.kind, incident.critical] = KINDS[p.kind]!;
    incident.stage = p.stage;
    incident.unit = p.unit;
    incident.times = Array.from({ length: p.stage + 1 }, (_, s) => start + s * 3 * 60_000);
    return incident;
  });
}

/** Most urgent first: open before resolved, critical before routine, then oldest first. */
export function byUrgency(a: Incident, b: Incident) {
  const open = Number(a.stage === 4) - Number(b.stage === 4);
  if (open) return open;
  const crit = Number(b.critical) - Number(a.critical);
  if (crit) return crit;
  return a.times[0]! - b.times[0]!;
}

/** Same clock on the server and in the browser, so the first render hydrates cleanly. */
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
export const formatTime = (ms: number) => clock.format(ms);
