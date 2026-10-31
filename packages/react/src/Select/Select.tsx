"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Avatar, type AvatarStatus } from "../Avatar/Avatar.js";
import { useHaptics } from "../hooks/useHaptics.js";
import { useSound } from "../hooks/useSound.js";
import { ErrorIcon } from "../icons.js";
import { cx } from "../internal/cx.js";
import { Marked } from "../internal/Marked.js";
import { Skeleton } from "../Skeleton/Skeleton.js";
import { DotsMark } from "../Spinner/ink.js";
import { Tag } from "../Tag/Tag.js";
import type { TagTone } from "../Tag/types.js";
import styles from "./Select.module.css";

export type SelectLead = ReactNode | { avatar: string; status?: AvatarStatus } | { dot: TagTone };

export interface SelectOption {
  value: string;
  label: string;
  /** A second line, e.g. "Illustrator". Searched too. */
  hint?: string;
  /** Options with the same group sit under one heading. Keep a group's options next to each other. */
  group?: string;
  /** What sits on the left: an icon, `{ avatar: "Rosa Santos", status: "online" }` for a doodle face, or `{ dot: "mint" }`. */
  lead?: SelectLead;
  /** Tape color when it's picked in a MultiSelect. Default `periwinkle`. */
  tone?: TagTone;
  disabled?: boolean;
}

interface SelectBaseProps {
  /** The visible label. Required: every field needs a name. */
  label: ReactNode;
  /** The choices, in order: `value`, `label`, and optional `hint`, `group`, `lead`, `tone`, `disabled`. */
  options: SelectOption[];
  /** Shown while nothing is picked. Default "Choose…". */
  placeholder?: string;
  /** `md` (default) or `sm` for toolbars. */
  size?: "sm" | "md";
  /** Adds a search box at the top of the list that filters by label and hint. */
  searchable?: boolean;
  /** The search box's label and placeholder. Default "Search". */
  searchLabel?: string;
  /** Help under the field. */
  hint?: ReactNode;
  /** An error that says how to fix it. Turns the outline tomato; it's read as the trigger's description. */
  error?: ReactNode;
  /** Greys out the trigger so the list can't be opened. */
  disabled?: boolean;
  /** While options are on their way: a skeleton line in the trigger, hopping dots instead of the chevron, and the trigger waits (aria-busy, can't open). */
  loading?: boolean;
  /** Extra class on the field wrapper. */
  className?: string;
}

export interface SelectProps extends SelectBaseProps {
  /** Controlled picked value; `null` means nothing is picked. */
  value?: string | null;
  /** Uncontrolled initial value. Default `null` (nothing picked). */
  defaultValue?: string | null;
  /** Called with the picked option's value. */
  onValueChange?: (value: string) => void;
}

export interface MultiSelectProps extends SelectBaseProps {
  /** Controlled picked values. */
  value?: string[];
  /** Uncontrolled initial values. Default `[]`. */
  defaultValue?: string[];
  /** Called with the full new list of picked values each time one is added or removed. */
  onValueChange?: (value: string[]) => void;
}

const Chevron = () => (
  <svg className={styles.chev} viewBox="0 0 18 18" aria-hidden="true" focusable="false">
    <path d="M4 7 C 6 9, 7.5 10.5, 9 12 C 10.5 10.5, 12 9, 14 7" />
  </svg>
);
const Tick = () => (
  <svg className={styles.tick} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4 13 C 6.5 14.5, 8 16.5, 9 19 C 12 12, 15.5 7.5, 21 4" />
  </svg>
);
const Box = () => (
  <svg className={styles.box} viewBox="0 0 30 30" aria-hidden="true" focusable="false">
    <path className={styles.boxEdge} d="M4 5 C 10 3.5, 20 4.5, 26 4 C 26.5 10, 25.5 19, 26.5 26 C 19 26.8, 11 25.5, 4.5 26.5 C 3.5 19, 4.5 11, 4 5 Z" />
    <path className={styles.boxTick} d="M7 15 C 9.5 17, 11.5 20, 12.5 23 C 15.5 15, 20 7.5, 29 1.5" />
  </svg>
);
const Lens = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M10.5 4 C 14.5 3.6, 17.4 6.5, 17 10.5 C 16.6 14.2, 13.8 16.8, 10.2 16.6 C 6.6 16.4, 4 13.6, 4.2 10 C 4.4 6.6, 7 4.3, 10.5 4 Z" />
    <path d="M15.2 15.4 L 20.5 20.6" strokeWidth="3.2" />
  </svg>
);

