"use client";

import { Buddy, BuddyPeek, Button, ButtonLink, CloseIcon, useReducedMotion } from "@plop-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { GITHUB } from "./nav";
import { getPass, getServerPass, resetPass, stamp, stampCount, STEPS, subscribe, type Step } from "./pass";
import styles from "./ridealong.module.css";

interface Stop {
  name: string;
  title: string;
  text: string;
  href: string;
  go: string;
}

/** The five stops, in the order a newcomer should take them. */
const STOPS: Record<Step, Stop> = {
  what: { name: "What is PlopUI", title: "What is PlopUI?", text: "Hand-drawn UI, imperfect on purpose. See why it's built this way.", href: "/#why", go: "Read why" },
  install: { name: "Install", title: "Install it", text: "One command, then wrap your app in PlopProvider.", href: "/docs/getting-started", go: "Get set up" },
  components: { name: "Components", title: "Meet the components", text: "Buttons, tags, cards, timelines: every piece with live examples.", href: "/docs/components/button", go: "Browse them" },
  playground: { name: "Playground", title: "Play with it", text: "Stick components on a board, letter a word, copy the code.", href: "/playground", go: "Open it" },
  github: { name: "GitHub", title: "Find it on GitHub", text: "Read the source, open an issue, or give it a star.", href: GITHUB, go: "Open the repo" },
};

const TILTS: Record<Step, number> = { what: -12, install: 9, components: -5, playground: 11, github: -8 };
/** Remembers that the "Not sure where to start?" bubble was seen, so it only shows until the pass is opened once. */
const HINT_KEY = "plop-ride-along-hint";
const hintSeen = () => {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
};
const markHintSeen = () => {
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    // Storage blocked: the bubble may show again next visit, which is fine.
  }
};

const fmt = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** The limited-edition foil sticker you get for a full pass. */
export function HoloPip({ size = 120 }: { size?: number }) {
  return (
    <span className={styles.holo} style={{ width: size, height: size }} aria-hidden="true">
      <Buddy mood="congrats" size={size >= 110 ? "lg" : "md"} />
    </span>
  );
}

/** One hat per stop, so a full pass is a little crowd. */
const HATS: Record<Step, ReactNode> = {
  // a curl of hair
  what: <path d="M30 13 C 27 9, 31 6, 34 8" />,
  // a bobble beanie
  install: <path d="M19 23 C 19 15, 41 15, 41 23 M30 13 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" />,
  // round glasses
  components: <path d="M21 31 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0 M39 31 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0 M25.5 31 L 34.5 31" />,
  // a party hat
  playground: <path d="M24 19 L 30 6 L 36 19 M30 6 m-2 -1 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0" />,
  // a cap with a brim
  github: <path d="M19 22 C 20 14, 38 12, 41 21 C 34 19, 26 19, 19 22 Z M40 20 C 45 18, 49 19, 48 22 C 45 23, 42 23, 40 22" />,
};

/** A rubber stamp: double ring, a face, the stop's hat and the date, in the stop's own ink. */
function StampFace({ step, at }: { step: Step; at?: number }) {
  const arc = `${useId()}-arc`;
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <defs>
        <path id={arc} d="M12 36 A 18 18 0 0 0 48 36" />
      </defs>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="30" cy="30" r="27" strokeWidth="3.4" />
        <circle cx="30" cy="30" r="23" strokeWidth="1.4" />
        <path d="M30 14 C 39 14, 44 20, 44 28 C 44 36, 38 41, 30 41 C 22 41, 16 36, 16 28 C 16 20, 21 14, 30 14 Z" strokeWidth="2.4" />
        <g strokeWidth="2.2">{HATS[step]}</g>
        <path d="M25 31 C 27 34.5, 33 34.5, 35 31" strokeWidth="2.2" />
      </g>
      <circle cx="25" cy="26" r="1.7" fill="currentColor" />
      <circle cx="35" cy="26" r="1.7" fill="currentColor" />
      <ellipse cx="21" cy="31.5" rx="2.4" ry="1.4" fill="var(--plop-bubblegum)" />
      <ellipse cx="39" cy="31.5" rx="2.4" ry="1.4" fill="var(--plop-bubblegum)" />
      {at ? (
        <text className={styles.date}>
          <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
            {fmt(at).toUpperCase()}
          </textPath>
        </text>
      ) : null}
    </svg>
  );
}

