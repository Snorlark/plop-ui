"use client";

import { createContext, useContext, type RefObject } from "react";

export type ReducedMotionSetting = "system" | "always" | "never";

export interface PlopSettings {
  /** Vibrate on press and toggle (phones only). Default `true`. */
  haptics: boolean;
  /** Play a soft paper "plop" on press. Off by default; only after a person turns it on. */
  sound: boolean;
  /** `system` follows prefers-reduced-motion. Default `system`. */
  reducedMotion: ReducedMotionSetting;
}

export const defaultSettings: PlopSettings = { haptics: true, sound: false, reducedMotion: "system" };

export const PlopContext = createContext<PlopSettings>(defaultSettings);

/** The settings from the nearest PlopProvider (or the defaults without one). */
export function usePlop(): PlopSettings {
  return useContext(PlopContext);
}

/** The fixed layer ink bursts are drawn into (rendered by PlopProvider). */
export const BurstLayerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);
