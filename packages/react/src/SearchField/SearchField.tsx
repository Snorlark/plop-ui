"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Avatar } from "../Avatar/Avatar.js";
import { Buddy } from "../Buddy/Buddy.js";
import { useHaptics } from "../hooks/useHaptics.js";
import { useSound } from "../hooks/useSound.js";
import { cx } from "../internal/cx.js";
import { Tag } from "../Tag/Tag.js";
import type { TagTone } from "../Tag/types.js";
import styles from "./SearchField.module.css";

export type SearchLead = ReactNode | { avatar: string } | { dot: TagTone };

export interface SearchItem {
  id: string;
  title: string;
  /** A second line, e.g. "Brgy. 3, 2 min ago". */
  sub?: string;
  /** A washi-tape status on the right, e.g. `{ label: "Critical", tone: "tomato" }`. */
  meta?: { label: string; tone?: TagTone };
  /** What sits on the left: an icon, `{ avatar: "Rosa Santos" }` for a doodle face, or `{ dot: "mint" }`. */
  lead?: SearchLead;
  /** Extra words this item matches on. */
  keywords?: string;
}

export interface SearchGroup {
  id: string;
  /** Group heading, e.g. "People". */
  label: string;
  items: SearchItem[];
}

type Picked = { item: SearchItem; group: SearchGroup };

export interface SearchFieldProps {
  /** What you're searching, e.g. "Search components". Always read by screen readers. */
  label: string;
  /** Hide the label visually (it stays for screen readers). Use it in tight headers. */
  hideLabel?: boolean;
  placeholder?: string;
  /** `sm` for headers, `md` (default), `lg` for a page about finding things. */
  size?: "sm" | "md" | "lg";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * What can be found. Filtered as you type (title, sub, meta and keywords); pass `filter={false}`
   * if you filter yourself, e.g. on a server.
   */
  groups?: SearchGroup[];
  filter?: boolean;
  /** Shown when the box is empty and focused, e.g. quick actions. Recent searches come first. */
  emptyGroups?: SearchGroup[];
  /** Picked with Enter or a click. */
  onSelect?: (item: SearchItem, group: SearchGroup) => void;
  /** Remember picks under this localStorage key and offer them as recent searches. */
  recentKey?: string;
  /** Hop dots instead of the eraser while results load. */
  loading?: boolean;
  /** A keycap hint, and the key that focuses the field from anywhere on the page. `"/"` is a good one. */
  shortcut?: string;
  /** Max results per group. Default 4. */
  limit?: number;
  className?: string;
  /** @internal The command palette keeps its results sheet open inline. */
  inline?: boolean;
  /** @internal Focus the input as soon as it mounts (the palette does this when it opens). */
  focusOnMount?: boolean;
}

const RECENT_GROUP = "__recent";

function readRecent(key?: string): string[] {
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeRecent(key: string, list: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(0, 5)));
  } catch {
    // Storage blocked: no recent searches, that's all.
  }
}

/** Splits `text` around the first match of `q` so it can get a highlighter swipe. */
function Marked({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Lead({ lead }: { lead?: SearchLead }) {
  if (lead && typeof lead === "object" && "avatar" in lead) return <Avatar name={lead.avatar} size="sm" />;
  if (lead && typeof lead === "object" && "dot" in lead) return <span className={styles.dot} style={{ background: `var(--plop-${lead.dot})` }} />;
  return <>{lead}</>;
}

const Lens = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M10.6 3.8 C 14.6 3.6, 17.4 6.4, 17.2 10.4 C 17 14.2, 14.2 16.9, 10.4 16.8 C 6.6 16.7, 3.9 14, 4 10.2 C 4.1 6.6, 6.8 3.9, 10.6 3.8 Z" />
    <path d="M15.4 15.6 C 17.2 17.2, 18.8 18.8, 20.6 20.8" strokeWidth="3.2" />
  </svg>
);
const Clock = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.icon}>
    <path d="M12 4 C 17 4, 20 7.5, 20 12 C 20 16.5, 16.5 20, 12 20 C 7.5 20, 4 16.5, 4 12 C 4 7.5, 7.5 4, 12 4 Z M12 8 L 12 12.5 L 15 14" />
  </svg>
);

/**
 * A search box drawn like the rest of the kit: a wobbly marker outline that
 * boils while it has focus, a lens that tilts, keycap stickers for the
 * shortcut, and a results sheet taped under it. It's a real combobox: arrow
 * keys move through grouped results, Enter opens one, Escape clears the text
 * and then closes, and the count is announced.
 */
