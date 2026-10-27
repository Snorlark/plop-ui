"use client";

import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode } from "react";
import { useHaptics } from "../hooks/useHaptics.js";
import { cx } from "../internal/cx.js";
import styles from "./Radio.module.css";

interface GroupContext {
  name: string;
  value: string | undefined;
  select: (value: string) => void;
  disabled?: boolean;
}

const RadioContext = createContext<GroupContext | null>(null);

export interface RadioGroupProps {
  /** The question, shown as the fieldset's legend. */
  legend: ReactNode;
  /** The `Radio` options. */
  children: ReactNode;
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial selected value. */
  defaultValue?: string;
  /** Called with the chosen option's value. */
  onValueChange?: (value: string) => void;
  /** Form field name. Defaults to a generated one. */
  name?: string;
  /** Stack options vertically. Default true. */
  vertical?: boolean;
  /** Disables every option in the group. */
  disabled?: boolean;
  /** Extra class on the fieldset. */
  className?: string;
}

/** A `<fieldset>` of native radio buttons. Arrow keys move between options, as with any radio group. */
export function RadioGroup({ legend, children, value, defaultValue, onValueChange, name, vertical = true, disabled, className }: RadioGroupProps) {
  const auto = useId();
  const [inner, setInner] = useState(defaultValue);
  const haptics = useHaptics();
  const current = value ?? inner;
  const select = (v: string) => {
    haptics.tap();
    setInner(v);
    onValueChange?.(v);
  };
  return (
    <fieldset className={cx(styles.group, vertical && styles.vertical, className)} disabled={disabled}>
      <legend className={styles.legend}>{legend}</legend>
      <RadioContext.Provider value={{ name: name ?? auto, value: current, select, disabled }}>{children}</RadioContext.Provider>
    </fieldset>
  );
}

export interface RadioProps {
  /** The value the group reports when this option is chosen. */
  value: string;
  /** The option's label. */
  children: ReactNode;
  /** Color of the ink blob, as a CSS color or token variable. Default ink. */
  dotColor?: string;
  /** Disables just this option. */
  disabled?: boolean;
}

const FRAME = "M15 3 C 22.5 3, 27 8, 27 15 C 27 22.5, 22 27, 15 27 C 8 27, 3 22.5, 3 15 C 3 8, 8 3, 15 3 Z";
const DOT = "M15 8.5 C 19.5 8, 22 11, 21.5 15.5 C 21 19.5, 18.5 21.8, 14.5 21.5 C 10.5 21.3, 8.3 18.5, 8.6 14.5 C 9 11, 11.2 8.8, 15 8.5 Z";

export function Radio({ value, children, dotColor, disabled }: RadioProps) {
  const group = useContext(RadioContext);
  if (!group) throw new Error("<Radio> must be inside a <RadioGroup>.");
  const off = disabled || group.disabled;
  return (
    <label className={styles.option} data-disabled={off ? "" : undefined}>
      <input
        type="radio"
        className={styles.input}
        name={group.name}
        value={value}
        checked={group.value === value}
        disabled={off}
        onChange={() => group.select(value)}
      />
      <span className={styles.box} aria-hidden="true" style={dotColor ? ({ "--dot": dotColor } as CSSProperties) : undefined}>
        <svg viewBox="0 0 30 30">
          <path className={styles.frame} d={FRAME} />
          <path className={styles.dot} d={DOT} />
        </svg>
      </span>
      <span className={styles.text}>{children}</span>
    </label>
  );
}
