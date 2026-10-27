import type { CSSProperties, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { hashString, seed } from "../seed.js";
import styles from "./Lettering.module.css";

export interface LetteringProps {
  /** The text to letter. Anything that isn't a string or number renders untouched. */
  children: ReactNode;
  /** How wobbly: roughly the max tilt in degrees. Default 2. */
  amp?: number;
  /** Letters start hidden and write on when `data-in` is set on this element (see Heading). */
  writeOn?: boolean;
  /** Extra class on the wrapper span. Not applied when `children` isn't a string or number. */
  className?: string;
}

/**
 * Splits text into letters with a seeded tilt, lift and size each, so a
 * label looks hand-lettered. The jitter comes from the text itself, so it is
 * the same on every render and on the server. Screen readers get the plain
 * text once; the letters are hidden from them.
 */
export function Lettering({ children, amp = 2, writeOn = false, className }: LetteringProps) {
  if (typeof children !== "string" && typeof children !== "number") return <>{children}</>;
  const text = String(children);
  const rnd = seed(hashString(text) + 7);
  let i = 0;
  const words = text.split(/(\s+)/);

  return (
    <span className={cx(styles.root, writeOn && styles.writeOn, className)}>
      <span aria-hidden="true">
        {words.map((word, w) =>
          /^\s+$/.test(word) ? (
            " "
          ) : word ? (
            <span className={styles.word} key={w}>
              {[...word].map((ch, c) => {
                const style = {
                  "--rz": `${((rnd() - 0.5) * amp * 2.2).toFixed(2)}deg`,
                  "--ty": `${((rnd() - 0.5) * amp * 1.1).toFixed(2)}px`,
                  "--sc": (1 + (rnd() - 0.5) * 0.08).toFixed(3),
                  "--i": i++,
                } as CSSProperties;
                return (
                  <span className={styles.letter} style={style} key={c}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ) : null,
        )}
      </span>
      <span className={styles.vh}>{text.trim().replace(/\s+/g, " ")}</span>
    </span>
  );
}
