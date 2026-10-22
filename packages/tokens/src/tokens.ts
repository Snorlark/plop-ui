/**
 * Plop! design tokens — the single source of truth.
 *
 * `scripts/emit-css.mjs` turns this object into `dist/tokens.css` (CSS
 * variables prefixed `--plop-`), so the typed JS values and the CSS can
 * never drift apart. Components only ever read the CSS variables.
 */

/** One cobalt ink draws everything; spot colors fill shapes but never draw lines. */
export const color = {
  ink: "#2848D8",
  inkText: "#1C2E8C",
  inkSoft: "#3B4A92",
  onInk: "#FFF8E7",
  paper: "#FFFDF7",
  paperBack: "#E6DCC2",
  sheet: "#FBF8F0",
  track: "#EDE4CC",
  tomato: "#D2381E",
  mustard: "#F6C445",
  bubblegum: "#F6A9B8",
  periwinkle: "#A9B6EE",
  mint: "#9FD8B8",
  /** Deep green for ticks and success marks drawn on paper (mint is too light to draw with). */
  leaf: "#2F8A57",
  /** Tomato dark enough to carry error text on paper. */
  tomatoText: "#A1301A",
  /** Deep stamp inks for marks pressed onto paper, where mustard and bubblegum are too light to read. */
  ochre: "#B7791F",
  berry: "#B83A68",
  placeholder: "#5D69A6",
  /** Flat "printed" drop shadow under stickers and sheets. */
  shadow: "rgba(18, 36, 120, 0.2)",
  shadowStrong: "rgba(18, 36, 120, 0.3)",
} as const;

export type ColorToken = keyof typeof color;

/** Fills a component can be printed in. */
export const fills = ["ink", "periwinkle", "mint", "tomato", "mustard", "bubblegum", "plain"] as const;
export type Fill = (typeof fills)[number];

/**
 * Contrast roles: like Material's "on" colors, every fill carries the text
 * color that passes WCAG AA on it. Ratios are measured (see the PRD table).
 */
export const onFill: Record<Fill, { text: string; ratio: number }> = {
  ink: { text: color.onInk, ratio: 6.6 },
  tomato: { text: color.onInk, ratio: 4.6 },
  periwinkle: { text: color.inkText, ratio: 5.8 },
  bubblegum: { text: color.inkText, ratio: 6.2 },
  mint: { text: color.inkText, ratio: 7.1 },
  mustard: { text: color.inkText, ratio: 7.1 },
  plain: { text: color.ink, ratio: 6.9 },
};

/** Ops status → fill. Every status also carries a text label, never color alone. */
export const status = {
  critical: "tomato",
  dispatched: "ink",
  "en-route": "mustard",
  resolved: "mint",
  unassigned: "periwinkle",
} as const satisfies Record<string, Fill>;

export type Status = keyof typeof status;

const fallback = '"Patrick Hand", "Chalkboard SE", "Comic Sans MS", system-ui, sans-serif';

/**
 * `--plop-sketchpop` lets a framework (e.g. next/font) swap in its own
 * generated family name; plain CSS users get "Sketchpop" from @plop-ui/fonts.
 */
export const font = {
  logo: `var(--plop-sketchpop, "Sketchpop"), ${fallback}`,
  letter: `var(--plop-sketchpop, "Sketchpop"), var(--plop-patrick-hand, "Patrick Hand"), ${fallback}`,
  body: `var(--plop-sketchpop, "Sketchpop"), var(--plop-patrick-hand, "Patrick Hand"), ${fallback}`,
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
} as const;

export const fontWeight = {
  logo: 900,
  letter: 700,
  heading: 900,
  body: 400,
} as const;

/** Type scale in px. Body defaults to 19. */
export const fontSize = {
  xs: 13,
  sm: 15,
  md: 17,
  body: 19,
  lg: 24,
  xl: 32,
  "2xl": 44,
  "3xl": 72,
} as const;

/** Irregular on purpose. */
export const radius = {
  sticker: "26px 20px 28px 18px / 20px 28px 18px 26px",
  face: "20px 14px 22px 13px / 14px 22px 13px 20px",
  box: "14px 10px 16px 11px / 11px 16px 10px 14px",
  blob: "50% 46% 53% 48%",
  cut: "34px 26px 36px 24px / 26px 36px 24px 34px",
} as const;

export const stroke = {
  default: "3px",
  sm: "2.5px",
  illustration: "7px",
} as const;

export const hatch = {
  on: "2.2px",
  off: "3.4px",
  offsetX: "5px",
  offsetY: "7px",
} as const;

export const motion = {
  spring: "cubic-bezier(.28, 1.75, .5, 1)",
  springDuration: "500ms",
  squish: "cubic-bezier(.2, .9, .3, 1)",
  squishDuration: "80ms",
  /** Interval between the 3 boil filters. */
  boilInterval: "140ms",
} as const;

/** Haptic patterns in ms, for `navigator.vibrate`. */
export const haptics = {
  tap: 8,
  success: [6, 40, 14],
  error: [14, 30, 14],
} as const;

export interface SurfaceMode {
  /** Page background. */
  bg: string;
  /** Primary line of the paper pattern. */
  lineA: string;
  /** Secondary line of the paper pattern. */
  lineB: string;
  /** Text drawn directly on the surface. */
  on: string;
  /** Soft text on the surface (captions); always solid. */
  onSoft: string;
  /** Focus ring ("cut here" line). */
  focus: string;
  /** Hatched shadow lines. */
  hatch: string;
  /** Soft light falling on the paper (the poster's highlight); transparent when unused. */
  glow: string;
}

