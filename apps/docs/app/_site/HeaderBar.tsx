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

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const height = bar.current?.offsetHeight ?? 0;
      const menuOpen = document.documentElement.hasAttribute("data-menu-open");
      setScrolled(y > 4);
      if (y < height || menuOpen || y < last - 4) setHidden(false);
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
