/*
 * The burst styles and their colors: small data that stickers and toasts need up front. The code that
 * draws the marks lives in burst.ts and is only loaded when a burst actually fires (see useInkBurst).
 */

/** Spot colors a burst can be printed in (CSS colors or token variables). */
export const BURST_COLORS = {
  all: ["var(--plop-ink)", "var(--plop-mustard)", "var(--plop-bubblegum)", "var(--plop-tomato)", "var(--plop-periwinkle)", "var(--plop-mint)"],
  ink: ["var(--plop-ink)", "var(--plop-mustard)", "var(--plop-mint)"],
  periwinkle: ["var(--plop-periwinkle)", "var(--plop-ink)", "var(--plop-mustard)"],
  mint: ["var(--plop-mint)", "var(--plop-mustard)", "var(--plop-ink)"],
  /** Used by the `poof` style: ink-soft dust, nothing festive. */
  tomato: ["var(--plop-ink-soft)", "var(--plop-ink)"],
  mustard: ["var(--plop-mustard)", "var(--plop-tomato)", "var(--plop-ink)"],
  plain: ["var(--plop-ink)", "var(--plop-mustard)", "var(--plop-bubblegum)", "var(--plop-mint)"],
} as const;

/**
 * What flies out. Four celebrate something that went right, three mark something that didn't:
 *
 * - `confetti`: strokes, sparkles, squiggles and dots thrown in a ring (send, save, done).
 * - `stars`: spinning stars flung outward, for a bigger win.
 * - `sparkle`: twinkles that pop in place around the element, the quiet celebration.
 * - `hearts`: hearts that float up, for likes and favorites.
 * - `poof`: dust puffs that sink, for cancel and delete.
 * - `zap`: jagged scribble lines that flick out, for an error.
 * - `drops`: sweat drops that fall, for an "oops".
 *
 * The three failure styles also give the element a little head-shake.
 */
export type BurstStyle = "confetti" | "stars" | "sparkle" | "hearts" | "poof" | "zap" | "drops";

/** Every style, celebrations first. */
export const BURST_STYLES: readonly BurstStyle[] = ["confetti", "stars", "sparkle", "hearts", "poof", "zap", "drops"];

/** The styles that mean something went wrong: they shake the element too. */
export const isFailBurst = (style: BurstStyle) => style === "poof" || style === "zap" || style === "drops";

/** The colors each style is printed in when you don't pass your own (`confetti` follows the sticker's variant). */
export const BURST_PRESETS: Record<BurstStyle, readonly string[]> = {
  confetti: BURST_COLORS.all,
  stars: ["var(--plop-mustard)", "var(--plop-bubblegum)", "var(--plop-mint)", "var(--plop-periwinkle)"],
  sparkle: ["var(--plop-mustard)", "var(--plop-periwinkle)", "var(--plop-mint)"],
  hearts: ["var(--plop-tomato)", "var(--plop-bubblegum)"],
  poof: BURST_COLORS.tomato,
  zap: ["var(--plop-tomato)", "var(--plop-ink)"],
  drops: ["var(--plop-periwinkle)"],
};
