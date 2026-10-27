/** A box on the board, in % of the board's width and height, by its center. */
export interface Spot {
  x: number;
  y: number;
  w: number;
  h: number;
}

const overlap = (a: Spot, b: Spot) => {
  const w = Math.max(0, Math.min(a.x + a.w / 2, b.x + b.w / 2) - Math.max(a.x - a.w / 2, b.x - b.w / 2));
  const h = Math.max(0, Math.min(a.y + a.h / 2, b.y + b.h / 2) - Math.max(a.y - a.h / 2, b.y - b.h / 2));
  return (w * h) / Math.min(a.w * a.h, b.w * b.h);
};

/**
 * Where a new sticker of size `w`×`h` goes: out from the middle along a golden-angle spiral, at the first
 * point that covers no sticker by more than 20%, or the least covered point if the board is full.
 */
export function placeNew(taken: Spot[], w: number, h: number): { x: number; y: number } {
  let best = { x: 50, y: 50, cover: Infinity };
  for (let i = 0; i < 120; i++) {
    const r = Math.min(48, i * 2.2);
    const a = i * 2.39996;
    const x = Math.min(100 - w / 2, Math.max(w / 2, 50 + r * Math.cos(a)));
    const y = Math.min(100 - h / 2, Math.max(h / 2, 50 + r * Math.sin(a)));
    const cover = Math.max(0, ...taken.map((t) => overlap(t, { x, y, w, h })));
    if (cover <= 0.2) return { x, y };
    if (cover < best.cover) best = { x, y, cover };
  }
  return { x: best.x, y: best.y };
}
