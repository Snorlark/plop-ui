import { Buddy, WordSticker, type BuddyMood, type WordStickerTone } from "@plop-ui/react";
import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./footer.module.css";
import { GITHUB } from "./nav";
import { PassTracker } from "./PlopPass";

const COLUMNS: Array<[string, Array<[string, string]>]> = [
  ["Product", [["Components", "/docs/components/button"], ["Playground", "/playground"], ["Surfaces", "/docs/surfaces"], ["Tokens", "/docs/tokens"]]],
  ["Resources", [["Documentation", "/docs/getting-started"], ["Next.js guide", "/docs/nextjs"], ["Every piece", "/kit"], ["Changelog", `${GITHUB}/releases`]]],
  ["Community", [["GitHub", GITHUB], ["npm", "https://www.npmjs.com/package/@plop-ui/react"], ["Contributing", `${GITHUB}/blob/main/TASKS.md`], ["Roadmap", `${GITHUB}/blob/main/PRD.md`]]],
  ["Legal", [["License", `${GITHUB}/blob/main/LICENSE`], ["Sketchpop font (OFL 1.1)", `${GITHUB}/blob/main/packages/fonts/OFL.txt`], ["Accessibility", "/docs/accessibility"]]],
];

/** The letters that go back on the sheet, each its own sticker. */
const LETTERS: Array<{ ch: string; tone: WordStickerTone; tilt: number }> = [
  { ch: "P", tone: "mustard", tilt: -6 },
  { ch: "l", tone: "bubblegum", tilt: 4 },
  { ch: "o", tone: "mint", tilt: -3 },
  { ch: "p", tone: "periwinkle", tilt: 6 },
  { ch: "U", tone: "tomato", tilt: -4 },
  { ch: "I", tone: "mustard", tilt: 5 },
];

/** The cast pops up behind the letters once they're all back. */
const CAST: Array<{ mood: BuddyMood; at: string }> = [
  { mood: "success", at: "6%" },
  { mood: "preview", at: "25%" },
  { mood: "stale", at: "44%" },
  { mood: "thinking", at: "62%" },
  { mood: "congrats", at: "80%" },
];

function Item({ label, href }: { label: string; href: string }) {
  return href.startsWith("/") ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>;
}

/**
 * The other side of the sheet. Scroll past the last page and you reach the
 * backing paper the stickers came off: as you keep going, the PlopUI letters
 * are stuck back into their die-cut spots one by one, and the cast pops up
 * to say bye. The scene is scroll-driven CSS (compositor only) and simply
 * sits finished when that isn't supported or motion is reduced.
 */
export function SiteFooter() {
  return (
    <footer className={styles.foot}>
      <span className={styles.edge} aria-hidden="true" />

      <div className={styles.scene} aria-hidden="true">
        <p className={styles.line}>That&apos;s the whole pack.</p>
        <div className={styles.sheet}>
          <div className={styles.cast}>
            {CAST.map((c, i) => (
              <span key={c.mood} className={styles.castMember} style={{ left: c.at, "--i": i } as CSSProperties}>
                <Buddy mood={c.mood} size="md" hands />
              </span>
            ))}
          </div>
          <div className={styles.letters}>
            {LETTERS.map((l, i) => (
              <span key={i} className={styles.slot} style={{ "--i": i, "--tilt": `${l.tilt}deg` } as CSSProperties}>
                <span className={styles.ghost}>{l.ch}</span>
                <span className={styles.letter}>
                  <WordSticker tone={l.tone} jitter={0} style={{ fontSize: "var(--letter-size)" }}>
                    {l.ch}
                  </WordSticker>
                </span>
              </span>
            ))}
          </div>
        </div>
        <p className={styles.line2}>Every sticker goes back on the sheet. See you next time.</p>
      </div>

      <div className={styles.inner}>
        <PassTracker />
        <div className={styles.grid}>
          <nav className={styles.cols} aria-label="Footer">
            {COLUMNS.map(([title, links]) => (
              <div key={title} className={styles.col}>
                <h2 className={styles.colTitle}>{title}</h2>
                {links.map(([label, href]) => (
                  <Item key={label} label={label} href={href} />
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.legal}>
          <div className={styles.find}>
            <a href={GITHUB} aria-label="PlopUI on GitHub" className={styles.icon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
              </svg>
            </a>
            <a href="https://www.npmjs.com/package/@plop-ui/react" aria-label="PlopUI on npm" className={styles.icon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h18v7H12v2H8v-2H3z M7 11v4 M12 11v2 M16 11v4 M19 11v4" />
              </svg>
            </a>
          </div>
          <p>
            Copyright 2026 Lark Sigmuond Babao. Made in the Philippines.
            <br />
            Lettering in Sketchpop, a hand-drawn font by Lark Sigmuond Babao, under the SIL Open Font License 1.1.
          </p>
        </div>
      </div>
    </footer>
  );
}
