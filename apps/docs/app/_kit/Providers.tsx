"use client";

import { PlopProvider, useHaptics, useReducedMotion, useSound, type PlopProviderProps } from "@plop-ui/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";

export type SiteSurface = "poster" | "mat";

interface Feedback {
  haptics: boolean;
  sound: boolean;
  setHaptics: (on: boolean) => void;
  setSound: (on: boolean) => void;
  /** Paper (poster) or cutting mat: the website's light and dark look. */
  surface: SiteSurface;
  setSurface: (next: SiteSurface) => void;
}

const FeedbackContext = createContext<Feedback | null>(null);

const STORAGE_KEY = "plop-feedback";
const SURFACE_KEY = "plop-site-surface";

/** Runs in <head> before paint: puts the saved surface on <html>. Keep it tiny and dependency-free. */
export const SURFACE_SCRIPT = `try{if(localStorage.getItem("${SURFACE_KEY}")==="mat")document.documentElement.setAttribute("data-plop-surface","mat")}catch(e){}`;

function readStored(): Partial<Pick<Feedback, "haptics" | "sound">> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function store(next: Pick<Feedback, "haptics" | "sound">) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or blocked storage: the choice just lasts for this visit.
  }
}

function readSurface(): SiteSurface {
  return document.documentElement.getAttribute("data-plop-surface") === "mat" ? "mat" : "poster";
}

function subscribeSurface(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-plop-surface"] });
  return () => mo.disconnect();
}

/**
 * Root PlopProvider whose haptics, sound and surface the header toggles
 * switch. Sound starts off. Choices are remembered on this device; nested
 * PlopProviders inherit them, so they cover the whole page. The provider sets
 * no surface itself, so it follows the one on <html>.
 */
export function Providers({ children, ...props }: PlopProviderProps & { children: ReactNode }) {
  const [haptics, setHapticsState] = useState(true);
  const [sound, setSoundState] = useState(false);
  // The surface lives on <html> (set before paint by SURFACE_SCRIPT); read it from there so the
  // toggle, the headline and the page can never disagree.
  const surface = useSyncExternalStore(subscribeSurface, readSurface, () => "poster" as SiteSurface);

  // Read after mount so the server and first client render agree.
  useEffect(() => {
    const saved = readStored();
    if (typeof saved.haptics === "boolean") setHapticsState(saved.haptics);
    if (typeof saved.sound === "boolean") setSoundState(saved.sound);
  }, []);

  // Scrollbars stay hidden until something scrolls: mark the scrolling element for a moment (site.css shows its thumb).
  useEffect(() => {
    const timers = new WeakMap<Element, number>();
    const onScroll = (e: Event) => {
      const el = e.target instanceof Element ? e.target : document.documentElement;
      // Only the first scroll event touches the DOM; the rest just push the timer back.
      if (!el.hasAttribute("data-scrolling")) el.setAttribute("data-scrolling", "");
      window.clearTimeout(timers.get(el));
      timers.set(el, window.setTimeout(() => el.removeAttribute("data-scrolling"), 900));
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  const setSurface = useCallback((next: SiteSurface) => {
    document.documentElement.setAttribute("data-plop-surface", next);
    try {
      localStorage.setItem(SURFACE_KEY, next);
    } catch {
      // Blocked storage: the surface just lasts for this visit.
    }
  }, []);

  const setHaptics = useCallback(
    (on: boolean) => {
      setHapticsState(on);
      store({ haptics: on, sound });
    },
    [sound],
  );
  const setSound = useCallback(
    (on: boolean) => {
      setSoundState(on);
      store({ haptics, sound: on });
    },
    [haptics],
  );

  const value = useMemo(() => ({ haptics, sound, setHaptics, setSound, surface, setSurface }), [haptics, sound, setHaptics, setSound, surface, setSurface]);

  return (
    <FeedbackContext.Provider value={value}>
      <PlopProvider {...props} haptics={haptics} sound={sound}>
        {children}
      </PlopProvider>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): Feedback {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback needs <Providers>");
  return ctx;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void>; skipTransition: () => void };
};

/**
 * Switches paper ↔ cutting mat by tearing the old page off like a sheet from
 * a notepad: it tugs, rips along a ragged top edge and falls away, showing
 * the new surface underneath. A view transition that only moves the old
 * snapshot (transform), so it stays on the compositor.
 */
export function useSurfaceSwitch() {
  const { surface, setSurface } = useFeedback();
  const reduced = useReducedMotion();
  const haptics = useHaptics();
  const sound = useSound();
  const busy = useRef(false);

  return useCallback(() => {
    if (busy.current) return;
    const next: SiteSurface = surface === "mat" ? "poster" : "mat";
    haptics.tap();
    sound("up");
    const doc = document as ViewTransitionDocument;
    if (reduced || typeof doc.startViewTransition !== "function") {
      setSurface(next);
      return;
    }
    busy.current = true;
    const html = document.documentElement;
    html.setAttribute("data-tear", "");
    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      flushSync(() => setSurface(next));
    };
    const vt = doc.startViewTransition(swap);
    // WebKit sometimes stalls a transition before its snapshot and never runs the swap (seen on CI):
    // after a second, skip the tear and swap anyway, so the switch always works.
    const stall = window.setTimeout(() => {
      if (swapped) return;
      vt.skipTransition();
      swap();
    }, 1000);
    const done = () => {
      window.clearTimeout(stall);
      html.removeAttribute("data-tear");
      busy.current = false;
    };
    vt.finished.then(done, done);
  }, [surface, setSurface, reduced, haptics, sound]);
}
