"use client";

import { Button, ButtonLink, IconButton, useHaptics, useReducedMotion } from "@plop-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PauseIcon, PlayIcon } from "./handIcons";
import styles from "./notFound.module.css";

const LINES = ["Uh oh. Wrong page?", "Still drawing this one.", "Jun, lower the 4!", "Ink’s not dry yet.", "Try a button below?", "I’m the 0. Hi!"];

/**
 * The 404, as one screen under the site header: the crew is still building
 * the missing page as giant stickers, and the buddy is the 0. One line of title
 * on top, three ways out underneath. Tap the buddy to chat; the scene pauses
 * (WCAG 2.2.2) and starts paused with reduced motion.
 */
export function NotFound({ scene }: { scene: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const haptics = useHaptics();
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const svg = stage.current?.querySelector("svg");
    if (!svg) return;
    if (reduced) svg.setCurrentTime(2.6);
    setPaused(reduced);
  }, [reduced]);
  useEffect(() => {
    const svg = stage.current?.querySelector("svg");
    if (paused) svg?.pauseAnimations();
    else svg?.unpauseAnimations();
  }, [paused]);

  return (
    <main id="main" className={styles.screen} data-not-found="">
      <span className={styles.pause}>
        <IconButton
          size="sm"
          variant={paused ? "mustard" : "plain"}
          tilt={4}
          burst={false}
          aria-pressed={paused}
          label="Pause the animation"
          icon={paused ? <PlayIcon /> : <PauseIcon />}
          onClick={() => setPaused((p) => !p)}
        />
      </span>
      <h1 className={styles.title}>This page is still on the press.</h1>
      <div ref={stage} className={styles.stage}>
        {scene}
        <button
          type="button"
          className={styles.buddy}
          aria-describedby="nf-say"
          onClick={() => {
            haptics.tap();
            setLine((l) => (l + 1) % LINES.length);
          }}
        >
          <span className={styles.vh}>Ask the buddy what happened</span>
        </button>
        <p key={line} id="nf-say" className={styles.say} aria-live="polite">
          {LINES[line]}
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          variant="plain"
          tilt={-1.5}
          burst={false}
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
        >
          Go back
        </Button>
        <ButtonLink href="/" tilt={1}>
          Back to home
        </ButtonLink>
        <ButtonLink href="/docs/components/button" variant="mustard" tilt={-1}>
          Browse components
        </ButtonLink>
      </div>
    </main>
  );
}
