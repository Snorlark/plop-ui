import type { ReactNode } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Badge.module.css";

export interface CountProps {
  /** The number shown. Screen readers hear `label` instead. */
  children: number | string;
  /** What the number means, read by screen readers: "3 unread". Required, because a bare number says nothing. */
  label: string;
  /** Fill: `tomato` for attention, `ink` for plain counts. Default `tomato`. */
  tone?: "tomato" | "ink";
  /** `sm` fits inside tabs and buttons. Default `md`. */
  size?: "sm" | "md";
  /** Extra class on the sticker. */
  className?: string;
}

/** A round count sticker. */
export function Count({ children, label, tone = "tomato", size = "md", className }: CountProps) {
  return (
    <span className={cx(styles.count, tone === "ink" && styles.inkCount, size === "sm" && styles.small, className)} role="img" aria-label={label}>
      {children}
    </span>
  );
}

export interface StatusDotProps {
  /** The words are the status; the dot only repeats it. */
  children: ReactNode;
  /** Sets the dot color: `online`, `busy` or `offline`. Default `online`. */
  tone?: "online" | "busy" | "offline";
  /** Extra class on the wrapper around the dot and words. */
  className?: string;
}

/** A small colored dot next to a status word. */
export function StatusDot({ children, tone = "online", className }: StatusDotProps) {
  return (
    <span className={cx(styles.dot, styles[tone], className)}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

/** A friendly empty state with a little doodle. */
export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  const ink = "var(--plop-ink)";
  return (
    <div className={cx(styles.empty, className)}>
      <svg viewBox="0 0 88 70" aria-hidden="true">
        <path d="M10 60 L 78 60" stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M24 60 C 22 40, 30 22, 44 22 C 58 22, 66 40, 64 60" fill="var(--plop-periwinkle)" stroke={ink} strokeWidth="3" />
        <circle cx="37" cy="40" r="2.6" fill={ink} />
        <circle cx="51" cy="40" r="2.6" fill={ink} />
        <path d="M39 48 C 42 46, 46 46, 49 48" stroke={ink} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M68 16 l4 -6 M74 22 l7 -2 M70 30 l6 3" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
