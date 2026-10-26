"use client";

import { useHaptics, useReducedMotion, useSound } from "@plop-ui/react";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

type PackState = "sealed" | "tearing" | "open";

const PackContext = createContext<{ open: boolean; resetKey: number; raise: () => number }>({ open: false, resetKey: 0, raise: () => 1 });

/** How far a press can wander before it counts as a drag (so a tap still presses the sticker). */
const DRAG_START = 6;
/** How far the top strip has to be pulled before it rips off. */
const TEAR_AT = 140;

/** A torn edge's jags, as a fixed pattern (no randomness in render), in % of the strip's height from its bottom. */
const JAGS = [0, 14, 4, 18, 7, 12, 2, 16, 9, 20, 3, 13, 6, 17, 1, 15, 8, 19, 5, 11];

/**
 * The strip's outline while it tears: straight along the top and the untorn part of the bottom, ragged along the
 * part already ripped. The rip runs from the right (where you pull) toward the left as `torn` goes from 0 to 1.
 */
function tornOutline(torn: number) {
  const points = ["0% 0%", "100% 0%"];
  for (let i = 0; i <= JAGS.length; i++) {
    const x = 100 - (i * 100) / JAGS.length;
    const ripped = x >= 100 - torn * 100;
    points.push(`${x.toFixed(1)}% ${ripped ? 100 - JAGS[i % JAGS.length]! : 100}%`);
  }
  return `polygon(${points.join(", ")})`;
}

/**
 * The hero's sticker pack. Sealed, it wiggles on hover. Grab the perforated top strip and pull it: it peels up
 * from its left corner and follows you, rips off once it's pulled far enough, and snaps back if you let go early.
 * The "Tear it open" button does the same for a click or the keyboard. Then the stickers inside come loose:
 * hover one and its corner peels up, press it and the real component inside does its thing, drag it anywhere
 * on the screen. "Put them back" reseals the pack.
 */
export function StickerPack({ cover, children }: { cover: ReactNode; children: ReactNode }) {
  const [state, setState] = useState<PackState>("sealed");
  const [resetKey, setResetKey] = useState(0);
  const top = useRef(10);
  const reduced = useReducedMotion();
  const haptics = useHaptics();
  const sound = useSound();
  const sheet = useRef<HTMLDivElement>(null);
  // Set by the tear, so focus moves into the opened pack (and back to the strip when it's resealed).
  const opener = useRef(false);
  const strip = useRef<HTMLButtonElement>(null);
  const resealed = useRef(false);
  // The strip while it's being pulled: how far, and from where.
  const [pull, setPull] = useState<{ x: number; y: number } | null>(null);
  const pullFrom = useRef<{ id: number; x: number; y: number; ready: boolean } | null>(null);
  const progress = pull ? Math.min(1, Math.hypot(pull.x, pull.y) / TEAR_AT) : 0;

  const tear = () => {
    if (state !== "sealed") return;
    opener.current = true;
    haptics.tap();
    sound("up");
    setState(reduced ? "open" : "tearing");
  };
  const reseal = () => {
    haptics.tap();
    sound("down");
    setResetKey((k) => k + 1);
    resealed.current = true;
    setState("sealed");
  };
  const onPullStart = (e: PointerEvent<HTMLDivElement>) => {
    if (state !== "sealed" || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pullFrom.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ready: false };
    setPull({ x: 0, y: 0 });
  };
  const onPull = (e: PointerEvent<HTMLDivElement>) => {
    const p = pullFrom.current;
    if (!p || p.id !== e.pointerId) return;
    const next = { x: e.clientX - p.x, y: e.clientY - p.y };
    const ready = Math.hypot(next.x, next.y) >= TEAR_AT;
    // One tick when it's pulled far enough to rip.
    if (ready !== p.ready) {
      p.ready = ready;
      if (ready) haptics.tap();
    }
    setPull(next);
  };
  const onPullEnd = (e: PointerEvent<HTMLDivElement>) => {
    const p = pullFrom.current;
    if (!p || p.id !== e.pointerId) return;
    pullFrom.current = null;
    if (p.ready) {
      opener.current = false;
      haptics.tap();
      sound("up");
      setState(reduced ? "open" : "tearing");
    } else {
      // Let go too early: it snaps back.
      setPull(null);
    }
  };

  useEffect(() => {
    if (state === "sealed") setPull(null);
    if (state !== "sealed" || !resealed.current) return;
    resealed.current = false;
    strip.current?.focus({ preventScroll: true });
  }, [state]);

  // The strip's tear-off animation ends in the open state (reduced motion skips straight there).
  useEffect(() => {
    if (state !== "tearing") return;
    const t = window.setTimeout(() => setState("open"), 650);
    return () => window.clearTimeout(t);
  }, [state]);
  // Once the stickers are reachable, keyboard users land on the first one.
  useEffect(() => {
    if (state !== "open" || !opener.current) return;
    opener.current = false;
    sheet.current?.querySelector<HTMLElement>("button, a, input, [tabindex]")?.focus({ preventScroll: true });
  }, [state]);

  const open = state === "open";
  return (
    <PackContext.Provider value={{ open, resetKey, raise: () => ++top.current }}>
      <div className="pack plop-paper" data-state={state}>
        {state === "open" ? (
          <div className="pack__header pack__header--torn" aria-hidden="true" />
        ) : (
          <>
            {/* The strip you pull. A pointer gesture only; the button below is the way in for clicks and keys. */}
            <div
              className="pack__header pack__tear"
              aria-hidden="true"
              data-pulling={pull && state === "sealed" ? "" : undefined}
              data-ready={progress >= 1 ? "" : undefined}
              // Mostly a peel (it lifts from its left corner), with a little drift toward the pointer.
              style={
                {
                  "--px": `${(pull?.x ?? 0) * 0.22}px`,
                  "--py": `${Math.min(0, pull?.y ?? 0) * 0.22}px`,
                  "--pr": `${-progress * 30}deg`,
                  // The rip shows along the perforation as you pull; the button's tear rips it all at once.
                  clipPath: state === "tearing" ? tornOutline(1) : pull ? tornOutline(progress) : undefined,
                } as CSSProperties
              }
              onPointerDown={onPullStart}
              onPointerMove={onPull}
              onPointerUp={onPullEnd}
              onPointerCancel={onPullEnd}
            >
              <span className="pack__hole" />
              <span className="pack__tear-hint">{progress >= 1 ? "Let go!" : "Pull to tear"}</span>
            </div>
            {/* What stays on the pack as the strip comes away: a ragged edge, showing under the lifted strip. */}
            {(pull || state === "tearing") && <div className="pack__stub" aria-hidden="true" />}
            {state === "sealed" && (
              <button ref={strip} type="button" className="pack__open" onClick={tear}>
                Tear it open
              </button>
            )}
          </>
        )}
        <div className="pack__body">
          {cover}
          {/* Sealed, the stickers are behind the plastic: visible but not reachable. */}
          <div ref={sheet} className="pack__sheet" inert={!open}>
            {children}
          </div>
          <span className="pack__shine" aria-hidden="true" />
        </div>
        {open && (
          <button type="button" className="pack__reseal" onClick={reseal}>
            Put them back
          </button>
        )}
      </div>
    </PackContext.Provider>
  );
}

