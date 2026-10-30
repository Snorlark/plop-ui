"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The header's bar: solid paper, stuck to the top. It slides away while you
 * scroll down and comes back the moment you scroll up (or tab into it). It
 * publishes its visible height as --header-offset, so sticky sidebars and
 * anchor jumps sit just below it.
 */
export function HeaderBar({ children }: { children: ReactNode }) {
  const bar = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Measured by a ResizeObserver, so the scroll handler never forces a layout to read it.
  const height = useRef(0);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    height.current = el.offsetHeight;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      height.current = el.offsetHeight;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const h = height.current;
      const menuOpen = document.documentElement.hasAttribute("data-menu-open");
      setScrolled(y > 4);
      if (y < h || menuOpen || y < last - 4) setHidden(false);
      else if (y > last + 4) setHidden(true);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.style.setProperty("--header-offset", hidden ? "0px" : `${bar.current?.offsetHeight ?? 0}px`);
    // Its full height, hidden or not: for layouts that must not jump as the header slides away.
    html.style.setProperty("--header-height", `${bar.current?.offsetHeight ?? 0}px`);
  }, [hidden]);

  return (
    <header ref={bar} className="site-header" data-hidden={hidden ? "" : undefined} data-scrolled={scrolled ? "" : undefined} onFocus={() => setHidden(false)}>
      {children}
    </header>
  );
}
