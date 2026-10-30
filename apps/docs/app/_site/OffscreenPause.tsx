"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Endless, clock-driven loops only: scroll-driven (view()) animations and one-shot entrances are left alone. */
const looping = (el: Element) =>
  el.getAnimations({ subtree: true }).filter((a) => a.timeline === document.timeline && a.effect?.getTiming().iterations === Infinity);

/**
 * Pauses the boil, blink and doodle loops inside every `[data-pausable]` block
 * while it's off screen, and plays them again as it comes back. Off-screen loops
 * kept the browser restyling every frame on a page nobody was looking at.
 */
export function OffscreenPause() {
  const path = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const paused = new Map<Element, Animation[]>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            paused.get(e.target)?.forEach((a) => a.play());
            paused.delete(e.target);
          } else if (!paused.has(e.target)) {
            const loops = looping(e.target).filter((a) => a.playState === "running");
            loops.forEach((a) => a.pause());
            paused.set(e.target, loops);
          }
        }
      },
      { rootMargin: "200px" },
    );
    document.querySelectorAll("[data-pausable]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      paused.forEach((loops) => loops.forEach((a) => a.play()));
    };
  }, [path]);

  return null;
}