/** A link to a stop: Next.js Link inside the site, a plain link out to GitHub. */
function StopLink({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode; "aria-label"?: string; onClick?: () => void }) {
  return href.startsWith("/") ? (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

/**
 * Hands out stamps as people reach each stop, wherever they are on the site:
 * the "Why PlopUI" section on the home page, the install guide (or copying
 * the install command, see CopyCommand and Search), any component page or
 * the playground, and any link out to the GitHub repo.
 */
function useStampTracker() {
  const path = usePathname();

  useEffect(() => {
    if (path.startsWith("/docs/getting-started")) stamp("install");
    else if (path.startsWith("/docs/components/")) stamp("components");
    else if (path.startsWith("/playground")) stamp("playground");
    if (path !== "/") return;
    const why = document.getElementById("why");
    if (!why || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        stamp("what");
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(why);
    return () => io.disconnect();
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("a[href*='github.com']")) stamp("github");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}

/** The ticket stub in the corner: mustard while there's a tour to take, quiet paper once it's done. */
function Stub({ done, n, next }: { done: boolean; n: number; next?: Step }) {
  return (
    <span className={styles.fabStub} aria-hidden="true">
      <span className={styles.fabFace}>
        <StampFace step={next ?? "github"} />
      </span>
      <span className={styles.fabLabel}>{done ? "Ride-along" : "New here?"}</span>
      <span className={styles.fabCount}>
        {n}/{STEPS.length}
        {done ? " ✓" : ""}
      </span>
    </span>
  );
}

/**
 * "New here?": a ticket stub floating in the bottom-right corner of every
 * page. It opens the Ride-along pass, a five-stop tour of Plop UI (what it
 * is, install, components, playground, GitHub) that gets a rubber stamp at
 * each stop. A full pass unlocks Holo Pip.
 */
export function RideAlong() {
  const pass = useSyncExternalStore(subscribe, getPass, getServerPass);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const [fresh, setFresh] = useState<Step | null>(null);
  const [bump, setBump] = useState(false);
  const [hint, setHint] = useState(false);
  const fab = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reward = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const panelId = useId();

  useStampTracker();

  const n = stampCount(pass);
  const done = n === STEPS.length;
  const next = STEPS.find((s) => !pass.stamps[s]);

  // First visits: a speech bubble beside the stub asks if they're not sure where to start.
  useEffect(() => {
    if (done || hintSeen()) return;
    const t = window.setTimeout(() => setHint(true), reduced ? 0 : 1800);
    return () => window.clearTimeout(t);
  }, [done, reduced]);
  const dismissHint = () => {
    setHint(false);
    markHintSeen();
  };

  // Every new stamp: thunk it onto the pass and wiggle the stub (no toast: stamps land quietly), and hand over Holo Pip on the fifth.
  useEffect(() => {
    const on = (e: Event) => {
      const { step, count } = (e as CustomEvent<{ step: Step; count: number }>).detail;
      setFresh(step);
      setBump(true);
      if (count >= STEPS.length) window.setTimeout(() => reward.current?.showModal?.(), reduced ? 0 : 700);
    };
    window.addEventListener("plop:stamp", on);
    return () => window.removeEventListener("plop:stamp", on);
  }, [reduced]);

  // Open: focus moves into the pass. Escape or a click outside closes it.
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      fab.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !fab.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  // The Playground needs every corner of the screen for the board; stamps still count there.
  if (path === "/playground" && !open) return null;

  return (
    <>
      {open && (
        <div ref={panel} id={panelId} className={styles.panel} role="dialog" aria-labelledby={titleId} tabIndex={-1}>
          <div className={styles.lift}>
            <div className={styles.pass}>
              <div className={styles.band}>
                <h2 id={titleId} className={styles.title}>
                  Ride-along pass
                </h2>
                <span className={styles.seat} aria-hidden="true">
                  Plop UI · Seat 1A
                </span>
                <button type="button" className={styles.close} onClick={() => { setOpen(false); fab.current?.focus(); }} aria-label="Close the Ride-along pass">
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.body}>
                <p className={styles.intro}>New here? Five stops. Get a stamp at each one.</p>
                <ol className={styles.route}>
                  {STEPS.map((step, i) => {
                    const at = pass.stamps[step];
                    return (
                      <li key={step}>
                        <StopLink href={STOPS[step].href} className={styles.stop} onClick={close} aria-label={`${i + 1}. ${STOPS[step].title}${at ? `, stamped ${fmt(at)}` : ""}`}>
                          <span className={styles.slot} data-done={at ? "" : undefined} data-next={step === next ? "" : undefined}>
                            {at ? (
                              <span className={styles.stamp} data-step={step} data-fresh={fresh === step ? "" : undefined} style={{ "--sr": `${TILTS[step]}deg` } as CSSProperties}>
                                <StampFace step={step} at={at} />
                              </span>
                            ) : (
                              <span aria-hidden="true">{i + 1}</span>
                            )}
                          </span>
                          <span className={styles.name}>{STOPS[step].name}</span>
                        </StopLink>
                      </li>
                    );
                  })}
                </ol>

                {next ? (
                  <div className={styles.next}>
                    <div>
                      <span className={styles.kicker}>Next stop</span>
                      <p className={styles.nextTitle}>{STOPS[next].title}</p>
                      <p className={styles.nextText}>{STOPS[next].text}</p>
                    </div>
                    {STOPS[next].href.startsWith("/") ? (
                      <ButtonLink as={Link} href={STOPS[next].href} size="sm" variant="ink" tilt={-2} onClick={close}>
                        {STOPS[next].go}
                      </ButtonLink>
                    ) : (
                      <ButtonLink href={STOPS[next].href} size="sm" variant="ink" tilt={-2} onClick={close}>
                        {STOPS[next].go}
                      </ButtonLink>
                    )}
                  </div>
                ) : (
                  <div className={styles.next}>
                    <HoloPip size={64} />
                    <div>
                      <span className={styles.kicker}>All aboard</span>
                      <p className={styles.nextText}>That&apos;s the whole tour. Holo Pip is yours: find it in the playground tray.</p>
                    </div>
                    <Button size="sm" variant="plain" onClick={resetPass}>
                      Ride again
                    </Button>
                  </div>
                )}
              </div>

              <div className={styles.perf} aria-hidden="true" />
              <div className={styles.foot}>
                <span className={styles.barcode} aria-hidden="true" />
                <span className={styles.count}>
                  {n}/{STEPS.length}
                  <small>{done ? "All aboard" : "Stops"}</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.corner} data-done={done ? "" : undefined} data-open={open ? "" : undefined}>
        {hint && !open && !done && (
          <div className={styles.hint}>
            <button type="button" className={styles.hintText} onClick={() => { dismissHint(); setOpen(true); }}>
              Not sure where to start?
              <span className="vh"> Take the five-stop tour</span>
            </button>
            <button type="button" className={styles.hintClose} onClick={dismissHint} aria-label="Dismiss the tour hint">
              <CloseIcon />
            </button>
          </div>
        )}
        <button
          ref={fab}
          type="button"
          className={styles.fab}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => {
            dismissHint();
            setOpen((o) => !o);
          }}
          data-bump={bump ? "" : undefined}
          onAnimationEnd={(e) => e.target === e.currentTarget && setBump(false)}
          aria-label={done ? `Ride-along pass, all ${STEPS.length} stops stamped` : `New here? Ride-along pass, ${n} of ${STEPS.length} stops stamped`}
        >
          {done ? (
            <Stub done n={n} next={next} />
          ) : (
            // The capped buddy's friend peeks over the stub, like the buddy on a Button: it says "press me".
            <BuddyPeek mood="preview" side="end" className={styles.fabPeek}>
              <Stub done={false} n={n} next={next} />
            </BuddyPeek>
          )}
        </button>
      </div>

      <dialog ref={reward} className={styles.reward} aria-labelledby={`${titleId}-reward`}>
        <span className={styles.rewardTape}>Five stamps!</span>
        <h2 id={`${titleId}-reward`} className={styles.rewardTitle}>
          All aboard.
        </h2>
        <p>You took the whole tour. Here&apos;s Holo Pip, a foil sticker for riders who finish. It&apos;s in your playground tray now, for good.</p>
        <HoloPip size={150} />
        <form method="dialog" className={styles.rewardActions}>
          <Button type="submit" variant="ink">
            Nice!
          </Button>
        </form>
      </dialog>
    </>
  );
}
