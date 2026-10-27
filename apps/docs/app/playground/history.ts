import type { SurfaceName } from "@plop-ui/tokens";
import { useCallback, useReducer } from "react";
import type { Item } from "./stickers";

/** Everything on the board that undo covers. */
export interface Board {
  paper: SurfaceName;
  items: Item[];
  roundness: number;
}

const LIMIT = 50;

interface State {
  past: Board[];
  present: Board;
  /** The board as of the last recorded step; a live drag changes `present` without moving this. */
  base: Board;
  future: Board[];
}

type Action =
  | { type: "set"; next: Board | ((b: Board) => Board); commit: boolean }
  | { type: "commit" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; board: Board };

function record(s: State, present: Board): State {
  if (present === s.base) return { ...s, present };
  return { past: [...s.past, s.base].slice(-LIMIT), present, base: present, future: [] };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "set": {
      const present = typeof a.next === "function" ? a.next(s.present) : a.next;
      return a.commit ? record(s, present) : { ...s, present };
    }
    case "commit":
      return record(s, s.present);
    case "undo": {
      // A half-finished live change counts as the step to undo.
      if (s.present !== s.base) return { ...s, present: s.base, future: [s.present, ...s.future] };
      const prev = s.past[s.past.length - 1];
      return prev ? { past: s.past.slice(0, -1), present: prev, base: prev, future: [s.present, ...s.future] } : s;
    }
    case "redo": {
      const [next, ...future] = s.future;
      return next ? { past: [...s.past, s.base].slice(-LIMIT), present: next, base: next, future } : s;
    }
    case "reset":
      return { past: [], present: a.board, base: a.board, future: [] };
  }
}

/**
 * The board with undo and redo. `set` records a step; `set(next, { commit: false })` changes the board
 * live (a drag in progress) and `commit()` records it once, so one drag is one undo step.
 */
export function useBoardHistory(initial: Board) {
  const [s, dispatch] = useReducer(reducer, { past: [], present: initial, base: initial, future: [] });
  const set = useCallback((next: Board | ((b: Board) => Board), opts?: { commit?: boolean }) => dispatch({ type: "set", next, commit: opts?.commit ?? true }), []);
  const commit = useCallback(() => dispatch({ type: "commit" }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback((board: Board) => dispatch({ type: "reset", board }), []);
  return { board: s.present, set, commit, undo, redo, reset, canUndo: s.past.length > 0 || s.present !== s.base, canRedo: s.future.length > 0 };
}