export interface Surface {
  label: string;
  light: SurfaceMode;
  dark: SurfaceMode;
}

const noise = (frequency: string, seed: number, matrix: string, size: number) =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='${matrix}'/></filter><rect width='100%' height='100%' filter='url(%23p)' opacity='.55'/></svg>")`;

export const surfaces = {
  poster: {
    label: "Poster",
    light: { bg: "#EEE7D6", lineA: "rgba(40,72,216,.08)", lineB: "transparent", on: "#2848D8", onSoft: "#3B4A92", focus: "#D2381E", hatch: "#2848D8", glow: "rgba(255,255,255,.45)" },
    dark: { bg: "#131A35", lineA: "rgba(255,248,231,.05)", lineB: "transparent", on: "#FFF8E7", onSoft: "#CFC8B6", focus: "#F6C445", hatch: "rgba(255,248,231,.5)", glow: "rgba(255,255,255,.04)" },
  },
  mat: {
    label: "Cutting mat",
    light: { bg: "#2E6B55", lineA: "rgba(255,248,231,.22)", lineB: "rgba(255,248,231,.10)", on: "#FFF8E7", onSoft: "#EFE8D5", focus: "#F3B43A", hatch: "rgba(8,30,22,.75)", glow: "transparent" },
    dark: { bg: "#173A2E", lineA: "rgba(255,248,231,.15)", lineB: "rgba(255,248,231,.06)", on: "#FFF8E7", onSoft: "#CFC8B6", focus: "#F3B43A", hatch: "rgba(0,0,0,.75)", glow: "transparent" },
  },
  notebook: {
    label: "Notebook",
    light: { bg: "#F8F4E9", lineA: "#E79C9C", lineB: "#BFCDF0", on: "#2848D8", onSoft: "#3B4A92", focus: "#2848D8", hatch: "#2848D8", glow: "transparent" },
    dark: { bg: "#22232C", lineA: "rgba(231,156,156,.35)", lineB: "rgba(169,182,238,.16)", on: "#FFF8E7", onSoft: "#CFC8B6", focus: "#F3B43A", hatch: "rgba(255,248,231,.45)", glow: "transparent" },
  },
  kraft: {
    label: "Kraft",
    light: { bg: "#C69C6D", lineA: "rgba(90,60,30,.18)", lineB: "rgba(255,240,210,.14)", on: "#172777", onSoft: "#1C2E8C", focus: "#172777", hatch: "rgba(60,35,15,.75)", glow: "transparent" },
    dark: { bg: "#4E3A28", lineA: "rgba(18,36,120,.25)", lineB: "rgba(255,240,210,.05)", on: "#FFF8E7", onSoft: "#CFC8B6", focus: "#F3B43A", hatch: "rgba(0,0,0,.6)", glow: "transparent" },
  },
  riso: {
    label: "Riso",
    light: { bg: "#F6A9B8", lineA: "rgba(210,56,30,.22)", lineB: "transparent", on: "#172777", onSoft: "#1C2E8C", focus: "#172777", hatch: "#2848D8", glow: "transparent" },
    dark: { bg: "#43203B", lineA: "rgba(246,169,184,.16)", lineB: "transparent", on: "#FFF8E7", onSoft: "#CFC8B6", focus: "#F3B43A", hatch: "rgba(255,248,231,.45)", glow: "transparent" },
  },
} as const satisfies Record<string, Surface>;

export type SurfaceName = keyof typeof surfaces;
export const surfaceNames = Object.keys(surfaces) as SurfaceName[];

/** The paper pattern each surface prints under its content (uses the surface's own line colors). */
export const surfacePattern: Record<SurfaceName, { image: string; size: string; position?: string }> = {
  poster: {
    image: `${noise(".75", 11, "0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .55 -.08", 260)}, radial-gradient(ellipse at 15% 0%, var(--plop-glow), transparent 55%)`,
    size: "260px 260px, 100% 100%",
  },
  mat: {
    image:
      "linear-gradient(var(--plop-line-a) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--plop-line-a) 1.5px, transparent 1.5px), linear-gradient(var(--plop-line-b) 1px, transparent 1px), linear-gradient(90deg, var(--plop-line-b) 1px, transparent 1px)",
    size: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
    position: "-1px -1px",
  },
  notebook: {
    image:
      "linear-gradient(90deg, transparent 62px, var(--plop-line-a) 62px, var(--plop-line-a) 64px, transparent 64px), repeating-linear-gradient(transparent 0 31px, var(--plop-line-b) 31px 32px)",
    size: "auto",
  },
  kraft: {
    image: `${noise(".012 .5", 4, "0 0 0 0 .3  0 0 0 0 .2  0 0 0 0 .1  0 0 0 .5 0", 220)}, radial-gradient(var(--plop-line-a) 1px, transparent 1.4px)`,
    size: "220px 220px, 7px 7px",
  },
  riso: {
    image: "radial-gradient(var(--plop-line-a) 1.6px, transparent 2px)",
    size: "9px 9px",
  },
};

export const tokens = {
  color,
  onFill,
  status,
  font,
  fontWeight,
  fontSize,
  radius,
  stroke,
  hatch,
  motion,
  haptics,
  surfaces,
  surfacePattern,
} as const;

export type Tokens = typeof tokens;
