"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { BuddyPeek, type BuddyMood } from "../Buddy/Buddy.js";
import { ErrorIcon, InfoIcon, SuccessIcon } from "../icons.js";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import { dismiss, getToasts, subscribe, TOAST_BUDDY, type ToastItem, type ToastKind } from "./store.js";
import styles from "./Toast.module.css";

const icon: Record<ToastKind, ReactNode> = { info: <InfoIcon />, success: <SuccessIcon />, error: <ErrorIcon /> };
const empty: readonly ToastItem[] = [];

/** What shows behind a toast while it's up, so it reads apart from the page. */
export type ToastBackdrop = "dots" | "solid" | "none";

export interface ToasterProps {
  /** `solid`: a faint gradient wash. `dots`: a comic halftone screen over the wash. `none`: nothing. Default `solid`. */
  backdrop?: ToastBackdrop;
}

/** The toast zone: a polite live region at the bottom of the screen. PlopProvider renders one. */
export function Toaster({ backdrop = "solid" }: ToasterProps) {
  const items = useSyncExternalStore(subscribe, getToasts, () => empty);
  return (
    <div className={styles.zone} role="status" aria-live="polite" data-backdrop={backdrop}>
      {items.map((t) => (
        <ToastView key={t.id} item={t} />
      ))}
    </div>
  );
}

function ToastView({ item }: { item: ToastItem }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const leave = window.setTimeout(() => setLeaving(true), item.duration);
    const gone = window.setTimeout(() => dismiss(item.id), item.duration + 240);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(gone);
    };
  }, [item]);
  const body = (
    <div className={cx(styles.toast, item.kind !== "info" && styles[item.kind])} data-leaving={leaving ? "" : undefined}>
      {icon[item.kind]}
      <span>
        <Lettering amp={1.6}>{item.text}</Lettering>
      </span>
    </div>
  );
  return item.buddy ? (
    <BuddyPeek mood={item.buddy} className={styles.withBuddy}>
      {body}
    </BuddyPeek>
  ) : (
    body
  );
}

export interface ToastProps {
  children: ReactNode;
  kind?: ToastKind;
  /** A character peeks over the toast: `true` picks one for the kind, or name a mood. */
  buddy?: boolean | BuddyMood;
  className?: string;
}

/** A toast drawn in place (for docs and empty states); use `toast()` to show real ones. */
export function Toast({ children, kind = "info", buddy, className }: ToastProps) {
  const body = (
    <div className={cx(styles.toast, styles.static, kind !== "info" && styles[kind], className)}>
      {icon[kind]}
      <span>
        <Lettering amp={1.6}>{children}</Lettering>
      </span>
    </div>
  );
  const mood = buddy === true ? TOAST_BUDDY[kind] : buddy || undefined;
  return mood ? <BuddyPeek mood={mood} className={styles.withBuddy}>{body}</BuddyPeek> : body;
}
