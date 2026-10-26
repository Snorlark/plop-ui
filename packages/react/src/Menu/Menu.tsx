"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useHaptics } from "../hooks/useHaptics.js";
import { useSound } from "../hooks/useSound.js";
import { cx } from "../internal/cx.js";
import styles from "./Menu.module.css";

export type MenuItem =
  | {
      label: string;
      onSelect: () => void;
      /** A hand-drawn icon on the left. */
      icon?: ReactNode;
      /** Keycaps on the right, e.g. `["Shift", "D"]`. A hint only: the shortcut itself is yours to wire up. */
      keys?: string[];
      /** A careful red item, e.g. Delete. Put it last, after a separator. */
      danger?: boolean;
      disabled?: boolean;
    }
  | "separator";

export interface MenuProps {
  /** What the menu is for, e.g. "Sketch actions". The trigger's text, or its accessible name with `icon`. */
  label: string;
  items: MenuItem[];
  /** Makes the trigger a round icon sticker (e.g. `<MoreIcon />`); the label is then read, not shown. */
  icon?: ReactNode;
  /** Which edge the sheet lines up with. Default `start`; use `end` for a menu at the right of a row. */
  align?: "start" | "end";
  className?: string;
}

/**
 * A sticker button that opens a short sheet of actions, with icons, keycap
 * hints, separators and one careful red item. It's a real menu: arrows move
 * between items (Home, End and a letter jump), Enter runs one, Escape closes
 * and puts focus back on the trigger.
 */
export function Menu({ label, items, icon, align = "start", className }: MenuProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<false | "first" | "last">(false);
  const haptics = useHaptics();
  const sound = useSound();

  const buttons = () => [...(sheet.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? [])];
  const close = (focusTrigger: boolean) => {
    setOpen(false);
    if (focusTrigger) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const all = buttons();
    (open === "last" ? all[all.length - 1] : all[0])?.focus();
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onKey = (e: KeyboardEvent) => {
    const all = buttons();
    const i = all.indexOf(document.activeElement as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    if (e.key === "ArrowDown") next = all[(i + 1) % all.length];
    else if (e.key === "ArrowUp") next = all[(i - 1 + all.length) % all.length];
    else if (e.key === "Home") next = all[0];
    else if (e.key === "End") next = all[all.length - 1];
    else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
      return;
    } else if (e.key === "Tab") {
      close(false);
      return;
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      next = all.find((b) => b.textContent?.trim().toLowerCase().startsWith(e.key.toLowerCase()));
    }
    if (!next) return;
    e.preventDefault();
    next.focus();
    haptics.tap();
  };

  return (
    <div ref={root} className={cx(styles.root, className)}>
      <button
        ref={trigger}
        type="button"
        id={`${id}-btn`}
        className={cx(styles.trigger, icon !== undefined && styles.round)}
        aria-haspopup="menu"
        aria-expanded={!!open}
        aria-controls={`${id}-menu`}
        aria-label={icon !== undefined ? label : undefined}
        onClick={() => {
          haptics.tap();
          if (open) close(true);
          else setOpen("first");
        }}
        onKeyDown={(e) => {
          if (open || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
          e.preventDefault();
          setOpen(e.key === "ArrowUp" ? "last" : "first");
        }}
      >
        {icon ?? (
          <>
            {label}
            <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
              <path d="M4 7 C 6 9, 7.5 10.5, 9 12 C 10.5 10.5, 12 9, 14 7" />
            </svg>
          </>
        )}
      </button>
      {open && (
        <div ref={sheet} id={`${id}-menu`} role="menu" tabIndex={-1} aria-labelledby={`${id}-btn`} className={cx(styles.sheet, align === "end" && styles.end)} onKeyDown={onKey}>
          {items.map((it, i) =>
            it === "separator" ? (
              <div key={`sep-${i}`} role="separator" className={styles.sep} />
            ) : (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={it.disabled}
                className={cx(styles.item, it.danger && styles.danger)}
                onClick={() => {
                  if (it.danger) haptics.error();
                  else haptics.tap();
                  sound("up");
                  close(true);
                  it.onSelect();
                }}
              >
                {it.icon}
                <span>{it.label}</span>
                {it.keys && (
                  <span className={styles.keys} aria-hidden="true">
                    {it.keys.map((k) => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
