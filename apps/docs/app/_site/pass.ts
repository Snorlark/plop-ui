"use client";

/*
 * The Plop Pass: a five-stamp card kept on this device. You earn a stamp for
 * a visit on a new day, opening the GitHub repo, copying the install
 * command, sticking something on the board and lettering something. Five stamps unlock the
 * Holo Pip sticker, which stays yours (and shows up in the playground tray).
 */

export type StampReason = "visit" | "github" | "install" | "board" | "lettering";

export interface Stamp {
  reason: StampReason;
  at: number;
}

export interface Pass {
  stamps: Stamp[];
  holo: boolean;
  cards: number;
  /** The day (YYYY-MM-DD) of the last visit stamp. */
  lastVisit: string;
  /** Reasons already stamped on this card (each non-visit reason counts once per card). */
  seen: StampReason[];
}

const KEY = "plop-pass-v1";
export const CARD_SIZE = 5;
const EMPTY: Pass = { stamps: [], holo: false, cards: 0, lastVisit: "", seen: [] };

let state: Pass = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    state = EMPTY;
  }
}

function save(next: Pass) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the card just lasts for this visit.
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

const today = () => new Date().toISOString().slice(0, 10);

/** Adds a stamp if this reason hasn't earned one yet (visits: once a day). Returns the new stamp count, or null when nothing changed. */
export function stamp(reason: StampReason): number | null {
  load();
  const s = state;
  if (s.stamps.length >= CARD_SIZE) return null;
  if (reason === "visit" ? s.lastVisit === today() : s.seen.includes(reason)) return null;
  const stamps = [...s.stamps, { reason, at: Date.now() }];
  save({
    ...s,
    stamps,
    lastVisit: reason === "visit" ? today() : s.lastVisit,
    seen: reason === "visit" ? s.seen : [...s.seen, reason],
    holo: s.holo || stamps.length >= CARD_SIZE,
  });
  window.dispatchEvent(new CustomEvent("plop:stamp", { detail: { reason, count: stamps.length } }));
  return stamps.length;
}

/** A fresh card. Holo Pip stays unlocked. */
export function newCard() {
  load();
  save({ ...state, stamps: [], seen: [], cards: state.cards + 1, lastVisit: state.lastVisit });
}

export const STAMP_LABEL: Record<StampReason, string> = {
  visit: "Visit",
  github: "GitHub",
  install: "Install",
  board: "Board",
  lettering: "Lettered",
};
