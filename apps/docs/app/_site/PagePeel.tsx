"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type PeelTransition = { ready: Promise<void>; finished: Promise<void> };
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => PeelTransition;
};

/**
 * Page changes peel the old page off like a sticker: the bottom-right corner
 * lifts, folds back over the page and the sheet comes away toward the
 * top-left, showing the new page underneath (CSS in site.css,
 * `html[data-peel]`). The flap (paper, ink edge, hatched shadow) and the
 * crease are the live layer rendered here; its animations wait, paused, for
 * the transition's first frame so they move with the mask. Clicks
 * on same-site links are caught in the capture phase, before Next's <Link>
 * handler, and the router push runs inside a view transition. No view
 * transitions or reduced motion: links behave exactly as before.
 */
export function PagePeel() {
  const router = useRouter();
  const path = usePathname();
  const arrived = useRef<(() => void) | null>(null);

  // The new route has rendered: let the transition take its "after" snapshot.
  useEffect(() => {
    arrived.current?.();
    arrived.current = null;
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href);
      // Same page (hash links, the current route) and files (llms.txt, images) keep the browser's own behavior.
      if (url.origin !== location.origin || url.pathname === location.pathname || /\.\w+$/.test(url.pathname)) return;
      e.preventDefault();
      const html = document.documentElement;
      const href = url.pathname + url.search + url.hash;
      html.setAttribute("data-peel", "");
      const done = () => {
        html.removeAttribute("data-peel");
        html.removeAttribute("data-peel-run");
      };
      try {
        const vt = doc.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              arrived.current = resolve;
              // A slow route must never hold the page frozen: take the snapshot after 1.5s regardless.
              window.setTimeout(resolve, 1500);
              router.push(href);
            }),
        );
        vt.ready.then(() => html.setAttribute("data-peel-run", ""), done);
        vt.finished.finally(done);
      } catch {
        // WebKit can refuse to start a transition: navigate without the peel.
        done();
        router.push(href);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div className="page-peel-fx" aria-hidden="true">
      <div className="page-peel-fx__edge" />
      <div className="page-peel-fx__fold">
        <div className="page-peel-fx__unfold">
          <div className="page-peel-fx__flap">
            <div className="page-peel-fx__hatch" />
            <div className="page-peel-fx__paper" />
            {/* the flap's two free edges (the page's bottom and right edges, folded over), drawn by hand in ink */}
            <svg className="page-peel-fx__ink" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <path
                d="M1000 1.6 C 760 3.4, 520 0.2, 300 2.4 S 60 0.8, 1.4 1.6 C 3.2 240, 0.4 520, 2.6 760 S 0.8 960, 1.6 1000"
                fill="none"
                stroke="var(--plop-ink)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
