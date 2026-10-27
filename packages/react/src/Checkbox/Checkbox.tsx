"use client";

import { useEffect, useImperativeHandle, useRef, type ChangeEvent, type CSSProperties, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { useHaptics } from "../hooks/useHaptics.js";
import { useSound } from "../hooks/useSound.js";
import { cx } from "../internal/cx.js";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children" | "onChange"> {
  ref?: Ref<HTMLInputElement>;
  /** The label. */
  children?: ReactNode;
  /** Shows a dash: some, but not all, of a group is checked. */
  indeterminate?: boolean;
  /** Color of the tick, as a CSS color or token variable. Default ink. */
  tickColor?: string;
  /** Called with the new checked state on toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** The native change event of the input; fires before `onCheckedChange`. */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const FRAME = "M4 5 C 10 3.5, 20 4.5, 26 4 C 26.5 10, 25.5 19, 26.5 26 C 19 26.8, 11 25.5, 4.5 26.5 C 3.5 19, 4.5 11, 4 5 Z";

/** A real `<input type="checkbox">` with a hand-drawn box and a tick that draws in. */
export function Checkbox({ ref, children, indeterminate = false, tickColor, className, style, onCheckedChange, onChange, disabled, ...rest }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const haptics = useHaptics();
  const sound = useSound();
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cx(styles.root, className)} data-disabled={disabled ? "" : undefined} style={style}>
      <input
        {...rest}
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        disabled={disabled}
        onChange={(event) => {
          haptics.tap();
          sound(event.target.checked ? "up" : "down");
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
      />
      <span className={styles.box} aria-hidden="true" style={tickColor ? ({ "--tick": tickColor } as CSSProperties) : undefined}>
        <svg viewBox="0 0 30 30">
          <path className={styles.frame} d={FRAME} />
          <path className={styles.tick} d="M7 15 C 9.5 17, 11.5 20, 12.5 23 C 15.5 15, 20 7.5, 29 1.5" />
          <path className={styles.dash} d="M8 15.5 C 12 14.5, 18 16, 22 15" />
        </svg>
      </span>
      {children != null && <span className={styles.text}>{children}</span>}
    </label>
  );
}
