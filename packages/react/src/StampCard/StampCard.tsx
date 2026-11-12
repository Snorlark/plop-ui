import type { CSSProperties, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Sheet } from "../Sheet/Sheet.js";
import { useSeed } from "../internal/useSeed.js";
import { seed as random, seededTilt, type Seed } from "../seed.js";
import styles from "./StampCard.module.css";

/** The deep inks a stamp can be pressed in. Mustard and bubblegum are too light to read as ink on paper. */
export const STAMP_INKS = ["tomato", "ink", "leaf", "ochre", "berry"] as const;
export type StampInk = (typeof STAMP_INKS)[number];

export interface StampCardProps {
  /** How many slots the card has, e.g. 8 for "buy 8, get one free". */
  total: number;
  /** How many slots are stamped, counted from the first. Clamped to 0…`total`. */
  filled: number;
  /**
   * What each stamp looks like. Draw it with `currentColor` so it takes the ink. Pass a function to vary it
   * by slot, e.g. a different last stamp. Decorative: screen readers hear the count instead. Default a ring
   * stamp with a star.
   */
  stamp?: ReactNode | ((index: number) => ReactNode);
  /** The ink stamps are pressed in. `mixed` gives each stamp its own seeded ink. Default `mixed`. */
  ink?: StampInk | "mixed";
  /** A heading on the card, e.g. the café's name. */
  title?: ReactNode;
  /** Names the list for screen readers, before the count. Default `title` when it's text. */
  label?: string;
  /** Show the count ("3 of 8 stamps") on the card. It's always in the list's accessible name. Default true. */
  showCount?: boolean;
  /** The count, shown on the card and read by screen readers. Default "3 of 8 stamps". */
  countText?: (filled: number, total: number) => string;
  /** What screen readers hear for each slot. Default "Stamped" and "Empty". */
  statusText?: { filled: string; empty: string };
  /** Slots per row. Default up to 6, balanced across rows (8 slots: 2 rows of 4). */
  columns?: number;
  /** Stable imperfections, shared by server and client. Default generated from useId. */
  seed?: Seed;
  /** Extra class on the card. */
  className?: string;
  /** Id of the card. */
  id?: string;
  /** Inline styles on the card. */
  style?: CSSProperties;
}

const defaultCount = (filled: number, total: number) => `${filled} of ${total} ${total === 1 ? "stamp" : "stamps"}`;
const defaultStatus = { filled: "Stamped", empty: "Empty" };

/** A rubber stamp: a hand-drawn double ring around a star, in the ink's color. */
const defaultStamp = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 3.4C35.7 3.1 45 12.4 44.7 24.3 44.4 35.8 35.3 44.9 23.7 44.7 12.1 44.5 3.1 35.1 3.3 23.6 3.5 12.3 12.7 3.6 24 3.4Z" fill="none" stroke="currentColor" strokeWidth="3.2" />
    <path d="M24 8.6C32.7 8.4 39.5 15.3 39.3 24.2 39.1 32.6 32.4 39.4 23.8 39.3 15.3 39.1 8.6 32.3 8.8 23.8 9 15.4 15.6 8.8 24 8.6Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M24 13.2 27.3 20.4 35 21 29.1 26 31 33.6 24 29.5 17.1 33.7 18.9 26 13 21.1 20.8 20.3Z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

/*
 * The inner layout is written inline rather than in StampCard.module.css: styles.css has a size budget, and
 * these rules never change per state. The card itself keeps its class (apps restyle that), and the stylesheet
 * keeps only what inline styles can't do: sizing the stamp's drawing, the crayon filter, the thunk, reduced
 * motion and forced colors.
 */
const letter: CSSProperties = { fontFamily: "var(--plop-font-letter)", fontStyle: "italic", fontWeight: "var(--plop-weight-letter)" as CSSProperties["fontWeight"], textTransform: "uppercase", letterSpacing: "0.04em" };
const css = {
  head: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "4px 16px" },
  title: { ...letter, fontSize: 17, color: "var(--plop-ink)", overflowWrap: "anywhere" },
  count: { ...letter, fontSize: "var(--plop-text-xs)", color: "var(--plop-ink-soft)" },
  slots: { display: "grid", gap: 10, margin: 0, padding: 0, listStyle: "none" },
  slot: { position: "relative", aspectRatio: 1, border: "2.5px dashed var(--plop-ink-soft)", borderRadius: "50%" },
  stamp: { position: "absolute", inset: -5, display: "grid", placeItems: "center", mixBlendMode: "multiply" },
  vh: { position: "absolute", clipPath: "inset(50%)" },
} satisfies Record<string, CSSProperties>;

/** Whole slots only: NaN and negatives become 0, fractions round down. */
const count = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);

/**
 * A loyalty punch card: a row of slots that fill with rubber stamps. Each stamp lands with its own seeded
 * tilt and ink, and the newest one thunks onto the paper. A Server Component: no client JavaScript.
 */
export function StampCard({
  total: totalProp,
  filled: filledProp,
  stamp = defaultStamp,
  ink = "mixed",
  title,
  label,
  showCount = true,
  countText = defaultCount,
  statusText = defaultStatus,
  columns,
  seed: seedProp,
  className,
  id,
  style,
}: StampCardProps) {
  const autoSeed = useSeed(seedProp);
  const total = Math.max(1, count(totalProp));
  const filled = Math.min(total, count(filledProp));
  // Balanced rows of at most 6: 8 slots → 2 × 4, 10 → 2 × 5, 9 → 2 × 5.
  const cols = columns ? Math.min(total, Math.max(1, count(columns))) : Math.ceil(total / Math.ceil(total / 6));
  const progress = countText(filled, total);
  const name = label ?? (typeof title === "string" ? title : undefined);

  return (
    <Sheet id={id} tape="none" tilt={seededTilt(autoSeed, 1.2)} className={cx(styles.root, className)} style={style}>
      {(title || showCount) && (
        <div style={css.head}>
          {title && <div style={css.title}>{title}</div>}
          {/* Already in the list's name, so screen readers don't hear it twice. */}
          {showCount && (
            <span style={css.count} aria-hidden="true">
              {progress}
            </span>
          )}
        </div>
      )}
      <ol style={{ ...css.slots, gridTemplateColumns: `repeat(${cols}, minmax(0, 52px))` }} aria-label={name ? `${name}, ${progress}` : progress}>
        {Array.from({ length: total }, (_, i) => {
          const stamped = i < filled;
          if (!stamped) {
            return (
              <li key={i} style={css.slot}>
                <span style={css.vh}>{statusText.empty}</span>
              </li>
            );
          }
          // Every impression is a little different: its own tilt, ink, pressure and nudge, the same on every render.
          const r = random(`${autoSeed}-${i}`);
          const tilt = Math.round((r() * 2 - 1) * 1400) / 100;
          const pressure = Math.round((0.8 + r() * 0.17) * 100) / 100;
          const nudge = () => Math.round((r() * 2 - 1) * 20) / 10;
          const x = nudge();
          const look: CSSProperties = {
            ...css.stamp,
            color: `var(--plop-${ink === "mixed" ? STAMP_INKS[Math.floor(r() * STAMP_INKS.length)] : ink})`,
            opacity: pressure,
            transform: `translate(${x}px, ${nudge()}px) rotate(${tilt}deg)`,
          };
          return (
            <li key={i} style={css.slot}>
              <span style={css.vh}>{statusText.filled}</span>
              <span className={cx(styles.stamp, i === filled - 1 && styles.latest)} style={look} aria-hidden="true">
                {typeof stamp === "function" ? stamp(i) : stamp}
              </span>
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}
