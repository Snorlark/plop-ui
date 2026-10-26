"use client";

import { PlopProvider, type PlopProviderProps } from "@plop-ui/react";
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

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
      el.setAttribute("data-scrolling", "");
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

  return (
    <FeedbackContext.Provider value={{ haptics, sound, setHaptics, setSound, surface, setSurface }}>
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
