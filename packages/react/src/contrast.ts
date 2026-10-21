/**
 * WCAG contrast helpers. `onColor(bg)` is how runtime colors (a client's
 * brand color, a custom tag) get readable text: it measures the fill and
 * returns deep ink or cream, whichever has the higher contrast.
 */

/** Deep text ink: `--plop-ink-text`. */
export const DEEP_INK = "#1C2E8C";
/** Cream: `--plop-on-ink`. */
export const CREAM = "#FFF8E7";

export type RGB = readonly [number, number, number];

/** Parses `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()`. Returns null when it can't. */
export function parseColor(input: string): RGB | null {
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    let h = hex[1] as string;
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as unknown as RGB;
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = (rgb[1] as string).split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number);
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) return parts as unknown as RGB;
  }
  return null;
}

/** Relative luminance (WCAG 2.x). */
export function luminance([r, g, b]: RGB): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colors, from 1 to 21. Throws on colors it can't parse. */
export function contrastRatio(a: string, b: string): number {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) throw new Error(`Plop! can't measure contrast of "${a}" on "${b}"`);
  const la = luminance(ca);
  const lb = luminance(cb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export interface OnColorResult {
  /** The text color to use on `bg`. */
  color: string;
  /** Its contrast ratio against `bg`. */
  ratio: number;
  /** Whether that ratio passes WCAG AA for normal text (4.5:1). */
  passesAA: boolean;
}

/**
 * The text color that reads best on `bg`: deep ink or cream, whichever has
 * the higher contrast. Pass your own pair to override the defaults.
 */
export function onColor(bg: string, options: { dark?: string; light?: string } = {}): OnColorResult {
  const dark = options.dark ?? DEEP_INK;
  const light = options.light ?? CREAM;
  const darkRatio = contrastRatio(dark, bg);
  const lightRatio = contrastRatio(light, bg);
  const [color, ratio] = darkRatio >= lightRatio ? [dark, darkRatio] : [light, lightRatio];
  return { color, ratio, passesAA: ratio >= 4.5 };
}
