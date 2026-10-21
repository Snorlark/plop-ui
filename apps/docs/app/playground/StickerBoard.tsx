"use client";

import { Buddy, Button, PlopProvider, seededTilt, toast, useHaptics, useSound } from "@plop-ui/react";
import { surfaceNames, surfaces, type SurfaceName } from "@plop-ui/tokens";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { getPass, getServerPass, stamp, subscribe } from "../_site/pass";
import { Choice, Slider, Swatches, Text } from "./controls";
import { boardCode, codeFor, describe, KINDS, REGULARS_SHELF, SHELVES, type Item, type TrayEntry } from "./stickers";
import styles from "./tools.module.css";

const STORE = "plop-board-v1";
const DRAG_AFTER = 6;

interface Saved {
  paper: SurfaceName;
  items: Item[];
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`, { buddy: true });
  } catch {
    toast.error("Couldn't copy. Select it instead.", { buddy: true });
  }
}

/**
 * Stick real components on a paper board. Pick a shelf, tap (or drag) a
 * sticker onto the board, then move, tilt and resize it. The panel on the
 * right only shows what fits the selected sticker, and its code.
 */
export function StickerBoard() {
  const [paper, setPaper] = useState<SurfaceName>("poster");
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [shelf, setShelf] = useState(SHELVES[0]!.id);
  const board = useRef<HTMLDivElement>(null);
  const counter = useRef(0);
  const haptics = useHaptics();
  const sound = useSound();
  const holo = useSyncExternalStore(subscribe, () => getPass().holo, () => getServerPass().holo);
  const shelves = holo ? [...SHELVES, REGULARS_SHELF] : SHELVES;

  // Restore the last board on this device; save every change.
  const restored = useRef(false);
  useEffect(() => {
    const saved = load();
    if (saved) {
      setPaper(saved.paper);
      setItems(saved.items);
      counter.current = saved.items.length;
    }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ paper, items }));
    } catch {
      // Storage blocked: the board just lasts for this visit.
    }
  }, [paper, items]);

  const sel = items.find((i) => i.id === selected) ?? null;
  const update = useCallback((id: string, patch: Partial<Item> | ((it: Item) => Partial<Item>)) => {
    setItems((all) => all.map((it) => (it.id === id ? { ...it, ...(typeof patch === "function" ? patch(it) : patch) } : it)));
  }, []);

  const add = (entry: TrayEntry, x?: number, y?: number) => {
    const n = ++counter.current;
    const id = `s${Date.now().toString(36)}${n}`;
    // New stickers land in a loose spiral around the middle, so they don't stack exactly.
    const angle = n * 2.4;
    const item: Item = {
      id,
      kind: entry.kind,
      x: x ?? 50 + Math.cos(angle) * Math.min(30, 6 + n * 3),
      y: y ?? 50 + Math.sin(angle) * Math.min(32, 6 + n * 3),
      tilt: seededTilt(id, 7),
      scale: 1,
      z: Math.max(0, ...items.map((i) => i.z)) + 1,
      props: { ...entry.props },
    };
    setItems((all) => [...all, item]);
    setSelected(id);
    haptics.tap();
    sound("down");
    stamp("board");
  };

  const remove = (id: string) => {
    setItems((all) => all.filter((i) => i.id !== id));
    setSelected(null);
    sound("up");
  };

  const toFront = (id: string) => update(id, { z: Math.max(0, ...items.map((i) => i.z)) + 1 });

  /* ---- dragging stickers around the board ---- */
  const drag = useRef<{ id: string; pid: number; sx: number; sy: number; ox: number; oy: number; live: boolean } | null>(null);
  const swallow = useRef(false);

  const onItemDown = (it: Item) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    swallow.current = false;
    setSelected(it.id);
    drag.current = { id: it.id, pid: e.pointerId, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, live: false };
  };
  const onItemMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const rect = board.current?.getBoundingClientRect();
    if (!d || d.pid !== e.pointerId || !rect) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.live) {
      if (Math.hypot(dx, dy) < DRAG_AFTER) return;
      d.live = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      toFront(d.id);
    }
    update(d.id, { x: clamp(d.ox + (dx / rect.width) * 100, 2, 98), y: clamp(d.oy + (dy / rect.height) * 100, 3, 97) });
  };
  const onItemUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d?.live && d.pid === e.pointerId) {
      swallow.current = true;
      haptics.tap();
    }
  };

  /* ---- dragging from the tray ---- */
  const [ghost, setGhost] = useState<{ entry: TrayEntry; x: number; y: number } | null>(null);
  const trayDrag = useRef<{ entry: TrayEntry; pid: number; sx: number; sy: number; live: boolean } | null>(null);
  const trayDown = (entry: TrayEntry) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    trayDrag.current = { entry, pid: e.pointerId, sx: e.clientX, sy: e.clientY, live: false };
  };
  const trayMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = trayDrag.current;
    if (!d || d.pid !== e.pointerId) return;
    if (!d.live && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < DRAG_AFTER) return;
    if (!d.live) {
      d.live = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setGhost({ entry: d.entry, x: e.clientX, y: e.clientY });
  };
  const trayUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = trayDrag.current;
    trayDrag.current = null;
    setGhost(null);
    if (!d?.live) return;
    const r = board.current?.getBoundingClientRect();
    if (r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
      add(d.entry, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    }
    swallow.current = true;
  };

  /* ---- keyboard: the board is one tab stop; arrows move, Delete peels, N picks the next ---- */
  const onBoardKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !items.length) return;
    const current = sel ?? items[items.length - 1]!;
    const step = e.shiftKey ? 5 : 1;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      setSelected(current.id);
      const [mx, my] = moves[e.key]!;
      update(current.id, (it) => ({ x: clamp(it.x + mx, 2, 98), y: clamp(it.y + my, 3, 97) }));
    } else if ((e.key === "Delete" || e.key === "Backspace") && sel) {
      e.preventDefault();
      remove(sel.id);
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      const i = sel ? items.indexOf(sel) : -1;
      setSelected(items[(i + 1) % items.length]!.id);
    } else if (e.key === "Escape") {
      setSelected(null);
    }
  };

  const shelfItems = (shelves.find((s) => s.id === shelf) ?? shelves[0]!).items;

  return (
    <div className={styles.boardTool}>
      {/* 1. Tray: pick a shelf, then a sticker */}
      <aside className={styles.tray} aria-labelledby="tray-h">
        <h2 id="tray-h" className={styles.panelTitle}>
          Stickers
        </h2>
        <Choice label="Shelf" value={shelf} options={shelves.map((s) => [s.id, s.label])} onChange={setShelf} />
        <div className={styles.trayGrid} role="list">
          {shelfItems.map((entry, i) => (
            <div role="listitem" key={`${shelf}-${i}`} className={styles.trayItem}>
              {/* The preview is a real component, so it sits beside the add button rather than inside it. */}
              <span className={styles.trayPreview} data-kind={entry.kind} aria-hidden="true" inert>
                {KINDS[entry.kind].render(entry.props)}
              </span>
              <span className={styles.trayHint} aria-hidden="true">
                {entry.hint}
              </span>
              <button
                type="button"
                className={styles.trayAdd}
                aria-label={`Add ${entry.hint}`}
                onPointerDown={trayDown(entry)}
                onPointerMove={trayMove}
                onPointerUp={trayUp}
                onPointerCancel={() => {
                  trayDrag.current = null;
                  setGhost(null);
                }}
                onClick={() => {
                  if (swallow.current) {
                    swallow.current = false;
                    return;
                  }
                  add(entry);
                }}
              />
            </div>
          ))}
        </div>
        <p className={styles.help}>Tap to add, or drag onto the board.</p>
      </aside>

      {/* 2. The board */}
      <section className={styles.boardCol} aria-labelledby="board-h">
        <h2 id="board-h" className="vh">
          Your board
        </h2>
        <PlopProvider surface={paper} theme="light" toaster={false} className={styles.board}>
          {/* A custom 2D widget: one tab stop, arrow keys move the selected sticker (see onBoardKey). */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            ref={board}
            className={styles.boardArea}
            // A 2D surface with its own arrow-key moves: an application region, announced as a sticker board.
            role="application"
            aria-roledescription="sticker board"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            aria-label={`Sticker board, ${items.length} sticker${items.length === 1 ? "" : "s"}${sel ? `, ${describe(sel)} selected` : ""}. Arrow keys move, N picks the next sticker, Delete peels it off.`}
            onKeyDown={onBoardKey}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            {!items.length && (
              <div className={styles.empty}>
                <Buddy mood="preview" size="lg" />
                <p>
                  <strong>Your board is empty.</strong>
                  <br />
                  Tap a sticker in the tray to stick it here.
                </p>
              </div>
            )}
            {items.map((it) => (
              <div
                key={it.id}
                className={styles.item}
                data-selected={it.id === selected ? "" : undefined}
                style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: it.z, "--tilt": `${it.tilt}deg`, "--scale": it.scale } as CSSProperties}
                onPointerDown={onItemDown(it)}
                onPointerMove={onItemMove}
                onPointerUp={onItemUp}
                onPointerCancel={() => (drag.current = null)}
                onDragStart={(e) => e.preventDefault()}
                onClickCapture={(e) => {
                  if (swallow.current) {
                    swallow.current = false;
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                {KINDS[it.kind].render(it.props)}
              </div>
            ))}
          </div>
        </PlopProvider>
        <div className={styles.boardBar}>
          <Choice label="Paper" value={paper} options={surfaceNames.map((s) => [s, surfaces[s].label])} onChange={(v) => setPaper(v as SurfaceName)} />
        </div>
      </section>

      {/* 3. Inspector: only what fits the selection */}
      <aside className={styles.inspector} aria-labelledby="insp-h">
        {sel ? (
          <>
            <h2 id="insp-h" className={styles.panelTitle}>
              {KINDS[sel.kind].name}
            </h2>
            {KINDS[sel.kind].fields.map((f) => {
              const v = sel.props[f.key];
              const set = (nv: string | number | boolean) => update(sel.id, (it) => ({ props: { ...it.props, [f.key]: nv } }));
              if (f.type === "text") return <Text key={f.key} label={f.label} value={String(v ?? "")} onChange={set} />;
              if (f.type === "swatch") return <Swatches key={f.key} label={f.label} value={String(v)} options={f.options} onChange={set} />;
              if (f.type === "choice") return <Choice key={f.key} label={f.label} value={String(v)} options={f.options} onChange={set} />;
              if (f.type === "step") return <Slider key={f.key} label={f.label} value={Number(v)} min={f.min} max={f.max} onChange={set} />;
              return (
                <Choice key={f.key} label={f.label} value={v ? "yes" : "no"} options={[["yes", "Yes"], ["no", "No"]]} onChange={(nv) => set(nv === "yes")} />
              );
            })}
            <Slider label="Size" value={Math.round(sel.scale * 100)} min={50} max={180} step={5} unit="%" onChange={(v) => update(sel.id, { scale: v / 100 })} />
            <Slider label="Tilt" value={sel.tilt} min={-20} max={20} step={0.5} unit="°" onChange={(v) => update(sel.id, { tilt: v })} />
            <div className={styles.actions}>
              <Button size="sm" variant="plain" onClick={() => toFront(sel.id)}>
                To front
              </Button>
              <Button size="sm" variant="plain" onClick={() => add({ kind: sel.kind, props: sel.props, hint: "" }, clamp(sel.x + 6, 2, 98), clamp(sel.y + 6, 3, 97))}>
                Copy sticker
              </Button>
              <Button size="sm" variant="tomato" onClick={() => remove(sel.id)}>
                Peel off
              </Button>
            </div>
            <CodeBlock title="Code" code={`import { ${KINDS[sel.kind].imports.join(", ")} } from "@plop-ui/react";\n\n${codeFor(sel)}`} what="Code" />
          </>
        ) : (
          <>
            <h2 id="insp-h" className={styles.panelTitle}>
              Board
            </h2>
            <p className={styles.help}>Select a sticker to change its words, color, size and tilt.</p>
            {items.length > 0 && (
              <>
                <CodeBlock title="Whole board as a component" code={boardCode(items, paper)} what="Board code" />
                <div className={styles.actions}>
                  <Button size="sm" variant="tomato" onClick={() => setItems([])}>
                    Clear board
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </aside>

      {ghost && (
        <div className={styles.ghost} style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">
          {KINDS[ghost.entry.kind].render(ghost.entry.props)}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ title, code, what }: { title: string; code: string; what: string }) {
  return (
    <div className={styles.code}>
      <div className={styles.codeBar}>
        <span className={styles.label}>{title}</span>
        <Button size="sm" variant="mustard" onClick={() => copy(code, what)}>
          Copy
        </Button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

export { CodeBlock, copy };
