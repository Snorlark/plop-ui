"use client";

import { Buddy, Button, toast, useReducedMotion } from "@plop-ui/react";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import styles from "./footer.module.css";
import { CARD_SIZE, getPass, getServerPass, newCard, stamp, STAMP_LABEL, subscribe, type Stamp } from "./pass";

const TILTS = [-12, 8, -5, 11, -8];
const fmt = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** The limited-edition foil sticker you get for a full card. */
export function HoloPip({ size = 120 }: { size?: number }) {
  return (
    <span className={styles.holo} style={{ width: size, height: size }} aria-hidden="true">
      <Buddy mood="congrats" size={size >= 110 ? "lg" : "md"} />
    </span>
  );
}

/** One face per reason, so a full card is a little crowd. Drawn as a one-color rubber stamp. */
const FACES: Record<Stamp["reason"], ReactNode> = {
  // a curl of hair, a big smile
  visit: <path d="M30 13 C 27 9, 31 6, 34 8" />,
  // a cap with a brim
  github: <path d="M19 22 C 20 14, 38 12, 41 21 C 34 19, 26 19, 19 22 Z M40 20 C 45 18, 49 19, 48 22 C 45 23, 42 23, 40 22" />,
  // a bobble beanie
  install: <path d="M19 23 C 19 15, 41 15, 41 23 M30 13 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" />,
  // a party hat
  board: <path d="M24 19 L 30 6 L 36 19 M30 6 m-2 -1 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0" />,
  // round glasses
  lettering: <path d="M21 31 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0 M39 31 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0 M25.5 31 L 34.5 31" />,
};

function StampMark({ s, fresh, tilt }: { s: Stamp; fresh: boolean; tilt: number }) {
  return (
    <span className={styles.stamp} data-fresh={fresh ? "" : undefined} style={{ "--sr": `${tilt}deg` } as CSSProperties}>
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <defs>
          <path id={`arc-${s.at}`} d="M12 36 A 18 18 0 0 0 48 36" />
        </defs>
        <g fill="none" stroke="var(--plop-ink)" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="30" cy="30" r="27" strokeWidth="3.4" />
          <circle cx="30" cy="30" r="23" strokeWidth="1.4" />
          {/* the face */}
          <path d="M30 14 C 39 14, 44 20, 44 28 C 44 36, 38 41, 30 41 C 22 41, 16 36, 16 28 C 16 20, 21 14, 30 14 Z" strokeWidth="2.4" />
          <g strokeWidth="2.2">{FACES[s.reason]}</g>
          <path d="M25 31 C 27 34.5, 33 34.5, 35 31" strokeWidth="2.2" />
        </g>
        <circle cx="25" cy="26" r="1.7" fill="var(--plop-ink)" />
        <circle cx="35" cy="26" r="1.7" fill="var(--plop-ink)" />
        <ellipse cx="21" cy="31.5" rx="2.4" ry="1.4" fill="var(--plop-bubblegum)" />
        <ellipse cx="39" cy="31.5" rx="2.4" ry="1.4" fill="var(--plop-bubblegum)" />
        <text className={styles.stampDate}>
          <textPath href={`#arc-${s.at}`} startOffset="50%" textAnchor="middle">
            {fmt(s.at).toUpperCase()}
          </textPath>
        </text>
      </svg>
    </span>
  );
}

/**
 * Your Plop Pass, in the footer: five stamps for visiting, opening the repo,
 * installing and making something. Fill it and the Holo Pip is yours.
 */
