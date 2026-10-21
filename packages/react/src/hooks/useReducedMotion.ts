"use client";

import { useSyncExternalStore } from "react";
import { usePlop } from "../PlopProvider/context.js";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(QUERY).matches : false);

/** True when motion should be reduced: the provider says "always", or it says "system" and the OS asks for it. */
export function useReducedMotion(): boolean {
  const { reducedMotion } = usePlop();
  const system = useSyncExternalStore(subscribe, getSnapshot, () => false);
  if (reducedMotion === "always") return true;
  if (reducedMotion === "never") return false;
  return system;
}
