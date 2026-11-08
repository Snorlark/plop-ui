"use client";

import { Button, Select, useHaptics, useReducedMotion } from "@plop-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import styles from "./changelog.module.css";

export interface NavRelease {
  id: string;
  label: string;
  date?: string;
  pkgs: string[];
  href?: string;
}

const OPEN_EVENT = "plop:changelog-open";

/** Unfolds whichever release holds `id` (a minor like v0-3 or a release like v0-3-5), then shows it. */
function go(id: string, smooth: boolean) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }));
  history.replaceState(null, "", `#${id}`);
}

/** Which release is being read: the last one whose top has passed a line just under the header. */
function useActive(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join(" ");
  useEffect(() => {
    const ids = key.split(" ");
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = Math.max(240, innerHeight * 0.35);
      let current = ids.find((id) => document.getElementById(id)?.offsetParent) ?? ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el || !el.offsetParent) continue; // hidden by the package filter
        if (el.getBoundingClientRect().top <= line) current = id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [key]);
  return active;
}

/** The sticky timeline beside the changelog: one dot per minor version, the one being read filled in. */
export function ReleaseTimeline({ releases }: { releases: NavRelease[] }) {
  const ids = releases.map((r) => r.id);
  const active = useActive(ids);
  const haptics = useHaptics();
  const reduced = useReducedMotion();
  return (
    <nav aria-label="Releases" className={styles.timeline}>
      <p className={styles.timelineTitle}>Releases</p>
      <ol>
        {releases.map((r) => (
          <li key={r.id} data-pkgs={r.pkgs.join(" ")}>
            <Link
              href={r.href ?? `#${r.id}`}
              aria-current={active === r.id ? "true" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                if (new URL(r.href ?? `#${r.id}`, location.href).search !== location.search) return;
                e.preventDefault();
                haptics.tap();
                go(r.id, !reduced);
              }}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.tlVersion}>{r.label}</span>
              {r.date && <span className={styles.tlDate}>{r.date}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Phones: the same list as a Select that jumps to the release picked. */
export function ReleaseJump({ releases }: { releases: NavRelease[] }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  return (
    <div className={styles.jump}>
      <Select
        label="Jump to a release"
        size="sm"
        placeholder="Pick a version"
        options={releases.map((r) => ({ value: r.id, label: r.label, hint: r.date }))}
        onValueChange={(id) => {
          const href = releases.find((r) => r.id === id)?.href;
          if (href && new URL(href, location.href).search !== location.search) router.push(href);
          else go(id, !reduced);
        }}
      />
    </div>
  );
}

/**
 * An older release: its changes stay in the page but folded away behind a sticker button. Opens itself when
 * the address names it or a release inside it (#v0-3 or #v0-3-5), or when the timeline jumps to it.
 */
export function Fold({ id, count, children }: { id: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const region = useId();
  useEffect(() => {
    const holds = (target: string) => target === id || !!document.getElementById(target)?.closest(`[data-fold="${id}"]`);
    const fromHash = () => {
      const target = decodeURIComponent(location.hash.slice(1));
      if (target && holds(target)) {
        setOpen(true);
        requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: "start" }));
      }
    };
    const onOpen = (e: Event) => {
      if (holds((e as CustomEvent<string>).detail)) setOpen(true);
    };
    fromHash();
    addEventListener("hashchange", fromHash);
    addEventListener(OPEN_EVENT, onOpen);
    return () => {
      removeEventListener("hashchange", fromHash);
      removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [id]);
  return (
    <div data-fold={id} className={styles.fold}>
      <Button size="sm" variant={open ? "plain" : "mustard"} tilt={open ? 0 : -1} aria-expanded={open} aria-controls={region} onClick={() => setOpen((o) => !o)}>
        {open ? "Hide changes" : count === 1 ? "Show the change" : `Show ${count} changes`}
      </Button>
      <div id={region} hidden={!open} className={styles.foldBody}>
        {children}
      </div>
    </div>
  );
}


/** Resolve existing fragment-only release links to the page that now contains them. */
export function ReleaseHash({ destinations }: { destinations: Record<string, string> }) {
  const router = useRouter();
  useEffect(() => {
    const resolve = () => {
      let id: string;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const href = destinations[id];
      if (href && !document.getElementById(id) && new URL(href, location.href).search !== location.search) router.replace(href);
    };
    resolve();
    addEventListener("hashchange", resolve);
    return () => removeEventListener("hashchange", resolve);
  }, [destinations, router]);
  return null;
}