export function PlopPass({ className }: { className?: string }) {
  const pass = useSyncExternalStore(subscribe, getPass, getServerPass);
  const [fresh, setFresh] = useState(-1);

  // Thunk the newest stamp onto the card.
  useEffect(() => {
    const on = (e: Event) => setFresh((e as CustomEvent<{ count: number }>).detail.count - 1);
    window.addEventListener("plop:stamp", on);
    return () => window.removeEventListener("plop:stamp", on);
  }, []);

  const n = pass.stamps.length;

  return (
    <section className={`${styles.pass}${className ? ` ${className}` : ""}`} aria-labelledby="pass-h">
      <div className={styles.passHead}>
        <h2 id="pass-h" className={styles.passTitle}>
          Plop Pass
        </h2>
        <span className={styles.passCount}>
          {n} of {CARD_SIZE}
        </span>
      </div>
      <p className={styles.passText}>Earn a stamp for a visit, opening the GitHub repo, copying the install command, sticking something on the playground board and lettering something. Fill the card for a foil sticker only regulars get.</p>
      <ol className={styles.slots} aria-label={`${n} of ${CARD_SIZE} stamps`}>
        {Array.from({ length: CARD_SIZE }, (_, i) => {
          const s = pass.stamps[i];
          return (
            <li key={i} className={styles.slot} data-last={i === CARD_SIZE - 1 ? "" : undefined}>
              <span className={styles.ring}>
                {s ? <StampMark s={s} fresh={fresh === i} tilt={TILTS[i]!} /> : i === CARD_SIZE - 1 ? <svg className={styles.prize} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 L 14.5 9 L 21 9.5 L 16 13.5 L 17.8 20 L 12 16.5 L 6.2 20 L 8 13.5 L 3 9.5 L 9.5 9 Z" /></svg> : null}
              </span>
              <small>{s ? STAMP_LABEL[s.reason] : i === CARD_SIZE - 1 ? "Holo" : `Stamp ${i + 1}`}</small>
              <span className="vh">{s ? `Stamped: ${STAMP_LABEL[s.reason]}, ${fmt(s.at)}` : "Empty"}</span>
            </li>
          );
        })}
      </ol>
      <div className={styles.passFoot}>
        {pass.holo ? (
          <>
            <HoloPip size={64} />
            <span>Holo Pip is yours. Find it in the playground tray.</span>
            {n >= CARD_SIZE && (
              <Button size="sm" variant="plain" onClick={newCard}>
                New card
              </Button>
            )}
          </>
        ) : (
          <span>{n === 0 ? "Your first stamp lands a moment after you arrive." : `${CARD_SIZE - n} to go.`}</span>
        )}
      </div>

    </section>
  );
}

/**
 * Hands out Plop Pass stamps on every page (visits and GitHub clicks), says so
 * with a toast, and shows the coupon when a card fills up. Renders nothing
 * else; the card itself lives on the home page.
 */
export function PassTracker() {
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);

  // A visit counts once a day; opening the GitHub repo counts once a card.
  useEffect(() => {
    const t = window.setTimeout(() => stamp("visit"), 1200);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='github.com']");
      if (a) stamp("github");
    };
    document.addEventListener("click", onClick, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // React to every new stamp: a thunk on the card, a toast, and the coupon on the fifth.
  useEffect(() => {
    const on = (e: Event) => {
      const { count } = (e as CustomEvent<{ count: number }>).detail;
      if (count >= CARD_SIZE) {
        window.setTimeout(() => dialog.current?.showModal?.(), reduced ? 0 : 700);
      } else {
        toast.success(`Stamped! ${count} of ${CARD_SIZE} on your Plop Pass`, { buddy: true });
      }
    };
    window.addEventListener("plop:stamp", on);
    return () => window.removeEventListener("plop:stamp", on);
  }, [reduced]);

  return (
    <dialog ref={dialog} className={styles.coupon} aria-labelledby="coupon-h">
        <span className={styles.couponTape}>Five stamps!</span>
        <h2 id="coupon-h" className={styles.couponTitle}>
          You&apos;re a regular.
        </h2>
        <p>Here&apos;s Holo Pip, a foil sticker only regulars get. It&apos;s in your playground tray now, for good.</p>
        <HoloPip size={150} />
        <form method="dialog" className={styles.couponActions}>
          <Button type="submit" variant="ink">
            Nice!
          </Button>
        </form>
    </dialog>
  );
}
