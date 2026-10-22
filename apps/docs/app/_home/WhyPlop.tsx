import { BuddyPeek, WordSticker, type BuddyMood, type WordStickerTone } from "@plop-ui/react";
import type { CSSProperties } from "react";
import styles from "./WhyPlop.module.css";

interface Reason {
  big: string;
  tone: WordStickerTone;
  title: string;
  text: string;
  mood: BuddyMood;
  paper: "poster" | "mint" | "kraft" | "notebook" | "riso" | "periwinkle";
}

/** Six reasons, each a sticker with its own character. Every claim is something the kit does today. */
const REASONS: Reason[] = [
  {
    big: "AA",
    tone: "mint",
    title: "Readable on every color",
    text: "Each fill comes with the text color that passes WCAG AA on it, and onColor() picks one for colors you bring.",
    mood: "preview",
    paper: "poster",
  },
  {
    big: "Tab",
    tone: "mustard",
    title: "Real elements underneath",
    text: "Buttons are buttons, switches are switches. Keyboard, focus and screen readers work before the drawing does.",
    mood: "success",
    paper: "mint",
  },
  {
    big: "SSR",
    tone: "periwinkle",
    title: "Server first",
    text: "Static pieces are Server Components, and every wobble comes from a seed, so the server and the browser draw the same thing.",
    mood: "thinking",
    paper: "kraft",
  },
  {
    big: "Squish!",
    tone: "bubblegum",
    title: "Every press answers",
    text: "Press a sticker and it squishes, springs back, and buzzes on a phone. Cancel shakes its head instead of throwing confetti.",
    mood: "congrats",
    paper: "notebook",
  },
  {
    big: "5",
    tone: "tomato",
    title: "Papers, not themes",
    text: "Poster, cutting mat, notebook, kraft and riso, light and dark. Colors, type and motion all come from tokens.",
    mood: "stale",
    paper: "riso",
  },
  {
    big: "Calm",
    tone: "ink",
    title: "Kind on rough days",
    text: "Turn on reduced motion and every animation in the kit stops. State changes still show, just instantly.",
    mood: "error",
    paper: "periwinkle",
  },
];

/**
 * "Why PlopUI": six sticker cards that slap down onto the page one after
 * another as the section scrolls into view (CSS scroll-driven; without
 * support they simply sit in place).
 */
export function WhyPlop() {
  return (
    <section id="why" className={styles.root} aria-labelledby="why-h">
      <div className={styles.head}>
        <span className={styles.kicker}>Why PlopUI</span>
        <h2 id="why-h" className={styles.title}>
          Fun to look at.
          <br />
          <span>Serious underneath.</span>
        </h2>
        <p className={styles.lede}>A sticker on the outside, a careful component on the inside. Here&apos;s what you get with every piece.</p>
      </div>
      <ul className={styles.grid}>
        {REASONS.map((r, i) => (
          <li key={r.title} className={styles.cell} style={{ "--i": i, "--tilt": `${[-2.2, 1.6, -1, 2.4, -1.8, 1.2][i]}deg` } as CSSProperties}>
            <BuddyPeek mood={r.mood} side={i % 2 ? "end" : "start"} className={styles.peek}>
              <article className={styles.card} data-paper={r.paper}>
                <span className={styles.big} aria-hidden="true">
                  <WordSticker tone={r.tone} size={r.big.length > 3 ? 40 : 54} tilt={i % 2 ? 4 : -5} jitter={2.5}>
                    {r.big}
                  </WordSticker>
                </span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </article>
            </BuddyPeek>
          </li>
        ))}
      </ul>
    </section>
  );
}
