"use client";

import { Buddy, Button, PlopProvider, seededTilt, Select, toast, useHaptics, useSound } from "@plop-ui/react";
import { surfaceNames, surfaces, type SurfaceName } from "@plop-ui/tokens";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { getPass, getServerPass, subscribe } from "../_site/pass";
import { useBoardHistory, type Board } from "./history";
import { Inspector } from "./Inspector";
import { placeNew, type Spot } from "./place";
import { Choice, Slider } from "./controls";
import { boardCode, codeFor, describe, KINDS, REGULARS_SHELF, SHELVES, type Item, type TrayEntry } from "./stickers";
import styles from "./tools.module.css";

const STORE = "plop-board-v1";
const DRAG_AFTER = 6;

const EMPTY: Board = { paper: "poster", items: [], roundness: 1 };

/** The last board on this device. Boards saved before roundness existed load with the default. */
function load(): Board | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<Board>;
    return { ...EMPTY, ...saved, items: Array.isArray(saved.items) ? saved.items : [] };
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
  const history = useBoardHistory(EMPTY);
  const { board: current, set: setBoard, undo, redo } = history;
  const { paper, items } = current;
  const setItems = useCallback(
    (next: Item[] | ((all: Item[]) => Item[]), commit = true) =>
      setBoard((b) => ({ ...b, items: typeof next === "function" ? next(b.items) : next }), { commit }),
    [setBoard],
  );
  const setPaper = (p: SurfaceName) => setBoard((b) => ({ ...b, paper: p }));
  const [selected, setSelected] = useState<string | null>(null);
  const [shelf, setShelf] = useState(SHELVES[0]!.id);
  const board = useRef<HTMLDivElement>(null);
  const tool = useRef<HTMLDivElement>(null);
  const counter = useRef(0);
  const haptics = useHaptics();
  const sound = useSound();
  const holo = useSyncExternalStore(subscribe, () => getPass().holo, () => getServerPass().holo);
  const shelves = holo ? [...SHELVES, REGULARS_SHELF] : SHELVES;

  // The board takes one screen minus the toolbar and the tray, so all three fit together once scrolled to
  // the toolbar. Measured, because the toolbar and tray wrap differently on every width.
  useEffect(() => {
    const el = tool.current;
    if (!el) return;
    const bar = el.querySelector<HTMLElement>("[role=toolbar]");
    const tray = el.querySelector<HTMLElement>("[data-tray]");
    const place = () => {
      el.style.setProperty("--tool-chrome", `${(bar?.offsetHeight ?? 0) + (tray?.offsetHeight ?? 0)}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    // The page itself too: fonts and the phone tab names change the height above the tool after the first measure.
    [bar, tray, document.documentElement].forEach((n) => n && ro.observe(n));
    void document.fonts?.ready.then(place);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, []);

  // Restore the last board on this device; save every change.
  const restored = useRef(false);
  useEffect(() => {
    const saved = load();
    if (saved) {
      history.reset(saved);
      counter.current = saved.items.length;
    }
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once, on mount
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(current));
    } catch {
      // Storage blocked: the board just lasts for this visit.
    }
  }, [current]);

  const sel = items.find((i) => i.id === selected) ?? null;
  const update = useCallback(
    (id: string, patch: Partial<Item> | ((it: Item) => Partial<Item>), commit = true) =>
      setItems((all) => all.map((it) => (it.id === id ? { ...it, ...(typeof patch === "function" ? patch(it) : patch) } : it)), commit),
    [setItems],
  );

  const add = (entry: TrayEntry, x?: number, y?: number, size?: { width: number; height: number }) => {
    const n = ++counter.current;
    const id = `s${Date.now().toString(36)}${n}`;
    // A tapped sticker fans out from the middle to the first free spot (a dragged one lands where it's dropped).
    const spot = x === undefined || y === undefined ? freeSpot(size) : { x, y };
    const item: Item = {
      id,
      kind: entry.kind,
      x: spot.x,
      y: spot.y,
      tilt: seededTilt(id, 7),
      scale: 1,
      z: Math.max(0, ...items.map((i) => i.z)) + 1,
      props: { ...entry.props },
    };
    setItems((all) => [...all, item]);
    setSelected(id);
    haptics.tap();
    sound("down");
  };

  /** The stickers already on the board, in % of it, and a guess at a new one's size (about a button). */
  const freeSpot = (size = { width: 190, height: 80 }) => {
    const area = board.current?.getBoundingClientRect();
    if (!area?.width || !area.height) return { x: 50, y: 50 };
    const taken: Spot[] = [...(board.current?.querySelectorAll<HTMLElement>("[data-sticker] > *") ?? [])].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: ((r.left + r.width / 2 - area.left) / area.width) * 100, y: ((r.top + r.height / 2 - area.top) / area.height) * 100, w: (r.width / area.width) * 100, h: (r.height / area.height) * 100 };
    });
    return placeNew(taken, Math.min(90, (size.width / area.width) * 100), Math.min(60, (size.height / area.height) * 100));
  };

  const remove = (id: string) => {
    setItems((all) => all.filter((i) => i.id !== id));
    setSelected(null);
    sound("up");
  };

  const clear = () => {
    setItems([]);
    setSelected(null);
    toast("Board cleared. Undo brings it back.");
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
      // Part of the drag's single undo step.
      update(d.id, { z: Math.max(0, ...items.map((i) => i.z)) + 1 }, false);
    }
    // Live while dragging; the whole drag becomes one undo step on release.
    update(d.id, { x: clamp(d.ox + (dx / rect.width) * 100, 2, 98), y: clamp(d.oy + (dy / rect.height) * 100, 3, 97) }, false);
  };
  const onItemUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d?.live && d.pid === e.pointerId) {
      history.commit();
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
    if (e.target !== e.currentTarget) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === "z" || e.key === "Z" || e.key === "y")) {
      e.preventDefault();
      if (e.key === "y" || e.shiftKey) redo();
      else undo();
      return;
    }
    if (!items.length) return;
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
    <div ref={tool} className={styles.boardTool}>
      {/* 1. Toolbar: undo first, then the paper and roundness, then taking the board away */}
      <div className={styles.toolbar} role="toolbar" aria-label="Board tools">
        <Button size="sm" variant="plain" onClick={undo} disabled={!history.canUndo}>
          Undo
        </Button>
        <Button size="sm" variant="plain" onClick={redo} disabled={!history.canRedo}>
          Redo
        </Button>
        <Select
          className={styles.paperPick}
          size="sm"
          label={<span className="vh">Paper</span>}
          placeholder="Paper"
          options={surfaceNames.map((s) => ({ value: s, label: surfaces[s].label }))}
          value={paper}
          onValueChange={(v) => setPaper(v as SurfaceName)}
        />
        <div className={styles.toolbarSlider}>
          <Slider label="Radius" value={current.roundness} min={0} max={2} step={0.1} unit="×" onChange={(v) => setBoard((b) => ({ ...b, roundness: v }))} />
        </div>
        <span className={styles.spacer} />
        <Button size="sm" variant="mustard" aria-label="Copy board code" onClick={() => copy(boardCode(items, paper, current.roundness), "Board code")} disabled={!items.length}>
          Copy
        </Button>
        <Button size="sm" variant="tomato" onClick={clear} disabled={!items.length}>
          Clear
        </Button>
      </div>

      {/* 2. The board */}
      <section className={styles.boardCol} aria-labelledby="board-h">
        <h2 id="board-h" className="vh">
          Your board
        </h2>
        <PlopProvider surface={paper} theme="light" toaster={false} roundness={current.roundness} className={styles.board}>
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
            aria-label={`Sticker board, ${items.length} sticker${items.length === 1 ? "" : "s"}${sel ? `, ${describe(sel)} selected` : ""}. Arrow keys move, N picks the next sticker, Delete peels it off, Ctrl or Command Z undoes.`}
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
                  Tap a sticker below to stick it here.
                </p>
              </div>
            )}
            {items.map((it) => (
              <div
                key={it.id}
                data-sticker=""
                data-id={it.id}
                className={styles.item}
                data-selected={it.id === selected ? "" : undefined}
                style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: it.z, "--tilt": `${it.tilt}deg`, "--scale": it.scale } as CSSProperties}
                onPointerDown={onItemDown(it)}
                onPointerMove={onItemMove}
                onPointerUp={onItemUp}
                onPointerCancel={() => (drag.current = null)}
                onDragStart={(e) => e.preventDefault()}
              >
                {/* Stickers on the board are pictures of components: a click picks the sticker, Tab skips it. */}
                <div inert>{KINDS[it.kind].render(it.props)}</div>
              </div>
            ))}
          </div>
        </PlopProvider>
        {sel && (
          <Inspector
            item={sel}
            area={board}
            onChange={(patch) => update(sel.id, patch)}
            onFront={() => toFront(sel.id)}
            onDuplicate={() => add({ kind: sel.kind, props: sel.props, hint: "" }, clamp(sel.x + 6, 2, 98), clamp(sel.y + 6, 3, 97))}
            onPeel={() => remove(sel.id)}
            onClose={() => {
              setSelected(null);
              board.current?.focus();
            }}
            code={<CodeBlock title="Code" code={`import { ${KINDS[sel.kind].imports.join(", ")} } from "@plop-ui/react";\n\n${codeFor(sel)}`} what="Code" />}
          />
        )}
      </section>

      {/* 4. Tray: pick a shelf, then a sticker */}
      <aside className={styles.tray} aria-labelledby="tray-h" data-tray="">
        <h2 id="tray-h" className="vh">
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
                onClick={(e) => {
                  if (swallow.current) {
                    swallow.current = false;
                    return;
                  }
                  add(entry, undefined, undefined, previewSize(e.currentTarget));
                }}
              />
            </div>
          ))}
        </div>
      </aside>

      {ghost && (
        <div className={styles.ghost} style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">
          {KINDS[ghost.entry.kind].render(ghost.entry.props)}
        </div>
      )}
    </div>
  );
}


/** A tray sticker's real size: its preview is scaled down, so undo the scale. */
function previewSize(addButton: HTMLElement) {
  const preview = addButton.parentElement?.querySelector<HTMLElement>("[data-kind]");
  const inner = preview?.firstElementChild?.getBoundingClientRect();
  if (!preview || !inner) return undefined;
  const scale = new DOMMatrix(getComputedStyle(preview).transform).a || 1;
  return { width: inner.width / scale, height: inner.height / scale };
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
