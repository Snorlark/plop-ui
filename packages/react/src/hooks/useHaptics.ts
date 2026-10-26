"use client";

import { useMemo } from "react";
import { usePlop } from "../PlopProvider/context.js";

export const HAPTIC_PATTERNS = {
  tap: 8,
  success: [6, 40, 14],
  error: [14, 30, 14],
} as const;

type Pattern = number | readonly number[];

let proxy: HTMLLabelElement | null = null;

/**
 * iOS Safari has no Vibration API, but since iOS 18 toggling an
 * `<input type="checkbox" switch>` gives a system haptic tick. PlopUI keeps
 * one hidden switch and clicks it as the fallback.
 */
function iosSwitchProxy(): HTMLLabelElement | null {
  if (typeof document === "undefined") return null;
  if (proxy?.isConnected) return proxy;
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.tabIndex = -1;
  label.appendChild(input);
  document.body.appendChild(label);
  proxy = label;
  return label;
}

function vibrate(pattern: Pattern) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern as number | number[]);
      return;
    }
    iosSwitchProxy()?.click();
  } catch {
    // Haptics are a nicety; never let them break a press.
  }
}

export interface Haptics {
  /** 8 ms tick on press. */
  tap: () => void;
  /** Two-pulse confirmation. */
  success: () => void;
  /** Firm double buzz. */
  error: () => void;
  /** False when haptics are turned off in PlopProvider. */
  enabled: boolean;
}

/**
 * Phone haptics, paired with a visual change (never the only signal).
 * Android Chrome vibrates; iPhone Safari (iOS 18+) uses the switch fallback;
 * everywhere else it silently does nothing.
 */
export function useHaptics(): Haptics {
  const { haptics } = usePlop();
  return useMemo(() => {
    const run = (p: Pattern) => () => {
      if (haptics) vibrate(p);
    };
    return { tap: run(HAPTIC_PATTERNS.tap), success: run(HAPTIC_PATTERNS.success), error: run(HAPTIC_PATTERNS.error), enabled: haptics };
  }, [haptics]);
}
