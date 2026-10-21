"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { ErrorIcon, InfoIcon, SuccessIcon } from "../icons.js";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import { dismiss, getToasts, subscribe, type ToastItem, type ToastKind } from "./store.js";
import styles from "./Toast.module.css";

const icon: Record<ToastKind, ReactNode> = { info: <InfoIcon />, success: <SuccessIcon />, error: <ErrorIcon /> };
const empty: readonly ToastItem[] = [];

/** The toast zone: a polite live region at the bottom of the screen. PlopProvider renders one. */
export function Toaster() {
  const items = useSyncExternalStore(subscribe, getToasts, () => empty);
  return (
    <div className={styles.zone} role="status" aria-live="polite">
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
  return (
    <div className={cx(styles.toast, item.kind !== "info" && styles[item.kind])} data-leaving={leaving ? "" : undefined}>
      {icon[item.kind]}
      <span>
        <Lettering amp={1.6}>{item.text}</Lettering>
      </span>
    </div>
  );
}

export interface ToastProps {
  children: ReactNode;
  kind?: ToastKind;
  className?: string;
}

/** A toast drawn in place (for docs and empty states); use `toast()` to show real ones. */
export function Toast({ children, kind = "info", className }: ToastProps) {
  return (
    <div className={cx(styles.toast, styles.static, kind !== "info" && styles[kind], className)}>
      {icon[kind]}
      <span>
        <Lettering amp={1.6}>{children}</Lettering>
      </span>
    </div>
  );
}
