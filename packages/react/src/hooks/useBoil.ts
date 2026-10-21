"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BOIL_FILTERS } from "../PlopFilters.js";
import { seed as seeded, type Seed } from "../seed.js";
import { useReducedMotion } from "./useReducedMotion.js";

export interface UseBoilOptions {
  /** Picks the starting frame, so neighbours don't boil in sync. */
  seed?: Seed;
  /** Boil while true; hold still while false. */
  active?: boolean;
  /** Milliseconds per frame. Default 140. */
  interval?: number;
}

/**
 * "Boiling ink": swaps between 3 wobble filters so a hand-drawn line looks
 * alive. Returns a style to spread on any SVG or element. Holds still under
 * reduced motion. Needs a PlopProvider above it (it renders the filters).
 */
export function useBoil({ seed = 0, active = true, interval = 140 }: UseBoilOptions = {}): CSSProperties {
  const reduced = useReducedMotion();
  const start = Math.floor(seeded(seed)() * BOIL_FILTERS.length);
  const [frame, setFrame] = useState(start);
  const running = active && !reduced;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % BOIL_FILTERS.length), interval);
    return () => window.clearInterval(id);
  }, [running, interval]);

  return { filter: `url(#${BOIL_FILTERS[running ? frame : start]})` };
}
