"use client";

import { useEffect, useRef, useState } from "react";

const cache = new Map<string, Promise<string>>();
const load = (src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(src).then((r) => (r.ok ? r.text() : "")).catch(() => ""));
  return cache.get(src)!;
};

/**
 * A big decorative SVG scene whose drawing is fetched, not inlined. Inlined from a Server Component, a
 * scene goes out twice (in the HTML and in the RSC payload) on every page; this sends an empty svg and
 * fills it once it's about to scroll into view, in idle time, or straight away with `eager` (#67). Decorative: aria-hidden.
 */
export function LazyScene({ src, viewBox, preserveAspectRatio, eager = false, className }: { src: string; viewBox: string; preserveAspectRatio?: string; eager?: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    let alive = true;
    // Parsing a big scene is one long task: do it when the browser is idle, not in the middle of loading.
    const idle = (fn: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 1));
    const go = () => void load(src).then((m) => alive && idle(() => alive && setMarkup(m)));
    if (eager || typeof IntersectionObserver === "undefined") {
      go();
      return () => void (alive = false);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        go();
      },
      { rootMargin: "200px 0px" },
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [src, eager]);

  return (
    <svg
      ref={ref}
      className={className}
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      width="100%"
      height="100%"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
