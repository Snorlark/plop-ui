"use client";

import { seed } from "../seed.js";
import { BURST_COLORS, type BurstStyle } from "./burstStyles.js";

export { BURST_COLORS, BURST_PRESETS, BURST_STYLES, isFailBurst, type BurstStyle } from "./burstStyles.js";

const INK = "var(--plop-ink)";
const PUFF = (c: string) =>
  `<path d="M-7 3 C -11 3, -11 -3, -7 -3 C -7 -8, 0 -9, 1 -5 C 4 -9, 11 -7, 9 -2 C 13 0, 11 6, 6 5 C 4 9, -4 9, -7 3 Z" style="fill:var(--plop-paper);stroke:${c};stroke-width:1.8;stroke-linejoin:round"/>`;
const STAR = (c: string) =>
  `<path d="M0 -11 L3.2 -3.6 L11 -3.2 L5 2 L7 10 L0 5.6 L-7 10 L-5 2 L-11 -3.2 L-3.2 -3.6 Z" style="fill:${c};stroke:${INK};stroke-width:1.6;stroke-linejoin:round"/>`;
const TWINKLE = (c: string) =>
  `<path d="M0 -11 Q1.4 -1.4 11 0 Q1.4 1.4 0 11 Q-1.4 1.4 -11 0 Q-1.4 -1.4 0 -11Z" style="fill:${c};stroke:${INK};stroke-width:1.5;stroke-linejoin:round"/>`;
const HEART = (c: string) =>
  `<path d="M0 9 C -10 2, -11 -5, -6 -8 C -3 -9.5, -0.5 -7.5, 0 -5 C 0.5 -7.5, 3 -9.5, 6 -8 C 11 -5, 10 2, 0 9 Z" style="fill:${c};stroke:${INK};stroke-width:1.6;stroke-linejoin:round"/>`;
const ZIG = (c: string) =>
  `<path d="M-10 -6 L-3 -1 L-6 2 L3 6 L0 9 L10 11" style="fill:none;stroke:${c};stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round"/>`;
const DROP = (c: string) =>
  `<path d="M0 -10 C 3 -4, 7 0, 7 4 C 7 8, 4 10.5, 0 10.5 C -4 10.5, -7 8, -7 4 C -7 0, -3 -4, 0 -10 Z" style="fill:${c};stroke:${INK};stroke-width:1.6;stroke-linejoin:round"/>`;
const CONFETTI: Array<(c: string) => string> = [
  (c) => `<path d="M0 -11 L0 5" style="stroke:${c};stroke-width:4;stroke-linecap:round;fill:none"/>`,
  TWINKLE,
  (c) => `<path d="M-11 0 q2.75 -5 5.5 0 t5.5 0 t5.5 0 t5.5 0" style="stroke:${c};stroke-width:3.6;stroke-linecap:round;fill:none"/>`,
  (c) => `<circle r="4.2" style="fill:${c};stroke:${INK};stroke-width:1.6"/>`,
];

let count = 0;

type Frame = Keyframe & { transform: string };

