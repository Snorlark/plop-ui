import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Progress.module.css";

export interface ProgressProps {
  /** What is progressing, e.g. "Syncing offline sketches". */
  label: ReactNode;
  /** How far along, from 0 to `max`; values outside that range are clamped. Leave it out with `indeterminate`. */
  value?: number;
  /** For waits of unknown length: a band of hatching sweeps across instead of filling. No value is read out. */
  indeterminate?: boolean;
  /** The value that means "done". Default 100. */
  max?: number;
  /** Shown on the right and read by screen readers, e.g. "4 of 10". Default "<n>%" (nothing when indeterminate). */
  valueText?: string;
  /** Hatching color: `mint` for good news, `tomato` for running out. Default `ink`. */
  tone?: "ink" | "mint" | "tomato";
  /** A solid bar instead of crayon hatching. */
  solid?: boolean;
  /** Extra class on the wrapper around the label and bar. */
  className?: string;
}

/**
 * A progress bar filled with crayon hatching. `role="progressbar"` with its label and value.
 * `indeterminate` sweeps a band across for waits of unknown length (a transform, so it stays off the main thread).
 */
export function Progress({ label, value = 0, indeterminate = false, max = 100, valueText, tone = "ink", solid = false, className }: ProgressProps) {
  const id = useId();
  const clamped = Math.min(Math.max(value, 0), max);
  const ratio = max > 0 ? clamped / max : 0;
  const text = valueText ?? (indeterminate ? undefined : `${Math.round(ratio * 100)}%`);
  return (
    <div className={cx(styles.root, styles[tone], solid && styles.solid, indeterminate && styles.indeterminate, className)}>
      <div className={styles.top}>
        <span className={styles.label} id={id}>
          {label}
        </span>
        {text && (
          <span className={styles.value} aria-hidden="true">
            {text}
          </span>
        )}
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={text}
        aria-busy={indeterminate || undefined}
      >
        <span className={styles.fill} style={indeterminate ? undefined : ({ "--v": ratio } as CSSProperties)} />
      </div>
    </div>
  );
}
