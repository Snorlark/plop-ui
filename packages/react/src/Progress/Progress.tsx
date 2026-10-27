import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Progress.module.css";

export interface ProgressProps {
  /** What is progressing, e.g. "Syncing offline sketches". */
  label: ReactNode;
  /** How far along, from 0 to `max`; values outside that range are clamped. */
  value: number;
  /** The value that means "done". Default 100. */
  max?: number;
  /** Shown on the right and read by screen readers, e.g. "4 of 10". Default "<n>%". */
  valueText?: string;
  /** Hatching color: `mint` for good news, `tomato` for running out. Default `ink`. */
  tone?: "ink" | "mint" | "tomato";
  /** A solid bar instead of crayon hatching. */
  solid?: boolean;
  /** Extra class on the wrapper around the label and bar. */
  className?: string;
}

/** A progress bar filled with crayon hatching. `role="progressbar"` with its label and value. */
export function Progress({ label, value, max = 100, valueText, tone = "ink", solid = false, className }: ProgressProps) {
  const id = useId();
  const clamped = Math.min(Math.max(value, 0), max);
  const ratio = max > 0 ? clamped / max : 0;
  const text = valueText ?? `${Math.round(ratio * 100)}%`;
  return (
    <div className={cx(styles.root, styles[tone], solid && styles.solid, className)}>
      <div className={styles.top}>
        <span className={styles.label} id={id}>
          {label}
        </span>
        <span className={styles.value} aria-hidden="true">
          {text}
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={text}
      >
        <span className={styles.fill} style={{ "--v": ratio } as CSSProperties} />
      </div>
    </div>
  );
}
