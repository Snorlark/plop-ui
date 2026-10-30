"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True while `ref` is on screen (within `margin`) and the tab is visible.
 * Looping scenes play only then, so a page nobody is looking at does no work.
 */
export function useInView(ref: RefObject<Element | null>, margin = "200px") {
  const [onScreen, setOnScreen] = useState(false);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOnScreen(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setOnScreen(!!e?.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);

  useEffect(() => {
    const sync = () => setShown(document.visibilityState !== "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return onScreen && shown;
}
