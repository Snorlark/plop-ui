"use client";

import { Button, toast, useReducedMotion } from "@plop-ui/react";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { CopyCommand } from "./CopyCommand";
import { Tape } from "./Doodles";
import styles from "./PaperStack.module.css";

const OUTLINE = "M22 30 C 22 22, 28 18, 38 18 L 124 17 C 134 17, 140 22, 140 30 L 141 62 C 141 71, 135 76, 125 76 L 37 77 C 27 77, 21 72, 21 63 Z";
const INK = "var(--plop-ink)";

/** Crayon hatching for shadows, drawn in the art's own SVG. */
function Hatch({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke={INK} strokeWidth="2.2" />
      </pattern>
    </defs>
  );
}

interface Sheet {
  title: string;
  text: string;
  paper: "poster" | "notebook" | "kraft" | "mint" | "riso";
  art: ReactNode;
}

const SHEETS: Sheet[] = [
  {
    title: "Drawn by hand",
    text: "Every piece starts as one cobalt marker line, with a little wobble left in on purpose.",
    paper: "poster",
    art: (
      <svg viewBox="0 0 170 110" aria-hidden="true">
        <Hatch id="h1" />
        <path d={OUTLINE} transform="translate(6 7)" fill="url(#h1)" className={styles.fadeIn} />
        <path d={OUTLINE} className={`${styles.ink} ${styles.draw}`} fill="var(--plop-paper)" pathLength={1} />
        <path d="M44 47 C 60 43, 84 50, 118 45" className={`${styles.ink} ${styles.scribble}`} pathLength={1} />
        <g className={styles.pencil}>
          <g transform="rotate(-40)">
            <path d="M0 -5 L 34 -5 L 34 5 L 0 5 Z" fill="var(--plop-mustard)" className={styles.ink} />
            <path d="M34 -5 L 40 -5 L 40 5 L 34 5 Z" fill="var(--plop-bubblegum)" className={styles.ink} />
            <path d="M0 -5 L -10 0 L 0 5 Z" fill="var(--plop-paper)" className={styles.ink} />
            <path d="M-6 -2 L -10 0 L -6 2 Z" fill={INK} />
          </g>
        </g>
      </svg>
    ),
  },
  {
    title: "Cut like a sticker",
    text: "A paper border and a soft offset shadow, like a die-cut sheet you could peel.",
    paper: "notebook",
    art: (
      <svg viewBox="0 0 170 110" aria-hidden="true">
        <Hatch id="h2" />
        <path d={OUTLINE} transform="translate(6 7)" fill="url(#h2)" />
        <path d={OUTLINE} fill="var(--plop-mint)" className={styles.ink} />
        <text x="81" y="52" textAnchor="middle" className={styles.label}>
          SEND
        </text>
        <path className={styles.die} d="M13 30 C 13 15, 24 9, 38 9 L 124 8 C 141 8, 149 18, 149 30 L 150 62 C 150 79, 140 85, 125 85 L 37 86 C 21 86, 12 78, 12 63 Z" />
        <g className={styles.scissors}>
          <g className={styles.snip}>
            <circle cx="-7" cy="-6" r="5" fill="var(--plop-paper)" className={styles.ink} />
            <circle cx="-7" cy="6" r="5" fill="var(--plop-paper)" className={styles.ink} />
            <path d="M-3 -4 L 14 3 M-3 4 L 14 -3" className={styles.ink} />
          </g>
        </g>
      </svg>
    ),
  },
  {
    title: "Real HTML underneath",
    text: "Peel one back and there's a native element: keyboard, focus and screen readers already work.",
    paper: "kraft",
    art: (
      <svg viewBox="0 0 170 110" aria-hidden="true">
        <Hatch id="h3" />
        <path d={OUTLINE} fill="var(--plop-paper)" className={styles.ink} strokeDasharray="4 5" />
        <text x="81" y="53" textAnchor="middle" className={styles.code}>
          &lt;button&gt;
        </text>
        <g className={styles.peel}>
          <path d={OUTLINE} transform="translate(5 6)" fill="url(#h3)" />
          <path d={OUTLINE} fill="var(--plop-tomato)" className={styles.ink} />
          <text x="81" y="52" textAnchor="middle" className={styles.labelLight}>
            PEEL ME
          </text>
          {/* the curled-back corner */}
          <path d="M124 76 C 132 70, 138 70, 141 62 C 136 64, 131 66, 124 76 Z" fill="var(--plop-bubblegum)" className={styles.ink} />
        </g>
      </svg>
    ),
  },
  {
    title: "Press it",
    text: "It squishes into the paper, springs back and buzzes on a phone. Go on, it's a real Button.",
    paper: "mint",
    art: (
      <div className={styles.press}>
        <div className={styles.pressBtn}>
          <Button variant="ink" buddy seed="stack-press" onClick={() => toast.success("Squish! That's PlopUI.", { buddy: "congrats" })}>
            Press me
          </Button>
        </div>
        <svg className={styles.hand} viewBox="0 0 44 54" aria-hidden="true">
          <path
            d="M12 52 C 6 40, 4 30, 6 22 C 7 18, 12 18, 13 22 L 14 26 L 14 8 C 14 4, 19 4, 19 8 L 19 22 L 20 6 C 20 2, 25 2, 25 6 L 25 22 L 26 9 C 26 5, 31 5, 31 9 L 31 24 L 32 15 C 32 11, 37 11, 37 15 L 37 32 C 37 42, 32 48, 30 52 Z"
            fill="var(--plop-paper)"
            className={styles.ink}
          />
        </svg>
      </div>
    ),
  },
  {
    title: "Ship it",
    text: "Install it, put a PlopProvider at the root, and your pages render on the server with Next.js.",
    paper: "riso",
    art: (
      <div className={styles.ship}>
        <svg className={styles.planeSvg} viewBox="0 0 170 70" aria-hidden="true">
          <path className={styles.trail} d="M6 60 C 40 62, 50 30, 80 34 C 108 38, 116 14, 150 12" />
          <g className={styles.plane}>
            <path d="M0 0 L 26 -10 L 8 6 Z" fill="var(--plop-paper)" className={styles.ink} />
            <path d="M8 6 L 12 14 L 14 3 Z" fill="var(--plop-periwinkle)" className={styles.ink} />
          </g>
        </svg>
        <CopyCommand />
      </div>
    ),
  },
];

