"use client";

import { useCallback, useContext } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { BurstLayerContext } from "../PlopProvider/context.js";
import { inkBurst, type BurstStyle } from "./burst.js";

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
      inkBurst(layer.current, from, colors, count, style);
    },
    [layer, reduced],
  );
}
