import type { CSSProperties } from "react";

/**
 * The PlopUI wordmark, built from Sketchpop letters and the smiley "o",
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
      <span style={{ display: "inline-block", margin: `0 ${1.7 * k}px ${-1.3 * k}px ${0.3 * k}px`, transform: "rotate(-6deg)" }}>
        <svg width={31 * k} height={34 * k} viewBox="0 0 86 94" style={{ overflow: "visible", flex: "none" }}>
          <g transform="skewX(-9) translate(8 0)">
            <path d="M43 24 C 64 23, 78 38, 77 57 C 76 77, 62 89, 42 88 C 22 87, 9 74, 10 55 C 11 36, 24 25, 43 24 Z" fill="var(--plop-paper)" stroke="var(--plop-paper)" strokeWidth="30" strokeLinejoin="round" />
            <path d="M41 25 C 38 15, 44 9, 51 11 C 56 13, 55 19, 50 19" fill="none" stroke="var(--plop-paper)" strokeWidth="24" strokeLinecap="round" />
            <path d="M43 24 C 64 23, 78 38, 77 57 C 76 77, 62 89, 42 88 C 22 87, 9 74, 10 55 C 11 36, 24 25, 43 24 Z" fill="var(--plop-paper)" stroke="var(--plop-ink)" strokeWidth="13" strokeLinejoin="round" />
            <path d="M41 25 C 38 15, 44 9, 51 11 C 56 13, 55 19, 50 19" fill="none" stroke="var(--plop-ink)" strokeWidth="8" strokeLinecap="round" />
            <ellipse cx="24" cy="60" rx="6.5" ry="4.2" fill="var(--plop-bubblegum)" />
            <ellipse cx="62" cy="58" rx="6.5" ry="4.2" fill="var(--plop-bubblegum)" />
            <ellipse cx="33" cy="47" rx="4.6" ry="6.2" fill="var(--plop-ink)" />
            <ellipse cx="53" cy="45.5" rx="4.6" ry="6.2" fill="var(--plop-ink)" />
            <path d="M36 58 C 40 64, 49 64, 53 57" fill="none" stroke="var(--plop-ink)" strokeWidth="5.2" strokeLinecap="round" />
          </g>
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
