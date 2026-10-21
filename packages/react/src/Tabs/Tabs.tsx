"use client";

import { createContext, useContext, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { useHaptics } from "../hooks/useHaptics.js";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import styles from "./Tabs.module.css";

interface TabsContext {
  base: string;
  value: string;
  select: (value: string) => void;
}

const Ctx = createContext<TabsContext | null>(null);
const use = (part: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`<${part}> must be inside <Tabs>.`);
  return ctx;
};
const safe = (v: string) => v.replace(/[^\w-]/g, "_");

export interface TabsProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/** Index-card dividers. The active one comes forward and joins the page. Arrow keys, Home and End move between them. */
export function Tabs({ children, value, defaultValue = "", onValueChange, className }: TabsProps) {
  const base = useId();
  const [inner, setInner] = useState(defaultValue);
  const haptics = useHaptics();
  const select = (v: string) => {
    haptics.tap();
    setInner(v);
    onValueChange?.(v);
  };
  return (
    <Ctx.Provider value={{ base, value: value ?? inner, select }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export interface TabListProps {
  children: ReactNode;
  /** Accessible name of the tab list, e.g. "Incident queue". */
  label: string;
  className?: string;
}

export function TabList({ children, label, className }: TabListProps) {
  return (
    <div role="tablist" aria-label={label} className={cx(styles.list, className)}>
      {children}
    </div>
  );
}

/** Arrow keys, Home and End move focus (and selection) along the tab list. */
function moveFocus(e: KeyboardEvent<HTMLButtonElement>) {
  const tabs = [...(e.currentTarget.closest('[role="tablist"]')?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [])];
  const i = tabs.indexOf(e.currentTarget);
  const j =
    e.key === "ArrowRight" ? (i + 1) % tabs.length
    : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length
    : e.key === "Home" ? 0
    : e.key === "End" ? tabs.length - 1
    : null;
  if (j === null || i < 0) return;
  e.preventDefault();
  tabs[j]?.focus();
  tabs[j]?.click();
}

export interface TabProps {
  value: string;
  children: ReactNode;
  /** A count badge after the label (e.g. a <Count>). */
  badge?: ReactNode;
  disabled?: boolean;
}

export function Tab({ value, children, badge, disabled }: TabProps) {
  const ctx = use("Tab");
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.base}-tab-${safe(value)}`}
      aria-selected={selected}
      aria-controls={`${ctx.base}-panel-${safe(value)}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={styles.tab}
      onClick={() => ctx.select(value)}
      onKeyDown={moveFocus}
    >
      <span>
        <Lettering amp={1.8}>{children}</Lettering>
      </span>
      {badge && <span>{badge}</span>}
    </button>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = use("TabPanel");
  return (
    <div
      role="tabpanel"
      id={`${ctx.base}-panel-${safe(value)}`}
      aria-labelledby={`${ctx.base}-tab-${safe(value)}`}
      tabIndex={0}
      hidden={ctx.value !== value}
      className={cx(styles.panel, className)}
    >
      {children}
    </div>
  );
}
