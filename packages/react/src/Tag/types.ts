import type { Status } from "@plop-ui/tokens";
import type { ReactNode } from "react";
import type { Seed } from "../seed.js";

export type TagTone = "ink" | "tomato" | "mustard" | "mint" | "periwinkle" | "bubblegum";
export type TagPattern = "stripes" | "dots" | "grid";

export interface TagProps {
  /** Short label. Lettered in Sketchpop, uppercase. */
  children: ReactNode;
  /** Tape color. Default `periwinkle` (or the status color when `status` is set). */
  tone?: TagTone;
  /** Ops status shortcut: sets the tone from the status mapping. The label is still yours to write. */
  status?: Status;
  /** Tape print. Default `stripes`. */
  pattern?: TagPattern;
  /** Rotation in degrees. Defaults to a small seeded tilt. */
  tilt?: number;
  /** Seeds the default tilt. */
  seed?: Seed;
  /** Makes the tag removable: shows an × button and peels the tag off when pressed. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Default "Remove <label>". */
  removeLabel?: string;
  className?: string;
  id?: string;
}
