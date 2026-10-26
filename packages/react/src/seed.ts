/**
 * Seeded randomness. Every "imperfection" (tilt, wobble, jitter) in PlopUI
 * comes from here, never Math.random(), so the server render and the
 * browser render produce the same values and hydration never mismatches.
 */

export type Seed = string | number;

/** FNV-1a hash of a string to an unsigned 32-bit integer. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function toInt(seed: Seed): number {
  return typeof seed === "number" ? seed >>> 0 || 1 : hashString(seed) || 1;
}

/** A deterministic random generator: same seed, same sequence, values in [0, 1). */
export function seed(value: Seed): () => number {
  let x = toInt(value);
  return () => {
    // mulberry32
    x = (x + 0x6d2b79f5) >>> 0;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A value in [-range, range], rounded so it serializes identically on server and client. */
export function seededTilt(value: Seed, range = 2.5): number {
  const n = seed(value)();
  return Math.round((n * 2 - 1) * range * 100) / 100;
}

/** Picks one item from a list, deterministically. */
export function seededPick<T>(value: Seed, items: readonly T[]): T {
  return items[Math.floor(seed(value)() * items.length)] as T;
}