export function SearchField({
  label,
  hideLabel = false,
  placeholder,
  size = "md",
  value,
  defaultValue = "",
  onValueChange,
  groups = [],
  filter = true,
  emptyGroups = [],
  onSelect,
  recentKey,
  loading = false,
  shortcut,
  limit = 4,
  className,
  inline = false,
  focusOnMount = false,
}: SearchFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const q = text.trim();
  const [open, setOpen] = useState(inline);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const haptics = useHaptics();
  const sound = useSound();

  useEffect(() => setRecent(readRecent(recentKey)), [recentKey]);
  useEffect(() => {
    if (focusOnMount) input.current?.focus();
  }, [focusOnMount]);

  // A short "thinking" beat while typing, so results don't flicker on every key.
  useEffect(() => {
    if (!q) return setTyping(false);
    setTyping(true);
    const t = window.setTimeout(() => setTyping(false), 160);
    return () => window.clearTimeout(t);
  }, [q]);

  const set = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
    setActive(-1);
    setOpen(true);
  };

  // The groups shown right now: matches while typing, recent searches and quick actions when empty.
  const shown: SearchGroup[] = useMemo(() => {
    if (!q) {
      const out: SearchGroup[] = [];
      if (recent.length) out.push({ id: RECENT_GROUP, label: "Recent searches", items: recent.map((r) => ({ id: `r-${r}`, title: r, sub: "Search again", lead: <Clock /> })) });
      return [...out, ...emptyGroups];
    }
    if (!filter) return groups;
    const needle = q.toLowerCase();
    return groups
      .map((g) => ({ ...g, items: g.items.filter((it) => `${it.title} ${it.sub ?? ""} ${it.meta?.label ?? ""} ${it.keywords ?? ""}`.toLowerCase().includes(needle)).slice(0, limit) }))
      .filter((g) => g.items.length);
  }, [q, recent, emptyGroups, groups, filter, limit]);

  const flat: Picked[] = useMemo(() => shown.flatMap((group) => group.items.map((item) => ({ item, group }))), [shown]);
  const busy = loading || typing;
  const isEmpty = !!q && !busy && flat.length === 0;
  const expanded = open && (flat.length > 0 || isEmpty);
  const listId = `${id}-list`;
  const optId = (i: number) => `${id}-o${i}`;

  const choose = useCallback(
    (i: number) => {
      const picked = flat[i];
      if (!picked) return;
      if (picked.group.id === RECENT_GROUP) {
        set(picked.item.title);
        return;
      }
      if (recentKey && q) {
        const next = [picked.item.title, ...recent.filter((r) => r !== picked.item.title)];
        writeRecent(recentKey, next);
        setRecent(next.slice(0, 5));
      }
      haptics.tap();
      sound("up");
      if (!inline) {
        if (value === undefined) setInner("");
        onValueChange?.("");
        setOpen(false);
      }
      onSelect?.(picked.item, picked.group);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flat, recentKey, q, recent, inline, value, onSelect, onValueChange],
  );

  const move = (delta: number) => {
    if (!flat.length) return;
    setOpen(true);
    setActive((a) => (a < 0 && delta < 0 ? flat.length - 1 : (a + delta + flat.length) % flat.length));
    haptics.tap();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      if (flat.length) {
        e.preventDefault();
        choose(active >= 0 ? active : 0);
      }
    } else if (e.key === "Escape") {
      if (text) {
        e.preventDefault();
        e.stopPropagation();
        set("");
      } else if (open && !inline) {
        e.preventDefault();
        setOpen(false);
      }
    }
  };

  // Keep the active option in view.
  useEffect(() => {
    if (active >= 0) document.getElementById(optId(active))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // "/" (or the given key) jumps here from anywhere, unless someone's typing in a field.
  useEffect(() => {
    if (!shortcut || shortcut.length !== 1) return;
    const onDoc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== shortcut || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener("keydown", onDoc);
    return () => document.removeEventListener("keydown", onDoc);
  }, [shortcut]);

  let index = -1;

  return (
    <div
      ref={root}
      className={cx(styles.root, styles[size], inline && styles.inline, className)}
      data-filled={text ? "" : undefined}
      data-busy={busy ? "" : undefined}
      onBlur={(e) => {
        if (!inline && !root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label className={cx(styles.label, hideLabel && styles.vh)} htmlFor={id}>
        <span>{label}</span>
      </label>
      <div className={styles.box}>
        <span className={styles.lens} aria-hidden="true">
          <Lens />
        </span>
        <input
          ref={input}
          id={id}
          className={styles.input}
          type="search"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? optId(active) : undefined}
          value={text}
          placeholder={placeholder ?? label}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => set(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
        {shortcut && !text && (
          <span className={styles.keys} aria-hidden="true">
            {shortcut.split("+").map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </span>
        )}
        {busy && text ? (
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : (
          text && (
            <button
              type="button"
              className={styles.clear}
              aria-label={`Clear ${label.toLowerCase()}`}
              onClick={() => {
                set("");
                input.current?.focus();
                haptics.tap();
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6 C 10 10, 14 14, 18 18 M18 6 C 14 10, 10 14, 6 18" />
              </svg>
            </button>
          )
        )}
      </div>

      <div className={styles.pop} hidden={!expanded}>
        <ul className={styles.list} id={listId} role="listbox" aria-label={label}>
          {shown.map((g) => (
            <li key={g.id} role="presentation">
              <div className={styles.groupHead} role="presentation">
                <span className={styles.group}>{g.label}</span>
                {g.id === RECENT_GROUP && (
                  <button
                    type="button"
                    tabIndex={-1}
                    className={styles.clearRecent}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (recentKey) writeRecent(recentKey, []);
                      setRecent([]);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <ul role="presentation" className={styles.list}>
                {g.items.map((it) => {
                  index += 1;
                  const i = index;
                  return (
                    // Options are driven from the combobox input (arrow keys + Enter via aria-activedescendant); the click is the pointer path.
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <li
                      key={it.id}
                      id={optId(i)}
                      role="option"
                      aria-selected={i === active}
                      className={styles.opt}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseMove={() => active !== i && setActive(i)}
                      onClick={() => choose(i)}
                    >
                      <span className={styles.lead}>
                        <Lead lead={it.lead} />
                      </span>
                      <span className={styles.main}>
                        <span className={styles.title}>
                          <Marked text={it.title} q={g.id === RECENT_GROUP ? "" : q} />
                        </span>
                        {it.sub && (
                          <span className={styles.sub}>
                            <Marked text={it.sub} q={g.id === RECENT_GROUP ? "" : q} />
                          </span>
                        )}
                      </span>
                      {it.meta && (
                        <span className={styles.meta}>
                          <Tag tone={it.meta.tone ?? "periwinkle"} tilt={i % 2 ? 2 : -2}>
                            {it.meta.label}
                          </Tag>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        {isEmpty && (
          <div className={styles.empty}>
            <Buddy mood="thinking" size="sm" />
            <p>
              <b>Nothing for “{q}”</b>
              Try fewer letters, or another word for it.
            </p>
          </div>
        )}
        {flat.length > 0 && (
          <div className={styles.foot} aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> move
            </span>
            <span>
              <kbd>Enter</kbd> open
            </span>
            <span>
              <kbd>Esc</kbd> {text ? "clear" : "close"}
            </span>
          </div>
        )}
      </div>
      <p className={styles.vh} aria-live="polite">
        {q && !busy ? (flat.length ? `${flat.length} result${flat.length === 1 ? "" : "s"}` : `No results for ${q}`) : ""}
      </p>
    </div>
  );
}

export interface CommandPaletteProps {
  /** Controlled open state. Leave both out and the palette opens with the shortcut on its own. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** What can be found while typing. */
  groups: SearchGroup[];
  /** Shown before typing, e.g. quick actions. */
  emptyGroups?: SearchGroup[];
  onSelect: (item: SearchItem, group: SearchGroup) => void;
  /** Toggle with Cmd+K on a Mac, Ctrl+K elsewhere. Default true. */
  shortcut?: boolean;
  label?: string;
  placeholder?: string;
  recentKey?: string;
}

/** True on Apple devices, where the palette shortcut reads ⌘ instead of Ctrl. */
export function useIsMac() {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  return mac;
}

/**
 * Everything in one place: a taped sheet over the page with a big search
 * field, quick actions before you type and grouped results after. A native
 * `<dialog>`, so focus stays inside and Escape closes it. Opens with ⌘K /
 * Ctrl K unless you control it.
 */
export function CommandPalette({ open, onOpenChange, groups, emptyGroups, onSelect, shortcut = true, label = "Type a command or search", placeholder, recentKey }: CommandPaletteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [own, setOwn] = useState(false);
  const isOpen = open ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setOwn(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );
  const haptics = useHaptics();
  const sound = useSound();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) {
      d.showModal?.();
      haptics.tap();
      sound("up");
    } else if (!isOpen && d.open) d.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut, isOpen, setOpen]);

  return (
    // Clicking the backdrop closes it; the keyboard path is the dialog's own Escape.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      className={styles.palette}
      aria-label={label}
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className={styles.sheet}>
        {isOpen && (
          <SearchField
            inline
            focusOnMount
            size="lg"
            hideLabel
            label={label}
            placeholder={placeholder}
            groups={groups}
            emptyGroups={emptyGroups}
            recentKey={recentKey}
            limit={5}
            onSelect={(item, group) => {
              setOpen(false);
              onSelect(item, group);
            }}
          />
        )}
      </div>
    </dialog>
  );
}