function Lead({ lead }: { lead: SelectLead }) {
  if (lead && typeof lead === "object" && "avatar" in lead) return <Avatar name={lead.avatar} status={lead.status} size="sm" />;
  if (lead && typeof lead === "object" && "dot" in lead) return <span className={styles.dot} style={{ background: `var(--plop-${lead.dot})` }} />;
  return <>{lead}</>;
}

/** The next option from `from` in direction `d` that isn't disabled, wrapping around. */
function step(options: SelectOption[], from: number, d: 1 | -1): number {
  const n = options.length;
  for (let i = from, k = 0; k < n; k++) {
    i = (i + d + n) % n;
    if (!options[i]!.disabled) return i;
  }
  return -1;
}

function SelectCore({
  multiple,
  chosen,
  pick,
  label,
  options,
  placeholder = "Choose…",
  size = "md",
  searchable = false,
  searchLabel = "Search",
  hint,
  error,
  disabled = false,
  loading = false,
  className,
}: SelectBaseProps & { multiple: boolean; chosen: string[]; pick: (value: string) => void }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  // The tag that was just picked in a MultiSelect: only it slaps down, not the whole row.
  const [landed, setLanded] = useState<string | null>(null);
  const haptics = useHaptics();
  const sound = useSound();

  const q = query.trim();
  const shown = useMemo(() => (q ? options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q.toLowerCase())) : options), [options, q]);
  const message = error ?? hint;
  const listId = `${id}-list`;
  const optId = (i: number) => `${id}-o${i}`;

  const show = (from: "selected" | "last") => {
    if (disabled || loading) return;
    setQuery("");
    const selected = options.findIndex((o) => chosen.includes(o.value) && !o.disabled);
    setActive(from === "last" ? step(options, 0, -1) : selected >= 0 ? selected : step(options, -1, 1));
    setOpen(true);
    haptics.tap();
  };
  const close = (focusTrigger: boolean) => {
    setOpen(false);
    if (focusTrigger) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    (search.current ?? list.current)?.focus({ preventScroll: true });
    // The sheet always drops down; near the bottom of the screen, scroll just enough to show it.
    sheet.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [open]);
  useEffect(() => {
    if (open && active >= 0) document.getElementById(optId(active))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);
  // Typing in the search box puts the first match up front.
  useEffect(() => {
    if (open) setActive(step(shown, -1, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const choose = (i: number) => {
    const o = shown[i];
    if (!o || o.disabled) return;
    const adding = !chosen.includes(o.value);
    pick(o.value);
    haptics.tap();
    sound(adding ? "up" : "down");
    if (multiple) setLanded(adding ? o.value : null);
    else close(true);
  };
  const move = (d: 1 | -1) => {
    setActive((a) => step(shown, a < 0 && d < 0 ? 0 : a, d));
    haptics.tap();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      move(e.key === "ArrowDown" ? 1 : -1);
    } else if ((e.key === "Home" || e.key === "End") && !searchable) {
      e.preventDefault();
      setActive(e.key === "Home" ? step(shown, -1, 1) : step(shown, 0, -1));
    } else if (e.key === "Enter" || (e.key === " " && !searchable)) {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    } else if (!searchable && e.key.length === 1 && /\S/.test(e.key)) {
      // Type a letter (or a few, quickly) to jump to the option that starts with them.
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : "") + e.key.toLowerCase(), at: now };
      const i = shown.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.text));
      if (i >= 0) setActive(i);
    }
  };

  const picked = options.filter((o) => chosen.includes(o.value));
  let value: ReactNode = <span className={styles.placeholder}>{placeholder}</span>;
  if (multiple && picked.length) {
    value = (
      <>
        <span className={styles.tags}>
          {picked.map((o, i) => (
            <span key={o.value} className={cx(styles.tape, o.value === landed && styles.land)}>
              <Tag tone={o.tone} tilt={i % 2 ? 2 : -2}>
                {o.label}
              </Tag>
            </span>
          ))}
        </span>
        <span className={styles.vh}>, {picked.length} selected</span>
      </>
    );
  } else if (!multiple && picked[0]) {
    value = (
      <>
        {picked[0].lead !== undefined && (
          <span className={styles.lead} aria-hidden="true">
            <Lead lead={picked[0].lead} />
          </span>
        )}
        <span className={styles.text}>{picked[0].label}</span>
      </>
    );
  }

  if (loading) {
    value = (
      <>
        <Skeleton width="62%" height={12} seed={`${id}-sk`} />
        <span className={styles.vh}>, loading options</span>
      </>
    );
  }

  let group: string | undefined;
  return (
    <div ref={root} className={cx(styles.root, styles[size], open && styles.open, error ? styles.error : undefined, className)}>
      <span className={styles.label} id={`${id}-label`}>
        <span>{label}</span>
      </span>
      {/* The sheet hangs off this box, so it sits right under the trigger however tall the field gets (hint, error, a stretching grid). */}
      <div className={styles.anchor}>
      <button
        ref={trigger}
        type="button"
        id={`${id}-btn`}
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${id}-label ${id}-btn`}
        aria-describedby={message ? `${id}-msg` : undefined}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        onClick={() => (open ? close(true) : show("selected"))}
        onKeyDown={(e) => {
          if (open || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
          e.preventDefault();
          show(e.key === "ArrowUp" ? "last" : "selected");
        }}
      >
        <span className={styles.value}>{value}</span>
        {loading ? (
          <DotsMark className={styles.dots} style={{ "--sp-size": "18px" } as CSSProperties} />
        ) : (
          <Chevron />
        )}
      </button>

      {open && (
        <div ref={sheet} className={styles.pop}>
          {searchable && (
            <div className={styles.search}>
              <Lens />
              <input
                ref={search}
                type="text"
                role="combobox"
                aria-label={searchLabel}
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={active >= 0 ? optId(active) : undefined}
                placeholder={searchLabel}
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
              />
            </div>
          )}
          <ul
            ref={list}
            id={listId}
            role="listbox"
            className={styles.list}
            aria-labelledby={`${id}-label`}
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={!searchable && active >= 0 ? optId(active) : undefined}
            tabIndex={-1}
            onKeyDown={searchable ? undefined : onKey}
          >
            {shown.length === 0 && (
              <li role="presentation" className={styles.empty}>
                Nothing matches “{q}”.
              </li>
            )}
            {shown.map((o, i) => {
              const head = o.group && o.group !== group ? o.group : undefined;
              group = o.group;
              const on = chosen.includes(o.value);
              return [
                head && (
                  <li key={`g-${head}`} role="presentation" className={styles.group}>
                    {head}
                  </li>
                ),
                // Keyboard lives on the listbox (or the search box), via aria-activedescendant.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <li
                  key={o.value}
                  id={optId(i)}
                  role="option"
                  aria-selected={on}
                  aria-disabled={o.disabled || undefined}
                  className={cx(styles.opt, i === active && styles.active)}
                  // Keep focus in the list (or the search box) when an option is pressed.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  onPointerMove={() => i !== active && !o.disabled && setActive(i)}
                >
                  {multiple && <Box />}
                  {o.lead !== undefined && (
                    <span className={styles.lead} aria-hidden="true">
                      <Lead lead={o.lead} />
                    </span>
                  )}
                  <span className={styles.main}>
                    <Marked text={o.label} q={q} />
                    {o.hint && (
                      <small>
                        <Marked text={o.hint} q={q} />
                      </small>
                    )}
                  </span>
                  {!multiple && <Tick />}
                </li>,
              ];
            })}
          </ul>
        </div>
      )}
      </div>

      {message && (
        // A div, not a <p>: page prose styles shouldn't resize the field's own message.
        <div className={styles.msg} id={`${id}-msg`}>
          {error ? <ErrorIcon /> : null}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Pick one from a list, on a taped paper sheet. The trigger has the same
 * wobbly marker outline as the fields and boils while open; the picked
 * option gets a tick that draws itself in. `searchable` adds a filter box
 * for long lists, like a people picker. Keyboard: arrows, Home and End, a
 * letter to jump, Enter or Space to pick, Escape to close.
 */
export function Select({ value, defaultValue = null, onValueChange, ...rest }: SelectProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value !== undefined ? value : inner;
  return (
    <SelectCore
      {...rest}
      multiple={false}
      chosen={current == null ? [] : [current]}
      pick={(v) => {
        if (value === undefined) setInner(v);
        onValueChange?.(v);
      }}
    />
  );
}

/** Pick any number. Each picked option sticks onto the trigger as a strip of washi tape; the list stays open while you pick. */
export function MultiSelect({ value, defaultValue = [], onValueChange, ...rest }: MultiSelectProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  return (
    <SelectCore
      {...rest}
      multiple
      chosen={current}
      pick={(v) => {
        const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
        if (value === undefined) setInner(next);
        onValueChange?.(next);
      }}
    />
  );
}
