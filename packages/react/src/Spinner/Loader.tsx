"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "../Button/Button.js";
import { CloseIcon } from "../icons.js";
import { IconButton } from "../IconButton/IconButton.js";
import { cx } from "../internal/cx.js";
import { Sheet, type SheetProps } from "../Sheet/Sheet.js";
import { Spinner, type SpinnerKind, type SpinnerSize } from "./Spinner.js";
import styles from "./Loader.module.css";

export interface LoaderProps {
  /** What's loading, e.g. "Loading your sketches". Shown and read out. Default "Loading". */
  label?: string;
  /** `inline` sits in a row of content (default). `card` is a paper card for a whole page or panel, with Hum and tips. */
  variant?: "inline" | "card";
  /** The spinner. Default `ink` inline, `buddy` on a card. */
  kind?: SpinnerKind;
  /** Spinner size for the inline loader. Default `md`. */
  size?: SpinnerSize;
  /** After this many milliseconds, say it's slow and offer Cancel. 0 never does. Default 4000. */
  slowAfter?: number;
  /** What to say when it's slow. Default "This is taking longer than usual." */
  slowMessage?: ReactNode;
  /** Called by the Cancel button. Without it there's no Cancel button. */
  onCancel?: () => void;
  /** Words on the Cancel button. Default "Cancel". */
  cancelLabel?: string;
  /** Card only: little lines that rotate while it waits ("Sharpening pencils…"). Not read out on each change. */
  tips?: string[];
  /** Card only: milliseconds per tip. Default 2600. */
  tipEvery?: number;
  /** Card only: the paper it's printed on. `dots` (default), `lined`, `kraft` or `plain`. */
  paper?: "dots" | "lined" | "kraft" | "plain";
  /** Card only: the tape holding it down. Default `mustard`. */
  tape?: SheetProps["tape"];
  /** Card only: shows a close button in the corner. Use it when someone can leave the wait (Escape should do the same). */
  onClose?: () => void;
  /** Accessible name of the close button. Default "Close". */
  closeLabel?: string;
  /** Extra class on the loader. */
  className?: string;
}

/**
 * A spinner with manners: it says what's loading, and when a wait drags on it says so and offers a way out
 * instead of spinning forever in silence. Inline in a list, or a paper card for a whole page.
 */
export function Loader({
  label = "Loading",
  variant = "inline",
  kind,
  size = "md",
  slowAfter = 4000,
  slowMessage = "This is taking longer than usual.",
  onCancel,
  cancelLabel = "Cancel",
  tips,
  tipEvery = 2600,
  paper = "dots",
  tape = "mustard",
  onClose,
  closeLabel = "Close",
  className,
}: LoaderProps) {
  const [slow, setSlow] = useState(false);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (!slowAfter) return;
    const id = window.setTimeout(() => setSlow(true), slowAfter);
    return () => window.clearTimeout(id);
  }, [slowAfter]);

  const tipCount = tips?.length ?? 0;
  useEffect(() => {
    if (variant !== "card" || tipCount < 2) return;
    const id = window.setInterval(() => setTip((t) => (t + 1) % tipCount), tipEvery);
    return () => window.clearInterval(id);
  }, [variant, tipCount, tipEvery]);

  const note = (
    <div className={styles.slow} role="status">
      {slow && (
        <>
          <span>{slowMessage}</span>
          {onCancel && (
            <Button size="sm" variant="plain" shadow="none" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <Sheet tape={tape} className={cx(styles.card, styles[paper], className)}>
        {onClose && (
          <span className={styles.close}>
            <IconButton icon={<CloseIcon />} label={closeLabel} size="sm" variant="plain" onClick={onClose} />
          </span>
        )}
        <Spinner kind={kind ?? "buddy"} size="lg" label={label} />
        <p className={styles.title} aria-hidden="true">
          {label}
        </p>
        {tipCount > 0 && (
          <p key={tip} className={styles.tip}>
            {tips![tip]}
          </p>
        )}
        {note}
      </Sheet>
    );
  }

  return (
    <div className={cx(styles.inline, className)}>
      <Spinner kind={kind ?? "ink"} size={size} label={label} showLabel />
      {note}
    </div>
  );
}
