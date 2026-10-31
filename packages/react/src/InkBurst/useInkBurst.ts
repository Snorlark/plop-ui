"use client";

import { useCallback, useContext } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { BurstLayerContext } from "../PlopProvider/context.js";
import type { BurstStyle } from "./burstStyles.js";

type BurstModule = typeof import("./burst.js");
let burstModule: Promise<BurstModule> | null = null;

/**
 * Loads the burst drawings (confetti, poof, stars…). They're opt-in, so they stay out of every Button's
 * bundle and arrive in their own chunk the first time they're needed (#67). Safe to call more than once.
 */
export function preloadInkBurst(): Promise<BurstModule> {
  burstModule ??= import("./burst.js");
  return burstModule;
}

/**
 * Returns `burst(element, colors?, count?)`: ink marks fly out of the element.
 * Does nothing under reduced motion or outside a PlopProvider.
 */
export function useInkBurst() {
  const layer = useContext(BurstLayerContext);
  const reduced = useReducedMotion();
  return useCallback(
    (from: Element, colors?: readonly string[], count?: number, style?: BurstStyle) => {
      if (reduced || !layer?.current) return;
      const host = layer.current;
      void preloadInkBurst().then((m) => m.inkBurst(host, from, colors, count, style));
    },
    [layer, reduced],
  );
}
