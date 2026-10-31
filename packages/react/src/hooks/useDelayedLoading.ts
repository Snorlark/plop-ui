"use client";

import { useEffect, useRef, useState } from "react";

export interface UseDelayedLoadingOptions {
  /** Wait this long before showing anything, so quick loads never flash a spinner. Default 300 ms. */
  delay?: number;
  /** Once shown, keep it up at least this long, so it doesn't blink on and off. Default 500 ms. */
  minDuration?: number;
}

/**
 * Turns a raw "is loading" flag into "should a spinner show": nothing for quick loads, and no blink when a
 * load ends just after the spinner appeared. `const show = useDelayedLoading(isPending)`.
 */
export function useDelayedLoading(loading: boolean, { delay = 300, minDuration = 500 }: UseDelayedLoadingOptions = {}): boolean {
  const [show, setShow] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (loading && !show) {
      const id = window.setTimeout(() => {
        shownAt.current = Date.now();
        setShow(true);
      }, delay);
      return () => window.clearTimeout(id);
    }
    if (!loading && show) {
      const left = Math.max(0, minDuration - (Date.now() - shownAt.current));
      const id = window.setTimeout(() => setShow(false), left);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [loading, show, delay, minDuration]);

  return show;
}
