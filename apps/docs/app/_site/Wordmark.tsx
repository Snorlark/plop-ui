import type { CSSProperties } from "react";

/**
 * The PlopUI wordmark, built from Sketchpop letters and the capped buddy (the Button peeker) as the "o",
 * exactly as in the docs website design. Decorative: wrap it in a link with
 * an aria-label, or pass `label` to name it.
 */
export function Wordmark({ size = 40, label }: { size?: number; label?: string }) {
  const k = size / 40;
  const stroke = 6 * k;
  const letter: CSSProperties = {
    fontFamily: "var(--plop-font-logo)",
    fontStyle: "italic",
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1,
    WebkitTextStroke: `${stroke}px var(--plop-paper)`,
    paintOrder: "stroke fill",
    color: "var(--plop-ink)",
    display: "inline-block",
  };
  const ui: CSSProperties = { ...letter, fontSize: size * 0.83 };
  return (
    <span
      className="wordmark"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ filter: `url(#site-logowob) drop-shadow(${1.7 * k}px ${2.3 * k}px 0 rgba(18,36,120,.26))` }}
    >
      <span style={{ ...letter, transform: "rotate(-3deg)" }}>P</span>
      <span style={{ ...letter, marginLeft: -0.7 * k, transform: `translateY(${-1 * k}px) rotate(4deg)` }}>l</span>
      {/* the buddy sits on top of the "p": its cap brim laps over the letter so there is no gap */}
      <span style={{ position: "relative", zIndex: 1, display: "inline-block", margin: `0 ${-6.5 * k}px ${-2.5 * k}px ${-1.5 * k}px`, transform: "rotate(-6deg)" }}>
        <svg width={46 * k} height={37 * k} viewBox="2 4 86 70" style={{ overflow: "visible", flex: "none" }}>
          {/* die-cut paper outline behind the buddy */}
          <g fill="var(--plop-paper)" stroke="var(--plop-paper)" strokeWidth="14" strokeLinejoin="round">
            <path d="M16 48 C 14 28, 28 18, 44 18 C 60 18, 70 30, 68 46 C 66 60, 56 66, 42 66 C 26 66, 17 60, 16 48 Z" />
            <path d="M18 49 C 9 45, 7 59, 18 61" />
            <path d="M16 41 C 15 18, 60 10, 68 36 C 50 32, 32 34, 16 41 Z" />
            <path d="M62 34 C 72 29, 83 31, 83 37 C 77 42, 68 42, 62 40 Z" />
            <circle cx="40" cy="15" r="4" />
          </g>
          <g fill="none" stroke="var(--plop-ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 48 C 14 28, 28 18, 44 18 C 60 18, 70 30, 68 46 C 66 60, 56 66, 42 66 C 26 66, 17 60, 16 48 Z" fill="var(--plop-paper)" />
            <path d="M18 49 C 9 45, 7 59, 18 61" fill="var(--plop-paper)" />
            <path d="M15 52 C 13 54, 14 57, 17 58" strokeWidth="2.6" />
            <path d="M16 41 C 15 18, 60 10, 68 36 C 50 32, 32 34, 16 41 Z" stroke="none" fill="var(--plop-bubblegum)" transform="translate(2.5 2)" />
            <path d="M16 41 C 15 18, 60 10, 68 36 C 50 32, 32 34, 16 41 Z" />
            <path d="M62 34 C 72 29, 83 31, 83 37 C 77 42, 68 42, 62 40 Z" fill="var(--plop-paper)" />
            <circle cx="40" cy="15" r="2.6" stroke="none" fill="var(--plop-ink)" />
          </g>
          <ellipse cx="46" cy="47" rx="2.6" ry="3.8" fill="var(--plop-ink)" />
          <ellipse cx="58" cy="46" rx="2.6" ry="3.8" fill="var(--plop-ink)" />
          <path d="M46 56 C 51 61, 58 60, 62 53" fill="none" stroke="var(--plop-ink)" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </span>
      <span style={{ ...letter, transform: `translateY(${0.7 * k}px) rotate(3deg)` }}>p</span>
      <span style={{ position: "relative", display: "inline-block", marginLeft: 2 * k, transform: `translateY(${-3.3 * k}px) rotate(7deg)` }}>
        <span style={{ ...ui, color: "var(--plop-paper)" }}>UI</span>
        <span style={{ ...ui, position: "absolute", left: 0.8 * k, top: 0.7 * k, color: "var(--plop-mustard)", WebkitTextStroke: 0 }}>UI</span>
        <span style={{ ...ui, position: "absolute", left: 0, top: 0, color: "transparent", WebkitTextStroke: `${1.5 * k}px var(--plop-ink)` }}>UI</span>
      </span>
    </span>
  );
}

/** The SVG filters the site's lettering uses (crayon headings, wobbly logo). */
export function SiteFilters() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }} focusable="false">
      <defs>
        <filter id="site-logowob" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={5} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