/** Puts one mark on the layer at the element's center and plays its frames, then removes it. */
function mark(layer: HTMLElement, cx: number, cy: number, svgMarkup: string, frames: Frame[], duration: number, delay = 0) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-13 -13 26 26");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = svgMarkup;
  svg.style.left = `${cx - 17}px`;
  svg.style.top = `${cy - 17}px`;
  // Hidden until its turn, so staggered marks don't flash at the center first.
  svg.style.opacity = "0";
  layer.appendChild(svg);
  if (typeof svg.animate !== "function") {
    svg.remove();
    return;
  }
  svg.animate(frames, { duration, delay, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => svg.remove();
}

/**
 * Throws a handful of ink marks out of an element: the prototype's "ink burst", in seven styles.
 * Purely decorative; the caller decides when (never under reduced motion). Seeded per burst
 * (not Math.random), so tests and screenshots can reproduce it.
 */
export function inkBurst(layer: HTMLElement, from: Element, colors: readonly string[] = BURST_COLORS.all, n = 9, style: BurstStyle = "confetti") {
  const rnd = seed(`plop-${style}-${count++}`);
  const r = from.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const color = (i: number) => colors[i % colors.length] ?? INK;
  /** A point just outside the element's edge, at an angle, pushed out a little further by `extra`. */
  const ring = (ang: number, extra: number) => [Math.cos(ang) * (r.width / 2 + extra), Math.sin(ang) * (r.height / 2 + extra)] as const;

  if (style === "confetti") {
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + rnd() * 0.5;
      const [dx, dy] = ring(ang, 22 + rnd() * 28);
      const rot = (ang * 180) / Math.PI + 90;
      mark(layer, cx, cy, CONFETTI[i % CONFETTI.length]!(color(i)), [
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55}px) rotate(${rot}deg) scale(.3)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot + 10}deg) scale(1.1)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${dx * 1.12}px, ${dy * 1.12}px) rotate(${rot + 16}deg) scale(.9)`, opacity: 0 },
      ], 600);
    }
    return;
  }

  if (style === "stars") {
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + rnd() * 0.4;
      const [dx, dy] = ring(ang, 30 + rnd() * 34);
      const spin = (rnd() > 0.5 ? 1 : -1) * (200 + rnd() * 160);
      const s = 0.9 + rnd() * 0.5;
      mark(layer, cx, cy, STAR(color(i)), [
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) rotate(0deg) scale(.2)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${spin * 0.8}deg) scale(${s})`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dx * 1.1}px, ${dy * 1.1 + 10}px) rotate(${spin}deg) scale(${s * 0.7})`, opacity: 0 },
      ], 760);
    }
    return;
  }

  if (style === "sparkle") {
    for (let i = 0; i < n; i++) {
      const ang = rnd() * Math.PI * 2;
      const [dx, dy] = ring(ang, 8 + rnd() * 26);
      const s = 0.9 + rnd() * 0.7;
      mark(layer, cx, cy, TWINKLE(color(i)), [
        { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(0)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(45deg) scale(${s * 1.25})`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) rotate(90deg) scale(0)`, opacity: 0.9 },
      ], 560, i * 55);
    }
    return;
  }

  if (style === "hearts") {
    for (let i = 0; i < n; i++) {
      const x = (rnd() - 0.5) * r.width * 0.9;
      const rise = r.height / 2 + 40 + rnd() * 40;
      const sway = (rnd() - 0.5) * 30;
      const s = 0.8 + rnd() * 0.5;
      mark(layer, cx, cy, HEART(color(i)), [
        { transform: `translate(${x}px, 0px) scale(.3)`, opacity: 1 },
        { transform: `translate(${x + sway}px, ${-rise * 0.55}px) rotate(${sway / 3}deg) scale(${s})`, opacity: 1, offset: 0.55 },
        { transform: `translate(${x - sway * 0.5}px, ${-rise}px) rotate(${-sway / 4}deg) scale(${s * 0.85})`, opacity: 0 },
      ], 900, i * 70);
    }
    return;
  }

  if (style === "zap") {
    for (let i = 0; i < Math.min(n, 6); i++) {
      const side = i % 2 ? 1 : -1;
      const ang = (side > 0 ? 0 : Math.PI) + (rnd() - 0.5) * 1.3;
      const [dx, dy] = ring(ang, 10 + rnd() * 12);
      const rot = (ang * 180) / Math.PI;
      mark(layer, cx, cy, ZIG(color(i)), [
        { transform: `translate(${dx * 0.85}px, ${dy * 0.85}px) rotate(${rot}deg) scale(.4)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1.15)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx * 1.04}px, ${dy * 1.04}px) rotate(${rot + 6}deg) scale(1)`, opacity: 0.2, offset: 0.55 },
        { transform: `translate(${dx * 1.06}px, ${dy * 1.06}px) rotate(${rot + 6}deg) scale(1)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${dx * 1.1}px, ${dy * 1.1}px) rotate(${rot + 10}deg) scale(.9)`, opacity: 0 },
      ], 520, i * 40);
    }
    return;
  }

  if (style === "drops") {
    for (let i = 0; i < Math.min(n, 5); i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (r.width / 2 - 4 + rnd() * 14);
      const y0 = -r.height / 2 + rnd() * 6;
      const fall = r.height * 0.6 + 26 + rnd() * 20;
      const s = 0.55 + rnd() * 0.35;
      mark(layer, cx, cy, DROP(color(i)), [
        { transform: `translate(${x}px, ${y0}px) scale(.2)`, opacity: 1 },
        { transform: `translate(${x + side * 6}px, ${y0 - 6}px) scale(${s})`, opacity: 1, offset: 0.3 },
        { transform: `translate(${x + side * 12}px, ${y0 + fall}px) scale(${s * 0.9})`, opacity: 0 },
      ], 720, i * 60);
    }
    return;
  }

  // poof: dust puffs that pop out of the sides and sink.
  for (let i = 0; i < Math.min(n, 6); i++) {
    const side = i % 2 ? 1 : -1;
    const dx = side * (r.width / 2 + 6 + rnd() * 18);
    const dy = (rnd() - 0.3) * r.height * 0.8;
    const s0 = 0.5 + rnd() * 0.3;
    mark(layer, cx, cy, PUFF(color(i)), [
      { transform: `translate(${dx * 0.6}px, ${dy}px) scale(${s0})`, opacity: 0.9 },
      { transform: `translate(${dx}px, ${dy + 4}px) scale(${s0 + 0.35})`, opacity: 0.8, offset: 0.45 },
      { transform: `translate(${dx * 1.08}px, ${dy + 22}px) scale(${s0 + 0.15})`, opacity: 0 },
    ], 650);
  }
}
