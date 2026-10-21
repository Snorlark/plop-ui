/** Small hand-drawn doodles for the home page (decorative). */
const ink = "var(--plop-ink)";

export function Scribble({ color = "var(--plop-tomato)" }: { color?: string }) {
  return (
    <svg className="home-scribble" viewBox="0 0 220 16" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 10 C 40 4, 80 13, 120 8 C 150 5, 185 12, 217 6" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Star() {
  return (
    <svg width="54" height="54" viewBox="0 0 60 60" aria-hidden="true">
      <path d="M30 6 L 37 22 L 55 24 L 41 36 L 46 54 L 30 44 L 14 54 L 19 36 L 5 24 L 23 22 Z" fill="var(--plop-tomato)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Heart() {
  return (
    <svg width="46" height="42" viewBox="0 0 50 46" aria-hidden="true">
      <path d="M25 42 C 10 32, 3 23, 4 14 C 5 6, 13 3, 19 6 C 22 8, 24 10, 25 13 C 26 10, 28 8, 31 6 C 37 3, 45 6, 46 14 C 47 23, 40 32, 25 42 Z" fill="var(--plop-bubblegum)" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
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

export const STEP_ICONS = {
  plus: <path d="M12 4 C 11.6 9, 12.4 15, 12 20 M4 12.4 C 9 11.6, 15 12.4, 20 12" />,
  paper: <path d="M5 5 L 19 5 L 19 19 L 5 19 Z M8 9 L 16 9 M8 12.5 L 16 12.5 M8 16 L 13 16" />,
  peel: <path d="M6 18 L 18 6 M10 6 L 18 6 L 18 14" />,
  press: <path d="M12 4 L 12 16 M7 11 L 12 16 L 17 11 M5 20 L 19 20" />,
  ship: <path d="M5 12.5 C 7 14, 8.5 16, 9.5 18.5 C 12 12, 15 8, 19.5 5" />,
};

export function StepIcon({ d, light = false }: { d: keyof typeof STEP_ICONS; light?: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={light ? "var(--plop-on-ink)" : ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {STEP_ICONS[d]}
    </svg>
  );
}

/** The dashed path the "How it works" steps sit on. */
export function StepsPath() {
  return (
    <svg className="home-steps__path" viewBox="0 0 1000 140" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 50 C 80 40, 120 20, 190 30 C 280 45, 300 90, 400 95 C 480 98, 520 110, 590 100 C 680 85, 700 50, 800 40 C 880 32, 940 30, 1000 30" fill="none" stroke="var(--plop-ink)" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

/** A tiny static timeline for paper "pieces" (decorative; the real one is <StatusTimeline>). */
export function MiniTimeline({ link = 34 }: { link?: number }) {
  return (
    <span className="mini-tl" aria-hidden="true" style={{ ["--link" as string]: `${link}px` }}>
      <i className="done" />
      <b />
      <i className="done" />
      <b />
      <i className="now" />
      <b className="todo" />
      <i className="todo" />
    </span>
  );
}

/** A sticker of lettering: cream outline, mustard fill, ink line. */
export function WordSticker({ children, fill = "var(--plop-mustard)", size = 34 }: { children: string; fill?: string; size?: number }) {
  return (
    <span className="word-sticker" style={{ fontSize: size, ["--fill" as string]: fill }}>
      <span className="word-sticker__base">{children}</span>
      <span className="word-sticker__fill" aria-hidden="true">
        {children}
      </span>
      <span className="word-sticker__line" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
