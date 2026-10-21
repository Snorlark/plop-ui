"use client";

import { cloneElement, isValidElement, useId, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Tooltip.module.css";

interface TriggerProps {
  "aria-describedby"?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  onBlur?: (e: FocusEvent<HTMLElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
}

export interface TooltipProps {
  /** What the bubble says. Keep it to a sentence. */
  content: ReactNode;
  /** The one element it explains. It must be focusable (a button, a link, or tabIndex={0}). */
  children: ReactElement<TriggerProps>;
  /** Where the bubble points from. Default `top` (centered above). */
  side?: "top" | "right";
  /** Keep it open (for docs or onboarding). */
  open?: boolean;
  className?: string;
}

/**
 * A speech bubble that pops out of whatever it explains. Opens on hover and
 * keyboard focus, closes with Escape, and is linked with aria-describedby.
 */
export function Tooltip({ content, children, side = "top", open = false, className }: TooltipProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  // Escape hides the bubble without moving focus; leaving or blurring the trigger resets it.
  const child = isValidElement(children)
    ? cloneElement(children, {
        "aria-describedby": cx(children.props["aria-describedby"], id),
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
          children.props.onKeyDown?.(e);
          if (e.key === "Escape") setDismissed(true);
        },
        onBlur: (e: FocusEvent<HTMLElement>) => {
          children.props.onBlur?.(e);
          setDismissed(false);
        },
        onMouseLeave: (e: MouseEvent<HTMLElement>) => {
          children.props.onMouseLeave?.(e);
          setDismissed(false);
        },
      })
    : children;

  return (
    <span
      className={cx(styles.wrap, className)}
      data-open={open && !dismissed ? "" : undefined}
      data-dismissed={dismissed ? "" : undefined}
    >
      {child}
      <span role="tooltip" id={id} className={cx(styles.tip, side === "right" && styles.right)}>
        {content}
      </span>
    </span>
  );
}
