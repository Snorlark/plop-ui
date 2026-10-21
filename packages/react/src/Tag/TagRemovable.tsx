"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useHaptics } from "../hooks/useHaptics.js";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { CloseIcon } from "../icons.js";
import { Lettering } from "../Lettering/Lettering.js";
import { styles, tagClassName, textOf } from "./styles.js";
import type { TagProps } from "./types.js";

const PEEL_MS = 380;

/** The tag after this one (or before it, if it was last) that can take focus once this one is gone. */
function nextFocusTarget(tag: HTMLElement): HTMLElement | null {
  const button = (el: Element | null) => el?.querySelector<HTMLElement>("[data-plop-tag-remove]") ?? null;
  for (let el = tag.nextElementSibling; el; el = el.nextElementSibling) {
    const b = button(el);
    if (b) return b;
  }
  for (let el = tag.previousElementSibling; el; el = el.previousElementSibling) {
    const b = button(el);
    if (b) return b;
  }
  return null;
}

export function TagRemovable({ children, onRemove, removeLabel, tilt = 0, id, ...rest }: TagProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [removing, setRemoving] = useState(false);
  const done = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const haptics = useHaptics();
  const reduced = useReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    const target = ref.current ? nextFocusTarget(ref.current) : null;
    onRemove?.();
    target?.focus();
  };

  const remove = () => {
    if (removing) return;
    haptics.tap();
    if (reduced) {
      finish();
      return;
    }
    setRemoving(true);
    // animationend is the normal path; the timer covers environments that never fire it.
    timer.current = window.setTimeout(finish, PEEL_MS + 60);
  };

  const label = removeLabel ?? `Remove ${textOf(children)}`.trim();

  return (
    <span
      ref={ref}
      id={id}
      className={tagClassName(rest)}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      data-plop-tag=""
      data-removing={removing ? "" : undefined}
      onAnimationEnd={finish}
    >
      <Lettering amp={1.6}>{children}</Lettering>
      <button type="button" className={styles.remove} aria-label={label} data-plop-tag-remove="" onClick={remove}>
        <CloseIcon />
      </button>
    </span>
  );
}