/** One sticker in the pack. Loose once the pack is open: peels on hover, drags anywhere on the screen. */
export function PackSticker({ tilt, children }: { tilt: number; children: ReactNode }) {
  const { open, resetKey, raise } = useContext(PackContext);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [z, setZ] = useState<number | undefined>(undefined);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; ox: number; oy: number; moved: boolean; min: { x: number; y: number }; max: { x: number; y: number } } | null>(null);
  const el = useRef<HTMLDivElement>(null);

  // Resealing the pack puts every sticker back where it came from.
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setZ(undefined);
  }, [resetKey]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!open || e.button !== 0 || !el.current) return;
    const r = el.current.getBoundingClientRect();
    // Keep at least part of the sticker on screen wherever it's dropped.
    const keep = 40;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
      moved: false,
      min: { x: offset.x - r.right + keep, y: offset.y - r.bottom + keep },
      max: { x: offset.x + (window.innerWidth - r.left) - keep, y: offset.y + (window.innerHeight - r.top) - keep },
    };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_START) return;
      d.moved = true;
      el.current?.setPointerCapture(e.pointerId);
      setDragging(true);
      setZ(raise());
    }
    setOffset({ x: Math.min(d.max.x, Math.max(d.min.x, d.ox + dx)), y: Math.min(d.max.y, Math.max(d.min.y, d.oy + dy)) });
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    setDragging(false);
    // A drag isn't a press: swallow the click it would end with, so the button or switch inside stays put.
    const swallow = (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    el.current?.addEventListener("click", swallow, { capture: true, once: true });
    window.setTimeout(() => el.current?.removeEventListener("click", swallow, { capture: true }), 0);
  };

  return (
    <div
      ref={el}
      className="pack-sticker"
      data-dragging={dragging ? "" : undefined}
      data-moved={offset.x || offset.y ? "" : undefined}
      style={{ "--tilt": `${tilt}deg`, "--dx": `${offset.x}px`, "--dy": `${offset.y}px`, zIndex: z } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </div>
  );
}
