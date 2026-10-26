/** Small hand-drawn doodles for the home page (decorative). */
import { Tag, type TagTone } from "@plop-ui/react";
import type { ReactNode } from "react";

const ink = "var(--plop-ink)";

export function Scribble({ color = "var(--plop-tomato)" }: { color?: string }) {
  return (
    <svg className="home-scribble" viewBox="0 0 220 16" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 10 C 40 4, 80 13, 120 8 C 150 5, 185 12, 217 6" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Hand() {
  return (
    <svg width="44" height="54" viewBox="0 0 44 54" aria-hidden="true">
      <path d="M12 52 C 6 40, 4 30, 6 22 C 7 18, 12 18, 13 22 L 14 26 L 14 8 C 14 4, 19 4, 19 8 L 19 22 L 20 6 C 20 2, 25 2, 25 6 L 25 22 L 26 9 C 26 5, 31 5, 31 9 L 31 24 L 32 15 C 32 11, 37 11, 37 15 L 37 32 C 37 42, 32 48, 30 52 Z" fill="var(--plop-paper)" stroke={ink} strokeWidth="2.8" strokeLinejoin="round" />
    </svg>
  );
}

/** A section's label, on a strip of washi tape (a real Tag) instead of a handwritten line. */
export function Tape({ children, tone = "tomato", tilt = -3 }: { children: ReactNode; tone?: TagTone; tilt?: number }) {
  return (
    <span className="home-tape">
      <Tag tone={tone} tilt={tilt}>
        {children}
      </Tag>
    </span>
  );
}
