"use client";

import { Buddy, CloseIcon, IconButton, MenuIcon, Tag, useHaptics, type BuddyMood } from "@plop-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MENUS, menuFor, type FeatureArt, type Menu, type MenuId } from "./menus";
import styles from "./megaNav.module.css";
import { HoloPip } from "./RideAlong";

const CREW: BuddyMood[] = ["success", "error", "stale", "congrats"];

function Art({ art }: { art: FeatureArt }) {
  if (art === "palette")
    return (
      <span className={styles.artPalette}>
        <kbd>⌘</kbd>
        <kbd>K</kbd>
        <span>Search…</span>
      </span>
    );
  if (art === "wobble")
    return (
      <svg viewBox="0 0 200 60" width="190" height="56">
        <path d="M10 30 C 40 6, 60 54, 90 30 S 140 6, 190 30" fill="none" stroke="var(--plop-ink)" strokeWidth="5" strokeLinecap="round" filter="url(#site-logowob)" />
      </svg>
    );
  if (art === "holo") return <HoloPip size={74} />;
  return (
    <span className={styles.artCrew}>
      {CREW.map((m) => (
        <Buddy key={m} mood={m} size="sm" />
      ))}
    </span>
  );
}

function A({ href, children, style, onClick }: { href: string; children: ReactNode; style?: CSSProperties; onClick?: () => void }) {
  return href.startsWith("/") ? (
    <Link href={href} style={style} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <a href={href} style={style} onClick={onClick}>
      {children}
    </a>
  );
}

/** A menu's link columns and featured card. */
function Columns({ menu, onGo }: { menu: Menu; onGo: () => void }) {
  let n = 0;
  return (
    <div className={styles.cols}>
      {menu.cols.map((c) => (
        <div key={c.title} className={styles.col} data-big={c.big ? "" : undefined}>
          <h2>{c.title}</h2>
          <ul>
            {c.links.map(([label, href]) => (
              <li key={href}>
                <A href={href} style={{ "--i": n++ } as CSSProperties} onClick={onGo}>
                  {label}
                </A>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <A href={menu.feature.href} onClick={onGo}>
        <span className={styles.feature}>
          <span className={styles.featureTape}>
            <Tag tone={menu.feature.tone} tilt={-3}>
              {menu.feature.tape}
            </Tag>
          </span>
          <span className={styles.art} aria-hidden="true">
            <Art art={menu.feature.art} />
          </span>
          <b>{menu.feature.title}</b>
          <span>{menu.feature.text}</span>
        </span>
      </A>
    </div>
  );
}

/**
 * The header's mega menus. On wide screens, four triggers open one sheet of
 * links each (hover or click; Escape closes and returns focus; each panel
 * follows its trigger in the DOM, so Tab walks straight into it). On phones a
 * burger opens every menu as one scrolling sheet.
 */
export function MegaNav() {
  const path = usePathname();
  const active = menuFor(path);
  const base = useId();
  const haptics = useHaptics();
  const [open, setOpen] = useState<MenuId | null>(null);
  const [sheet, setSheet] = useState(false);
  const [dir, setDir] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  // The open menu, readable from hover timers that outlive a render.
  const current = useRef<MenuId | null>(null);
  useEffect(() => {
    current.current = open;
  }, [open]);

  const show = (id: MenuId | null) => {
    window.clearTimeout(timer.current);
    const cur = current.current;
    // Switching menus slides the new sheet in from the side it sits on.
    setDir(cur && id ? MENUS.findIndex((m) => m.id === id) - MENUS.findIndex((m) => m.id === cur) : 0);
    if (id && id !== cur) haptics.tap();
    current.current = id;
    setOpen(id);
  };
  const later = (id: MenuId | null, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => show(id), ms);
  };

  // Leaving the page, Escape, or a press outside closes everything.
  useEffect(() => {
    setOpen(null);
    setSheet(false);
  }, [path]);
  useEffect(() => {
    if (!open && !sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = open ? document.getElementById(`${base}-${open}-t`) : document.getElementById(`${base}-burger`);
      setOpen(null);
      setSheet(false);
      trigger?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (e.target === scrim.current || !root.current?.contains(e.target as Node)) {
        setOpen(null);
        setSheet(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, sheet, base]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Lets the rest of the page react while a menu is open (the Ride-along ticket steps out of the way).
  useEffect(() => {
    const html = document.documentElement;
    if (open || sheet) html.setAttribute("data-menu-open", "");
    else html.removeAttribute("data-menu-open");
    return () => html.removeAttribute("data-menu-open");
  }, [open, sheet]);

  const close = () => {
    setOpen(null);
    setSheet(false);
  };

  return (
    <div ref={root} className={styles.root} onPointerLeave={(e) => e.pointerType === "mouse" && open && later(null, 220)}>
      <nav aria-label="Main" className={styles.nav}>
        <ul className={styles.triggers}>
          {MENUS.map((m) => (
            <li key={m.id} onPointerEnter={(e) => e.pointerType === "mouse" && later(m.id, open ? 40 : 90)}>
              <button
                type="button"
                id={`${base}-${m.id}-t`}
                className={styles.trigger}
                aria-expanded={open === m.id}
                aria-controls={`${base}-${m.id}`}
                data-active={active === m.id ? "" : undefined}
                onClick={() => show(open === m.id ? null : m.id)}
              >
                <span>{m.label}</span>
              </button>
              <div id={`${base}-${m.id}`} className={styles.panel} hidden={open !== m.id} style={{ "--dir": `${Math.sign(dir) * 18}px` } as CSSProperties}>
                <div className={styles.panelIn}>{open === m.id && <Columns menu={m} onGo={close} />}</div>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <span className={styles.burger}>
        <IconButton
          id={`${base}-burger`}
          size="sm"
          variant={sheet ? "mustard" : "plain"}
          tilt={3}
          burst={false}
          label="Menu"
          aria-expanded={sheet}
          aria-controls={`${base}-sheet`}
          icon={sheet ? <CloseIcon /> : <MenuIcon />}
          onClick={() => {
            haptics.tap();
            setSheet((s) => !s);
          }}
        />
      </span>
      <div id={`${base}-sheet`} className={styles.sheet} hidden={!sheet}>
        {sheet && (
          <nav aria-label="Menu">
            {MENUS.map((m) => (
              <section key={m.id} className={styles.sheetSection} aria-labelledby={`${base}-${m.id}-h`}>
                <h2 id={`${base}-${m.id}-h`} data-active={active === m.id ? "" : undefined}>
                  {m.label}
                </h2>
                <Columns menu={m} onGo={close} />
              </section>
            ))}
          </nav>
        )}
      </div>
      <div
        ref={scrim}
        className={styles.scrim}
        data-on={open ? "" : undefined}
        aria-hidden="true"
        // The backdrop sits inside this component, so moving onto it never "leaves" the menu: treat it as leaving.
        onPointerEnter={(e) => e.pointerType === "mouse" && open && later(null, 160)}
      />
    </div>
  );
}
