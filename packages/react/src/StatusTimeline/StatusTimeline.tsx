import type { CSSProperties } from "react";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import { seededTilt } from "../seed.js";
import styles from "./StatusTimeline.module.css";

export interface TimelineStep {
  label: string;
  /** A time or note under the label, e.g. "9:04 AM" or "6 min away". */
  time?: string;
}

export interface StatusTimelineProps {
  /** Step labels, in order. */
  steps: ReadonlyArray<string | TimelineStep>;
  /** Index of the current step. Steps before it are done; after it, pending. Use `steps.length` when everything is done. */
  current: number;
  /** Times under each step, matched by index (overrides `step.time`). */
  times?: ReadonlyArray<string | undefined>;
  /** `auto` (default) is horizontal and turns vertical in narrow containers. */
  orientation?: "horizontal" | "vertical" | "auto";
  /** Accessible name of the list. Default "Progress". */
  label?: string;
  /** Status words read by screen readers. */
  statusText?: { done: string; current: string; pending: string };
  /** Extra class on the outer wrapper. */
  className?: string;
  /** Id of the outer wrapper. */
  id?: string;
}

const defaultStatusText = { done: "done", current: "current step", pending: "not started" };

const tick = (
  <svg viewBox="0 0 22 22" aria-hidden="true">
    <path d="M4 12 C 6 13.5, 7.5 15.5, 8.5 18 C 11 12, 14 7.5, 19 4" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const moving = (
  <svg viewBox="0 0 22 22" aria-hidden="true">
    <path d="M3 11 L 9 11 M5 6.5 L 10 6.5 M5 15.5 L 10 15.5 M13 6 L 18.5 11 L 13 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Where something is right now. Done steps get a tick, the current one boils,
 * the rest are pencilled in. A Server Component: no client JavaScript.
 */
export function StatusTimeline({
  steps,
  current,
  times,
  orientation = "auto",
  label = "Progress",
  statusText = defaultStatusText,
  className,
  id,
}: StatusTimelineProps) {
  const items = steps.map((s, i) => {
    const step = typeof s === "string" ? { label: s } : s;
    return { ...step, time: times?.[i] ?? step.time };
  });

  return (
    <div id={id} className={cx(styles.root, styles[orientation], className)}>
      <ol className={styles.list} aria-label={label} style={{ "--cols": Math.max(items.length, 1) } as CSSProperties}>
        {items.map((step, i) => {
          const state = i < current ? "done" : i === current ? "current" : "pending";
          return (
            <li
              key={`${i}-${step.label}`}
              className={cx(styles.step, styles[state])}
              aria-current={state === "current" ? "step" : undefined}
              style={{ "--wobble": `${seededTilt(step.label, 2)}deg` } as CSSProperties}
            >
              <span className={styles.dot} aria-hidden="true">
                {state === "done" ? tick : state === "current" ? moving : null}
              </span>
              <span className={styles.label}>
                <Lettering amp={1.6}>{step.label}</Lettering>
                <span className={styles.vh}>, {statusText[state]}</span>
              </span>
              {step.time && <span className={styles.time}>{step.time}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
