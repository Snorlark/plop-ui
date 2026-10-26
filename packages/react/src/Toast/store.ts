import type { BuddyMood } from "../Buddy/Buddy.js";
import type { BurstStyle } from "../InkBurst/burstStyles.js";

export type ToastKind = "info" | "success" | "error";

export interface ToastItem {
  id: number;
  text: string;
  kind: ToastKind;
  /** Milliseconds on screen. */
  duration: number;
  /** A character peeking over the toast, or none. */
  buddy?: BuddyMood;
  /** What flies out when the toast lands, or nothing. */
  burst?: BurstStyle;
}

type Listener = (items: readonly ToastItem[]) => void;

let items: readonly ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l(items));

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts(): readonly ToastItem[] {
  return items;
}

export function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export interface ToastOptions {
  /** Milliseconds on screen. Default 4000: long enough to read twice. */
  duration?: number;
  /** A character peeks over the toast: `true` picks one for the kind (Pip, Bix, Specs), or name a mood, e.g. `"congrats"`. */
  buddy?: boolean | BuddyMood;
  /**
   * Something flies out when the toast lands. Off by default. `true` picks for the kind: `"confetti"`
   * for success, a `"poof"` of dust (and a shake) for error, a `"sparkle"` for info. Or name any burst
   * style, e.g. `"stars"` or `"zap"`. Skipped under reduced motion.
   */
  burst?: boolean | BurstStyle;
}

/** The character that fits each kind of toast. */
export const TOAST_BUDDY: Record<ToastKind, BuddyMood> = { success: "success", error: "error", info: "preview" };

/** The burst that fits each kind of toast, for `burst: true`. */
export const TOAST_BURST: Record<ToastKind, BurstStyle> = { success: "confetti", error: "poof", info: "sparkle" };

function show(kind: ToastKind, text: string, options: ToastOptions = {}): number {
  const id = nextId++;
  // One stamp at a time, like the prototype: a new toast replaces the last.
  const buddy = options.buddy === true ? TOAST_BUDDY[kind] : options.buddy || undefined;
  const burst = options.burst === true ? TOAST_BURST[kind] : options.burst || undefined;
  items = [{ id, text, kind, duration: options.duration ?? 4000, buddy, burst }];
  emit();
  return id;
}

/**
 * Slaps a message onto the bottom of the screen like a stamp. Needs a
 * PlopProvider (it renders the toast zone, a polite live region).
 *
 * toast("Rosa liked your sketch"); toast.success("Sketch posted", { burst: true }); toast.error("Couldn't post", { burst: true });
 */
export const toast = Object.assign((text: string, options?: ToastOptions) => show("info", text, options), {
  success: (text: string, options?: ToastOptions) => show("success", text, options),
  error: (text: string, options?: ToastOptions) => show("error", text, options),
  dismiss,
});
