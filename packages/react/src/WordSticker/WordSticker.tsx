import type { CSSProperties } from "react";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import styles from "./WordSticker.module.css";

export type WordStickerTone = "mustard" | "tomato" | "mint" | "bubblegum" | "periwinkle" | "ink" | "paper";

const FILL: Record<WordStickerTone, string> = {
  mustard: "var(--plop-mustard)",
  tomato: "var(--plop-tomato)",
  mint: "var(--plop-mint)",
  bubblegum: "var(--plop-bubblegum)",
  periwinkle: "var(--plop-periwinkle)",
  ink: "var(--plop-ink)",
  paper: "var(--plop-paper)",
};

export interface WordStickerProps {
  /** The words. Keep it short: a word or two reads best. */
  children: string;
  /** Fill color under the ink line. Default `mustard`. */
  tone?: WordStickerTone;
  /** Font size in px. Default 48. */
  size?: number;
  /** Rotation in degrees. Default 0. */
  tilt?: number;
  /** How wobbly the letters are (max tilt per letter, in degrees). Default 2. Same words, same wobble. */
  jitter?: number;
  /** Extra class on the sticker. */
  className?: string;
  /** Inline styles on the sticker, applied over the ones `size`, `tone` and `tilt` set. */
  style?: CSSProperties;
}

/**
 * Words lettered in Sketchpop and cut out like a sticker: a paper border,
 * a color fill nudged off the line, and a thin ink edge. Screen readers get
 * the words once.
 */
export function WordSticker({ children, tone = "mustard", size = 48, tilt = 0, jitter = 2, className, style }: WordStickerProps) {
  return (
    <span
      className={cx(styles.root, className)}
      style={{ fontSize: size, "--ws-fill": FILL[tone], "--ws-tilt": `${tilt}deg`, ...style } as CSSProperties}
    >
      <span className={styles.cut}>
        <Lettering amp={jitter}>{children}</Lettering>
      </span>
      <span className={styles.fill} aria-hidden="true">
        <Lettering amp={jitter}>{children}</Lettering>
      </span>
      <span className={styles.line} aria-hidden="true">
        <Lettering amp={jitter}>{children}</Lettering>
      </span>
    </span>
  );
}
