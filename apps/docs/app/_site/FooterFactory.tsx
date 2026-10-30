"use client";

import { IconButton, Tooltip, useReducedMotion } from "@plop-ui/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./footer.module.css";
import { marker, PauseIcon, PlayIcon } from "./handIcons";
import { useInView } from "./useInView";

function LeverIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path {...marker} d="M4 20.5 C 8 20, 12 20.8, 15.5 20.2 M8.5 20 C 10.5 15.5, 12.5 11, 15 7" />
      <path {...marker} fill="currentColor" d="M15.2 3.4 C 17.4 2.9, 19.2 4.6, 18.6 6.6 C 18 8.4, 15.4 8.8, 14.3 7.2 C 13.3 5.8, 13.9 3.8, 15.2 3.4 Z" />
    </svg>
  );
}

/** What the lever throws into the pack, in turn. */
const KINDS = [
  { text: "Send", bg: "var(--plop-ink)", fg: "var(--plop-on-ink)" },
  { text: "Wild idea", bg: "var(--plop-tomato)", fg: "var(--plop-on-ink)" },
  { text: "Squish!", bg: "var(--plop-mustard)", fg: "var(--plop-ink-text)" },
  { text: "Shipped", bg: "var(--plop-mint)", fg: "var(--plop-ink-text)" },
  { text: "Peel me", bg: "var(--plop-bubblegum)", fg: "var(--plop-ink-text)" },
];

/**
 * The live part of the footer's sticker factory: the lever plops an extra
 * sticker into the pack, and the pause button stops the scene (WCAG 2.2.2,
 * since it moves for more than five seconds). With reduced motion the scene
 * starts paused on a nice frame. The scene itself arrives as `children`, so
 * its SVG stays server-rendered and out of the client bundle.
 */
export function FooterFactory({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [count, setCount] = useState(0);
  const [drops, setDrops] = useState<number[]>([]);

  useEffect(() => {
    const svg = scene.current?.querySelector("svg");
    if (!svg) return;
    if (reduced) svg.setCurrentTime(1.4);
    setPaused(reduced);
  }, [reduced]);

  // Plays only while on screen and the tab is visible; the pause button still wins.
  const live = useInView(scene);
  useEffect(() => {
    const svg = scene.current?.querySelector("svg");
    if (paused || !live) svg?.pauseAnimations();
    else svg?.unpauseAnimations();
  }, [paused, live]);

  const plop = () => {
        setCount((c) => c + 1);
    if (!reduced) setDrops((d) => [...d, count]);
  };

  return (
    <div ref={scene} className={styles.scene}>
      {children}
      <div className={styles.controls}>
        <Tooltip content="Plop a sticker" side="bottom">
          <IconButton variant="tomato" tilt={-5} burst={false} label="Pull the lever: plop a sticker into the pack" icon={<LeverIcon />} onClick={plop} />
        </Tooltip>
        <Tooltip content={paused ? "Start the factory" : "Pause the factory"} side="bottom">
          <IconButton
            variant={paused ? "mustard" : "plain"}
            tilt={4}
            burst={false}
            aria-pressed={paused}
            label="Pause the factory"
            icon={paused ? <PlayIcon /> : <PauseIcon />}
            onClick={() => setPaused((p) => !p)}
          />
        </Tooltip>
      </div>
      {drops.map((id) => {
        const k = KINDS[id % KINDS.length]!;
        return (
          <span key={id} aria-hidden="true">
            <span className={styles.dropSticker} style={{ background: k.bg, color: k.fg } as CSSProperties}>
              {k.text}
            </span>
            <span className={styles.dropWord} onAnimationEnd={() => setDrops((d) => d.filter((x) => x !== id))}>
              Plop!
            </span>
          </span>
        );
      })}
      <p className={styles.srOnly} aria-live="polite">
        {count === 0 ? "" : count === 1 ? "1 sticker plopped into the pack." : `${count} stickers plopped into the pack.`}
      </p>
    </div>
  );
}
