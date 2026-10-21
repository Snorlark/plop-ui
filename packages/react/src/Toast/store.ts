export type ToastKind = "info" | "success" | "error";

export interface ToastItem {
  id: number;
  text: string;
  kind: ToastKind;
  /** Milliseconds on screen. */
  duration: number;
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
}

function show(kind: ToastKind, text: string, options: ToastOptions = {}): number {
  const id = nextId++;
  // One stamp at a time, like the prototype: a new toast replaces the last.
  items = [{ id, text, kind, duration: options.duration ?? 4000 }];
  emit();
  return id;
}

/**
 * Slaps a message onto the bottom of the screen like a stamp. Needs a
 * PlopProvider (it renders the toast zone, a polite live region).
 *
 * toast("Mobile 2 is 6 min away"); toast.success("Report sent"); toast.error("Couldn't send");
 */
export const toast = Object.assign((text: string, options?: ToastOptions) => show("info", text, options), {
  success: (text: string, options?: ToastOptions) => show("success", text, options),
  error: (text: string, options?: ToastOptions) => show("error", text, options),
  dismiss,
});
