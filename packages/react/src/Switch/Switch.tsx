"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { useState, type ReactNode, type Ref } from "react";
import { useHaptics } from "../hooks/useHaptics.js";
import { useSound } from "../hooks/useSound.js";
import { cx } from "../internal/cx.js";
import styles from "./Switch.module.css";

export type SwitchColor = "mint" | "ink" | "tomato";

export interface SwitchProps {
  ref?: Ref<HTMLButtonElement>;
  /** The label. Clicking it toggles the switch. */
  children?: ReactNode;
  /** Controlled state. */
  checked?: boolean;
  /** Uncontrolled initial state. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Track color when on. Default `mint`. */
  color?: SwitchColor;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  /** Accessible name when there is no visible label. */
  "aria-label"?: string;
}

const ink = { stroke: "var(--plop-ink)" };
const inkFill = { fill: "var(--plop-ink)" };
const cheek = { fill: "var(--plop-bubblegum)" };

/** The knob is a little face: asleep when off, awake when on. `role="switch"` with `aria-checked`. */
export function Switch({ ref, children, color = "mint", className, onCheckedChange, disabled, id, ...rest }: SwitchProps) {
  const haptics = useHaptics();
  const sound = useSound();
  const [flips, setFlips] = useState(0);

  return (
    <label className={cx(styles.row, className)} data-disabled={disabled ? "" : undefined}>
      <SwitchPrimitive.Root
        {...rest}
        ref={ref}
        id={id}
        disabled={disabled}
        className={cx(styles.track, styles[color])}
        onCheckedChange={(checked) => {
          haptics.tap();
          sound(checked ? "up" : "down");
          setFlips((n) => n + 1);
          onCheckedChange?.(checked);
        }}
      >
        <SwitchPrimitive.Thumb className={styles.knob}>
          <span key={flips} className={styles.face} data-flipped={flips > 0 ? "" : undefined}>
          <svg viewBox="0 0 30 30" aria-hidden="true">
            <path
              d="M15 1.5 C 23 1.5, 28.5 7, 28.5 15 C 28.5 23, 23 28.5, 15 28.5 C 7 28.5, 1.5 23, 1.5 15 C 1.5 7, 7 1.5, 15 1.5 Z"
              strokeWidth="2.4"
              style={{ ...ink, fill: "var(--plop-paper)" }}
            />
            <g className={styles.asleep} fill="none" strokeWidth="2" strokeLinecap="round" style={ink}>
              <path d="M8.5 13.5 C 10 14.8, 11.5 14.8, 12.8 13.5" />
              <path d="M17.2 13.5 C 18.5 14.8, 20 14.8, 21.5 13.5" />
              <path d="M13 20 L 17 20" />
            </g>
            <g className={styles.awake}>
              <circle cx="10.5" cy="13" r="1.9" style={inkFill} />
              <circle cx="19.5" cy="13" r="1.9" style={inkFill} />
              <path d="M10.5 18.5 C 13 21.5, 17 21.5, 19.5 18.5" fill="none" strokeWidth="2" strokeLinecap="round" style={ink} />
              <ellipse cx="7.5" cy="17.5" rx="2.2" ry="1.4" style={cheek} />
              <ellipse cx="22.5" cy="17.5" rx="2.2" ry="1.4" style={cheek} />
            </g>
          </svg>
          </span>
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      {children != null && <span className={styles.text}>{children}</span>}
    </label>
  );
}
