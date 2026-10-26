import type { CSSProperties, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Buddy.module.css";

export type BuddyMood = "success" | "error" | "stale" | "congrats" | "preview" | "thinking";
export type BuddySize = "sm" | "md" | "lg";

/** Who's who: each character stands for one state, so people learn to read them at a glance. */
export const BUDDY_CAST: Record<BuddyMood, { name: string; purpose: string }> = {
  success: { name: "Pip", purpose: "Cheers when something worked: saved, sent, copied." },
  error: { name: "Bix", purpose: "Winces when something failed and needs another try." },
  stale: { name: "Snooze", purpose: "Dozes off when data is out of date or still waiting." },
  congrats: { name: "Confetti", purpose: "Throws a little party for milestones: shift done, all clear." },
  preview: { name: "Specs", purpose: "Peeks at previews, drafts and things worth a look." },
  thinking: { name: "Hum", purpose: "Mulls it over while something loads or works." },
};

const ink = { stroke: "var(--plop-ink)" };
const inkFill = { fill: "var(--plop-ink)" };
const paperFill = { fill: "var(--plop-paper)" };
const line = { fill: "none", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round", style: ink } as const;

const FACE = "M16 48 C 14 28, 28 18, 44 18 C 60 18, 70 30, 68 46 C 66 60, 56 66, 42 66 C 26 66, 17 60, 16 48 Z";
const EAR_L = "M18 49 C 9 45, 7 59, 18 61";
const EAR_R = "M66 49 C 75 45, 77 59, 66 61";

function Head({ ears = "both", children }: { ears?: "left" | "both"; children: ReactNode }) {
  return (
    <g strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={ink}>
      <path d={EAR_L} style={paperFill} />
      {ears === "both" && <path d={EAR_R} style={paperFill} />}
      <path d={FACE} style={paperFill} />
      {children}
    </g>
  );
}

function Cheeks({ l = [32, 56], r = [56, 56] }: { l?: [number, number]; r?: [number, number] }) {
  return (
    <g style={{ fill: "var(--plop-bubblegum)" }} stroke="none">
      <ellipse cx={l[0]} cy={l[1]} rx="4.2" ry="2.6" />
      <ellipse cx={r[0]} cy={r[1]} rx="4.2" ry="2.6" />
    </g>
  );
}

/** Each mood's character: headwear, face and a little prop. Drawn in a 84×68 box, peeking up from the bottom edge. */
const ART: Record<BuddyMood, ReactNode> = {
  // Pip: the cap buddy from Button, grinning.
  success: (
    <>
      <Head ears="left">
        <path d="M15 52 C 13 54, 14 57, 17 58" fill="none" strokeWidth="2.2" />
        <path d="M16 41 C 15 18, 60 10, 68 36 C 50 32, 32 34, 16 41 Z" stroke="none" transform="translate(2.5 2)" style={{ fill: "var(--plop-bubblegum)" }} />
        <path d="M16 41 C 15 18, 60 10, 68 36 C 50 32, 32 34, 16 41 Z" fill="none" />
        <path d="M62 34 C 72 29, 83 31, 83 37 C 77 42, 68 42, 62 40 Z" style={paperFill} />
        <circle cx="40" cy="15" r="2.4" stroke="none" style={inkFill} />
      </Head>
      <Cheeks l={[40, 55]} r={[64, 53]} />
      <path {...line} d="M42 48 C 44 43, 48 43, 50 48 M55 47 C 57 42, 61 42, 63 47" />
      <path {...line} d="M45 53 C 47 62, 59 62, 62 52 Z" style={{ ...ink, fill: "var(--plop-tomato)" }} />
      <path className={styles.sparkle} d="M77 13 L 79 18 L 84 20 L 79 22 L 77 27 L 75 22 L 70 20 L 75 18 Z" strokeWidth="2" strokeLinejoin="round" style={{ ...ink, fill: "var(--plop-mustard)" }} />
    </>
  ),
  // Bix: beanie, worried brows, wobbly mouth, a sweat drop.
  error: (
    <>
      <Head>
        <path d="M17 40 C 16 22, 30 14, 42 14 C 56 14, 68 22, 67 40 C 50 35, 34 35, 17 40 Z" style={{ fill: "var(--plop-mint)" }} />
        <path d="M17 40 C 34 35, 50 35, 67 40 C 67.4 42, 67.4 44, 67 46 C 50 41, 34 41, 17 46 C 16.6 44, 16.6 42, 17 40 Z" style={paperFill} />
        <path d="M30 22 C 29.6 27, 29.4 32, 29.6 36 M42 17 C 42.2 23, 42 29, 42 35 M54 22 C 54.6 27, 54.8 32, 54.6 36" fill="none" strokeWidth="1.8" />
        <circle cx="42" cy="10" r="5" style={{ fill: "var(--plop-mint)" }} />
      </Head>
      <circle cx="34" cy="53" r="2.4" style={inkFill} />
      <circle cx="50" cy="53" r="2.4" style={inkFill} />
      <path {...line} d="M28 48 C 31 47.4, 34 46.4, 37 44.6 M47 44.6 C 50 46.4, 53 47.4, 56 48" />
      <path {...line} d="M35 61 C 37 59, 39 59, 41 61 C 43 63, 45 63, 47 61 C 48 60, 49 60, 50 61" />
      <path className={styles.drop} d="M63 42 C 61 46, 60 49, 62 51 C 64 52.4, 66.4 50.6, 65.4 47.4 C 65 45.8, 64.2 44, 63 42 Z" strokeWidth="2" style={{ ...ink, fill: "var(--plop-periwinkle)" }} />
    </>
  ),
  // Snooze: floppy nightcap, eyes shut, a yawn and drifting z's.
  stale: (
    <>
      <Head>
        <path d="M16 42 C 16 24, 30 15, 46 17 C 60 18, 72 13, 79 5 C 81 15, 74 28, 68 40 C 52 35, 34 35, 16 42 Z" style={{ fill: "var(--plop-periwinkle)" }} />
        <path d="M16 42 C 34 35, 52 35, 68 40" fill="none" strokeWidth="2.4" />
        <circle cx="80" cy="5" r="4.6" style={paperFill} />
      </Head>
      <Cheeks l={[30, 58]} r={[56, 58]} />
      <path {...line} d="M28 53 C 30.6 55.4, 34.4 55.4, 37 53 M47 53 C 49.6 55.4, 53.4 55.4, 56 53" />
      <ellipse cx="42" cy="61" rx="2.6" ry="3" style={inkFill} />
      <g className={styles.zs} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={ink}>
        <path d="M70 44 L 75 44 L 70 49 L 75 49" />
        <path d="M76 31 L 82 31 L 76 37 L 82 37" />
      </g>
    </>
  ),
  // Confetti: party hat, eyes squeezed happy, mouth wide open, confetti flying.
  congrats: (
    <>
      <Head>
        <path d="M27 31 C 32 22, 37 12, 42 3 C 47 12, 52 22, 57 31 C 47 34, 37 34, 27 31 Z" style={{ fill: "var(--plop-mustard)" }} />
        <path d="M31 24 C 38 26, 46 26, 53 24 M35 16 C 39.4 17.4, 44.6 17.4, 49 16" fill="none" strokeWidth="2.4" style={{ stroke: "var(--plop-tomato)" }} />
        <circle cx="42" cy="3.5" r="4" style={{ fill: "var(--plop-tomato)" }} />
      </Head>
      <Cheeks l={[30, 56]} r={[54, 56]} />
      <path {...line} d="M30 49 C 32 45, 36 45, 38 49 M46 49 C 48 45, 52 45, 54 49" />
      <path {...line} d="M35 55 C 36.6 64, 47.4 64, 49 55 Z" style={{ ...ink, fill: "var(--plop-tomato)" }} />
      <g className={styles.confetti} strokeWidth="1.8" strokeLinejoin="round" style={ink}>
        <path d="M9 18 L 14 16 L 15.4 19.6 L 10.4 21.6 Z" style={{ fill: "var(--plop-mint)" }} />
        <path d="M70 12 L 75 13.6 L 74 17.4 L 69 15.8 Z" style={{ fill: "var(--plop-tomato)" }} />
        <path d="M74 30 L 78 27.4 L 80 30.6 L 76 33.2 Z" style={{ fill: "var(--plop-periwinkle)" }} />
        <circle cx="10" cy="36" r="2.6" style={{ fill: "var(--plop-mustard)" }} />
        <circle cx="64" cy="4" r="2.2" style={{ fill: "var(--plop-bubblegum)" }} />
      </g>
    </>
  ),
  // Specs: hair in a bun, round glasses, one eyebrow up, a curious "o".
  preview: (
    <>
      <Head>
        <path d="M16 42 C 15 24, 28 16, 42 16 C 56 16, 69 24, 68 42 C 60 34, 50 30, 42 31 C 33 31, 23 35, 16 42 Z" style={inkFill} />
        <circle cx="42" cy="11" r="7" style={inkFill} />
      </Head>
      <g fill="none" strokeWidth="2.4" style={ink}>
        <circle cx="34" cy="50" r="7" style={paperFill} />
        <circle cx="51" cy="50" r="7" style={paperFill} />
        <path d="M41 49 C 42 48, 43 48, 44 49 M27 49 L 18 47 M58 49 L 66 47" strokeLinecap="round" />
      </g>
      <circle cx="35.6" cy="50" r="2.2" style={inkFill} />
      <circle cx="52.6" cy="50" r="2.2" style={inkFill} />
      <path {...line} d="M46 39 C 49 36.6, 53.4 36.4, 57 38.4" />
      <ellipse cx="43" cy="60" rx="2.4" ry="2.8" style={inkFill} />
    </>
  ),
  // Hum: a curl of hair, eyes up and to the side, a flat thinking mouth, thought bubbles.
  thinking: (
    <>
      <Head>
        <path d="M17 40 C 16 26, 28 18, 42 18 C 56 18, 68 26, 67 40 C 60 34, 52 32, 46 34 C 42 29, 35 29, 31 34 C 26 34, 21 36, 17 40 Z" style={{ fill: "var(--plop-tomato)" }} />
        <path d="M41 18 C 38 10, 45 6, 49 10" fill="none" strokeWidth="2.6" />
      </Head>
      <Cheeks l={[30, 58]} r={[56, 58]} />
      <circle cx="37" cy="47" r="2.4" style={inkFill} />
      <circle cx="53" cy="47" r="2.4" style={inkFill} />
      <path {...line} d="M37 60 C 41 59, 45 60.4, 50 58" />
      <g className={styles.thought} strokeWidth="2" style={{ ...ink, ...paperFill }}>
        <circle cx="68" cy="28" r="2.2" />
        <circle cx="74" cy="19" r="3.2" />
        <circle cx="80" cy="8" r="4.4" />
      </g>
    </>
  ),
};

/** Just a character's head drawing (84×68), for components that frame it themselves, like Button's buddy. */
export function BuddyArt({ mood }: { mood: BuddyMood }) {
  return (
    <svg className={styles.head} viewBox="0 0 84 68" aria-hidden="true" focusable="false">
      {ART[mood]}
    </svg>
  );
}

function Hands() {
  return (
    <svg className={styles.hands} viewBox="0 0 84 22" aria-hidden="true" focusable="false">
      <g strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ ...ink, ...paperFill }}>
        <path d="M14 14 C 13 5, 27 4, 28 13 C 28 18, 15 19, 14 14 Z" />
        <path d="M56 13 C 56 4, 70 5, 70 14 C 69 19, 56 18, 56 13 Z" />
      </g>
      <g fill="none" strokeWidth="1.8" strokeLinecap="round" style={ink}>
        <path d="M19 12 L 19 16 M23 12 L 23 16 M61 12 L 61 16 M65 12 L 65 16" />
      </g>
    </svg>
  );
}

