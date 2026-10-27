import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Sheet.module.css";

export interface SheetProps extends HTMLAttributes<HTMLDivElement> {
  /** What sits on the paper. */
  children?: ReactNode;
  /** Color of the two tape strips holding it down, or `none`. Default `mustard`. */
  tape?: "mustard" | "periwinkle" | "bubblegum" | "mint" | "none";
  /** A slight rotation in degrees. Default 0. */
  tilt?: number;
}

/**
 * A sheet of paper taped onto the surface: the panel everything else sits on.
 * Inside it, text and lines use paper roles on every surface, light or dark.
 */
export function Sheet({ children, tape = "mustard", tilt = 0, className, style, ...rest }: SheetProps) {
  return (
    <div
      {...rest}
      className={cx("plop-paper", styles.root, tape === "none" ? styles.noTape : tape !== "mustard" && styles[tape], className)}
      style={{ "--tilt": `${tilt}deg`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}
