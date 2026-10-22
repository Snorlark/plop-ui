"use client";

import { useContext, useMemo, useRef, type HTMLAttributes, type ReactNode } from "react";
import type { SurfaceName } from "@plop-ui/tokens";
import { cx } from "../internal/cx.js";
import burstStyles from "../InkBurst/InkBurst.module.css";
import { PlopFilters } from "../PlopFilters.js";
import type { StickerShadow } from "../internal/Sticker.js";
import { Toaster, type ToastBackdrop } from "../Toast/Toaster.js";
import { BurstLayerContext, PlopContext, type ReducedMotionSetting } from "./context.js";

export type PlopTheme = "system" | "light" | "dark";

export interface PlopProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
  /** The paper everything sits on. Leave it out to keep the surrounding surface (a parent provider's, or the page's `data-plop-surface`; poster when there is none). */
  surface?: SurfaceName;
  /** `system` follows prefers-color-scheme. Default `system`. */
  theme?: PlopTheme;
  /** Vibrate on press and toggle (phones only). Inherits from a parent PlopProvider, else `true`. */
  haptics?: boolean;
  /** Soft "plop" sounds. Inherits from a parent PlopProvider, else off; turn on only after a person asks for it. */
  sound?: boolean;
  /** `system` follows prefers-reduced-motion. Inherits from a parent PlopProvider, else `system`. */
  reducedMotion?: ReducedMotionSetting;
  /** The default shadow for every sticker inside: `soft`, `solid`, `stripes`, `outline` or `none`. A sticker's own `shadow` wins. Default `soft`. */
  stickerShadow?: StickerShadow;
  /** Paint the surface's background and text color on this element. Default `true`. */
  paint?: boolean;
  /** Render the toast zone that `toast()` shows messages in. Default `true`. */
  toaster?: boolean;
  /** What shows behind a toast: `solid` (a faint gradient wash), `dots` (a comic halftone screen) or `none`. Default `solid`. */
  toastBackdrop?: ToastBackdrop;
}

/**
 * Sets the surface, theme and feedback settings for everything inside it,
 * and renders what the kit draws on top of the page: the SVG filters the
 * hand-drawn outlines use, the ink-burst layer and the toast zone.
 *
 * Nest one to change the paper for a section: feedback settings you leave out
 * come from the parent, so one haptics/sound switch at the root covers the page.
 */
export function PlopProvider({
  children,
  surface,
  theme = "system",
  haptics,
  sound,
  reducedMotion,
  stickerShadow,
  paint = true,
  toaster = true,
  toastBackdrop,
  className,
  ...rest
}: PlopProviderProps) {
  const parent = useContext(PlopContext);
  const hapticsOn = haptics ?? parent.haptics;
  const soundOn = sound ?? parent.sound;
  const motion = reducedMotion ?? parent.reducedMotion;
  const settings = useMemo(() => ({ haptics: hapticsOn, sound: soundOn, reducedMotion: motion }), [hapticsOn, soundOn, motion]);
  const burstLayer = useRef<HTMLDivElement>(null);
  return (
    <PlopContext.Provider value={settings}>
      <BurstLayerContext.Provider value={burstLayer}>
      <div
        {...rest}
        className={cx(paint && "plop-surface", className)}
        data-plop-surface={surface}
        data-plop-theme={theme === "system" ? undefined : theme}
        data-plop-motion={motion === "always" ? "reduce" : motion === "never" ? "full" : undefined}
        data-plop-filters=""
        data-plop-shadow={stickerShadow}
      >
        <PlopFilters />
        {children}
        <div ref={burstLayer} className={burstStyles.layer} aria-hidden="true" />
        {toaster && <Toaster backdrop={toastBackdrop} />}
      </div>
      </BurstLayerContext.Provider>
    </PlopContext.Provider>
  );
}
