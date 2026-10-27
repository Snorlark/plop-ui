"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import styles from "./Heading.module.css";

export interface HeadingProps {
  /** The heading text. Plain text gets lettered; anything else renders as is. */
  children: ReactNode;
  /** h1–h4. Default 2. */
  level?: 1 | 2 | 3 | 4;
  /** Tomato scribble underline. Default true for h1/h2. */
  scribble?: boolean;
  /** Letters write on when the heading scrolls into view. Default true for h1/h2. */
  writeOn?: boolean;
  /** Id of the heading element, e.g. for anchor links. */
  id?: string;
  /** Extra class on the heading element. */
  className?: string;
}

/**
 * A lettered section heading: crayon-textured Sketchpop Black Italic, seeded
 * per-letter jitter, and a scribble that draws itself underneath once the
 * heading scrolls into view. Renders fully written on the server, so it never
 * hides text without JavaScript.
 */
export function Heading({ children, level = 2, scribble = level <= 2, writeOn = level <= 2, id, className }: HeadingProps) {
  const Tag = `h${level}` as const;
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !writeOn || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, writeOn]);

  return (
    <Tag ref={ref} id={id} className={cx(styles.root, styles[Tag], !armed && styles.still, className)} data-in={seen ? "" : undefined}>
      <Lettering amp={level <= 2 ? 3.4 : 2.2} writeOn={armed}>
        {children}
      </Lettering>
      {scribble && (
        <svg className={styles.scribble} viewBox="0 0 220 16" preserveAspectRatio="none" aria-hidden="true">
          <path d="M3 10 C 40 4, 80 13, 120 8 C 150 5, 185 12, 217 6" pathLength={1} />
        </svg>
      )}
    </Tag>
  );
}
