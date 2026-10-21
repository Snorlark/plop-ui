"use client";

import { seed } from "../seed.js";

/** Spot colors a burst can be printed in (CSS colors or token variables). */
export const BURST_COLORS = {
  all: ["var(--plop-ink)", "var(--plop-mustard)", "var(--plop-bubblegum)", "var(--plop-tomato)", "var(--plop-periwinkle)", "var(--plop-mint)"],
  ink: ["var(--plop-ink)", "var(--plop-mustard)", "var(--plop-mint)"],
  periwinkle: ["var(--plop-periwinkle)", "var(--plop-ink)", "var(--plop-mustard)"],
  mint: ["var(--plop-mint)", "var(--plop-mustard)", "var(--plop-ink)"],
  tomato: ["var(--plop-tomato)", "var(--plop-bubblegum)"],
  mustard: ["var(--plop-mustard)", "var(--plop-tomato)", "var(--plop-ink)"],
  plain: ["var(--plop-ink)", "var(--plop-mustard)", "var(--plop-bubblegum)", "var(--plop-mint)"],
} as const;

const INK = "var(--plop-ink)";
const SHAPES: Array<(c: string) => string> = [
  (c) => `<path d="M0 -11 L0 5" style="stroke:${c};stroke-width:4;stroke-linecap:round;fill:none"/>`,
  (c) => `<path d="M0 -11 Q1.8 -1.8 11 0 Q1.8 1.8 0 11 Q-1.8 1.8 -11 0 Q-1.8 -1.8 0 -11Z" style="fill:${c};stroke:${INK};stroke-width:1.8;stroke-linejoin:round"/>`,
  (c) => `<path d="M-11 0 q2.75 -5 5.5 0 t5.5 0 t5.5 0 t5.5 0" style="stroke:${c};stroke-width:3.6;stroke-linecap:round;fill:none"/>`,
  (c) => `<circle r="4.2" style="fill:${c};stroke:${INK};stroke-width:1.6"/>`,
];

let count = 0;

/**
 * Throws a handful of ink marks (strokes, sparkles, squiggles, dots) out of
 * an element: the prototype's "ink burst". Purely decorative; the caller
 * decides when (never under reduced motion).
 */
export function inkBurst(layer: HTMLElement, from: Element, colors: readonly string[] = BURST_COLORS.all, n = 9) {
  // Seeded per burst (not Math.random), so tests and screenshots can reproduce it.
  const rnd = seed(`plop-burst-${count++}`);
  const r = from.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + rnd() * 0.5;
    const dx = Math.cos(ang) * (r.width / 2 + 22 + rnd() * 30);
    const dy = Math.sin(ang) * (r.height / 2 + 22 + rnd() * 26);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "-13 -13 26 26");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = (SHAPES[i % SHAPES.length] as (c: string) => string)(colors[i % colors.length] ?? INK);
    svg.style.left = `${cx - 17}px`;
    svg.style.top = `${cy - 17}px`;
    layer.appendChild(svg);
    const rot = (ang * 180) / Math.PI + 90;
    if (typeof svg.animate !== "function") {
      svg.remove();
      continue;
    }
    svg.animate(
      [
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55}px) rotate(${rot}deg) scale(.3)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot + 10}deg) scale(1.1)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${dx * 1.12}px, ${dy * 1.12}px) rotate(${rot + 16}deg) scale(.9)`, opacity: 0 },
      ],
      { duration: 600, easing: "cubic-bezier(.2,.8,.3,1)" },
    ).onfinish = () => svg.remove();
  }
}
