import type { CSSProperties, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { useSeed } from "../internal/useSeed.js";
import { seed as seeded, type Seed } from "../seed.js";
import styles from "./ink.module.css";

/*
 * The ink loop and the hopping dots on their own, so a loading Button, Select or SearchField doesn't pull
 * in every Spinner kind (the scribble flipbook, the sticker, Hum). Spinner builds on these pieces.
 */

/** The boil: the same line redrawn this many times, swapped like frames of a flipbook. */
export const FRAMES = 3;

export const r1 = (n: number) => Math.round(n * 10) / 10;

/** A smooth path through points (Catmull-Rom turned into cubic Béziers). */
export function smooth(pts: Array<[number, number]>): string {
  let d = `M${r1(pts[0]![0])} ${r1(pts[0]![1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)}, ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)}, ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/**
 * A marker circle drawn the way a hand draws one: it starts a little inside,
 * drifts out, and overshoots where it began. Never closes neatly.
 */
export function inkLoop(value: Seed): string {
  const rnd = seeded(value);
  const start = rnd() * Math.PI * 2;
  const steps = 10;
  const turn = Math.PI * 2 * 1.12;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + t * turn;
    const r = 16.6 + t * 2.4 + (rnd() - 0.5) * 2.2;
    pts.push([25 + Math.cos(a) * r, 25 + Math.sin(a) * r]);
  }
  return smooth(pts);
}

/** The ink kind's drawing: a dotted pencil guideline that boils, and a marker arc surging round it. */
export function InkArt({ seed }: { seed: Seed }) {
  // The pencil guideline boils: three drawings side by side on one strip, stepped through a window like a
  // flipbook. The ink arc surges round on one rotation. Two compositor animations, nothing else moves.
  return (
    <span className={styles.ring}>
      <span className={styles.window}>
        <span className={styles.strip}>
          {Array.from({ length: FRAMES }, (_, f) => (
            <svg key={f} viewBox="-4 -4 58 58">
              <path className={styles.track} d={inkLoop(`${seed}:${f}`)} />
            </svg>
          ))}
        </span>
      </span>
      <span className={styles.spin}>
        <svg viewBox="0 0 50 50">
          <path className={styles.arc} d={inkLoop(seed)} pathLength={100} />
        </svg>
      </span>
    </span>
  );
}

/** The dots kind's drawing: three slightly different ink blobs that hop and squash. */
export function DotsArt({ seed }: { seed: Seed }) {
  const rnd = seeded(`${seed}:dots`);
  return (
    <span className={styles.hops}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={styles.dot} style={{ "--i": i, "--d": (0.92 + rnd() * 0.22).toFixed(2) } as CSSProperties}>
          <i className={styles.blob} style={{ borderRadius: `${48 + Math.round(rnd() * 8)}% ${44 + Math.round(rnd() * 8)}% ${50 + Math.round(rnd() * 8)}% ${44 + Math.round(rnd() * 8)}%` }} />
          <i className={styles.shadow} />
        </span>
      ))}
    </span>
  );
}

/** The decorative wrapper every kind sits in, with the three still dots shown under reduced motion. */
export function MarkFrame({ kind, className, style, children }: { kind: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <span className={cx(styles.mark, styles[kind], className)} aria-hidden="true" style={style}>
      {children}
      <span className={styles.rest}>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

/** Just the hopping dots, decorative. What a busy Select or SearchField shows. */
export function DotsMark({ seed, className, style }: { seed?: Seed; className?: string; style?: CSSProperties }) {
  const s = useSeed(seed);
  return (
    <MarkFrame kind="dots" className={className} style={style}>
      <DotsArt seed={s} />
    </MarkFrame>
  );
}

/** Just the ink loop, decorative. What a loading Button shows. */
export function InkMark({ seed, className, style }: { seed?: Seed; className?: string; style?: CSSProperties }) {
  const s = useSeed(seed);
  return (
    <MarkFrame kind="ink" className={className} style={style}>
      <InkArt seed={s} />
    </MarkFrame>
  );
}