export interface BuddyProps {
  /** Which character, and so which state it stands for. */
  mood: BuddyMood;
  /** `sm` 56px, `md` 84px, `lg` 120px wide. Default `md`. */
  size?: BuddySize;
  /**
   * What the character is telling people, e.g. "Report sent". When set, it is
   * announced as an image; leave it out when the words are already next to it
   * (the character is then decorative).
   */
  label?: string;
  /** Show two hands gripping the bottom edge (for peeking over things). Default false. */
  hands?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * A PlopUI character that stands for a state: Pip cheers success, Bix winces
 * at errors, Snooze dozes on stale data, Confetti celebrates, Specs previews
 * and Hum thinks while loading. Pair it with words; it never carries the
 * message alone.
 */
export function Buddy({ mood, size = "md", label, hands = false, className, style }: BuddyProps) {
  return (
    <span
      className={cx(styles.root, styles[size], styles[mood], className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-mood={mood}
      style={style}
    >
      <BuddyArt mood={mood} />
      {hands && <Hands />}
    </span>
  );
}

export interface BuddyPeekProps {
  mood: BuddyMood;
  /** The thing the character peeks over: a toast, a card, a callout, a button. */
  children: ReactNode;
  /** Which end of the top edge it peeks from. Default `start`. */
  side?: "start" | "end";
  size?: BuddySize;
  /** Read out with the content, e.g. "Report sent". Usually leave it out: the content already says it. */
  label?: string;
  className?: string;
}

/**
 * Sits a character on the top edge of anything, hands gripping the edge,
 * like the buddy on a Button. The head ducks behind the content; the hands
 * hold on in front. It pops up once when it appears (not under reduced motion).
 */
export function BuddyPeek({ mood, children, side = "start", size = "sm", label, className }: BuddyPeekProps) {
  return (
    <span className={cx(styles.peek, styles[`peek-${size}`], side === "end" && styles.peekEnd, className)} data-mood={mood}>
      <Buddy mood={mood} size={size} label={label} className={styles.peekHead} />
      <span className={styles.peekBody}>{children}</span>
      <span className={styles.peekHands} aria-hidden="true">
        <Hands />
      </span>
    </span>
  );
}
