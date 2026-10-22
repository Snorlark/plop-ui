"use client";

/*
 * The Ride-along pass: a five-stop tour of Plop UI for first-time visitors,
 * kept on this device. Each stop gets stamped when you reach it (see
 * RideAlong.tsx for what counts), in any order. A full pass unlocks the
 * Holo Pip sticker, which stays yours (and shows up in the playground tray).
 */

export type Step = "what" | "install" | "components" | "playground" | "github";

export const STEPS: Step[] = ["what", "install", "components", "playground", "github"];

export interface Pass {
  /** When each step was stamped (ms since epoch). */
  stamps: Partial<Record<Step, number>>;
  holo: boolean;
}

const KEY = "plop-ride-along-v1";
/** The old Plop Pass. Only its Holo Pip carries over. */
const OLD_KEY = "plop-pass-v1";
const EMPTY: Pass = { stamps: {}, holo: false };

let state: Pass = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) state = { ...EMPTY, ...JSON.parse(saved) };
    else if (JSON.parse(localStorage.getItem(OLD_KEY) ?? "{}").holo === true) state = { ...EMPTY, holo: true };
  } catch {
    state = EMPTY;
  }
}

function save(next: Pass) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the pass just lasts for this visit.
  }
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getPass(): Pass {
  load();
  return state;
}

export const getServerPass = () => EMPTY;

export const stampCount = (p: Pass) => STEPS.filter((s) => p.stamps[s]).length;

/** Stamps a step if it isn't stamped yet. Returns the new stamp count, or null when nothing changed. */
export function stamp(step: Step): number | null {
  load();
  if (state.stamps[step]) return null;
  const stamps = { ...state.stamps, [step]: Date.now() };
  const next = { stamps, holo: state.holo || STEPS.every((s) => stamps[s]) };
  save(next);
  const count = stampCount(next);
  window.dispatchEvent(new CustomEvent("plop:stamp", { detail: { step, count } }));
  return count;
}

/** A fresh pass. Holo Pip stays unlocked. */
export function resetPass() {
  load();
  save({ ...state, stamps: {} });
}
