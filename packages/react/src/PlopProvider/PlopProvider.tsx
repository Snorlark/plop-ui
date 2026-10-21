"use client";

import { useMemo, useRef, type HTMLAttributes, type ReactNode } from "react";
import type { SurfaceName } from "@plop-ui/tokens";
import { cx } from "../internal/cx.js";
import burstStyles from "../InkBurst/InkBurst.module.css";
import { PlopFilters } from "../PlopFilters.js";
import { Toaster } from "../Toast/Toaster.js";
import { BurstLayerContext, PlopContext, type ReducedMotionSetting } from "./context.js";

export type PlopTheme = "system" | "light" | "dark";

export interface PlopProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
  /** The paper everything sits on. Default `poster`. */
  surface?: SurfaceName;
  /** `system` follows prefers-color-scheme. Default `system`. */
  theme?: PlopTheme;
  /** Vibrate on press and toggle (phones only). Default `true`. */
  haptics?: boolean;
  /** Soft "plop" sounds. Off by default; turn on only after a person asks for it. */
  sound?: boolean;
  /** `system` follows prefers-reduced-motion. Default `system`. */
  reducedMotion?: ReducedMotionSetting;
  /** Paint the surface's background and text color on this element. Default `true`. */
  paint?: boolean;
  /** Render the toast zone that `toast()` shows messages in. Default `true`. */
  toaster?: boolean;
}

/**
 * Sets the surface, theme and feedback settings for everything inside it,
 * and renders what the kit draws on top of the page: the SVG filters the
 * hand-drawn outlines use, the ink-burst layer and the toast zone.
 */
export function PlopProvider({
  children,
  surface = "poster",
  theme = "system",
  haptics = true,
  sound = false,
  reducedMotion = "system",
  paint = true,
  toaster = true,
  className,
  ...rest
}: PlopProviderProps) {
  const settings = useMemo(() => ({ haptics, sound, reducedMotion }), [haptics, sound, reducedMotion]);
  const burstLayer = useRef<HTMLDivElement>(null);
  return (
    <PlopContext.Provider value={settings}>
      <BurstLayerContext.Provider value={burstLayer}>
      <div
        {...rest}
        className={cx(paint && "plop-surface", className)}
        data-plop-surface={surface}
        data-plop-theme={theme === "system" ? undefined : theme}
        data-plop-motion={reducedMotion === "always" ? "reduce" : reducedMotion === "never" ? "full" : undefined}
        data-plop-filters=""
      >
        <PlopFilters />
        {children}
        <div ref={burstLayer} className={burstStyles.layer} aria-hidden="true" />
        {toaster && <Toaster />}
      </div>
      </BurstLayerContext.Provider>
    </PlopContext.Provider>
  );
}