/** How each sheet sits in the pile before it's tossed: a small offset and turn, so the stack looks handled. */
const PILE: Array<[number, number, number]> = [
  [0, 0, -1.5],
  [10, 8, 2],
  [-8, 14, -3],
  [12, 20, 3.5],
  [-4, 26, -2],
];
/** Where a tossed sheet flies off to (x in vw, rotation). Alternates sides. */
const TOSS: Array<[number, number]> = [
  [-70, -24],
  [70, 22],
  [-66, -18],
  [68, 26],
];

/**
 * How a PlopUI piece is made: a pile of paper sheets. As you scroll, the top
 * sheet is tossed off and the next one is on top, with its little drawing
 * playing in the kit's wobbly marker style. One sticky stage, one passive
 * scroll listener, only transforms change. Under reduced motion it's a plain
 * list of sheets.
 */
export function PaperStack() {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = stage.current;
    if (!el || reduced) return;
    const sheets = [...el.querySelectorAll<HTMLElement>("[data-sheet]")];
    const last = sheets.length - 1;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const scrolled = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      // 0..last: how many sheets have been tossed off the pile.
      const p = scrolled * (last + 0.3);
      const top = Math.min(last, Math.floor(p + 0.0001));
      sheets.forEach((s, i) => {
        const leave = i < last ? Math.min(1, Math.max(0, (p - i) * 1.15)) : 0;
        const depth = Math.max(0, i - p);
        s.style.setProperty("--leave", (leave * leave).toFixed(3));
        s.style.setProperty("--depth", depth.toFixed(3));
        s.toggleAttribute("data-active", i === top && leave < 0.5);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <section className={styles.root} aria-labelledby="stack-h" data-static={reduced ? "" : undefined}>
      <div ref={stage} className={styles.track} style={{ "--n": SHEETS.length } as CSSProperties}>
        <div className={styles.stage}>
          <div className={styles.head}>
            <Tape tone="periwinkle" tilt={2}>
              How it works
            </Tape>
            <h2 id="stack-h" className={styles.title}>
              Drawn by hand.
              <br />
              <span>Shipped as code.</span>
            </h2>
          </div>
          <ol className={styles.stack}>
            {SHEETS.map((s, i) => (
              <li
                key={s.title}
                className={styles.sheet}
                data-sheet
                data-paper={s.paper}
                data-active={i === 0 ? "" : undefined}
                style={
                  {
                    zIndex: SHEETS.length - i,
                    "--px": `${PILE[i]![0]}px`,
                    "--py": `${PILE[i]![1]}px`,
                    "--pr": `${PILE[i]![2]}deg`,
                    "--tx": `${(TOSS[i] ?? [0, 0])[0]}vw`,
                    "--tr": `${(TOSS[i] ?? [0, 0])[1]}deg`,
                  } as CSSProperties
                }
              >
                <span className={styles.tape} aria-hidden="true" />
                <div className={styles.copy}>
                  <span className={styles.num} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <div className={styles.art}>{s.art}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
