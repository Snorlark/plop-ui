"use client";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { IconButton } from "../IconButton/IconButton.js";
import { MinusIcon, PlusIcon, TrashIcon } from "../icons.js";
import { announce } from "../internal/announce.js";
import { cx } from "../internal/cx.js";
import { useSeed } from "../internal/useSeed.js";
import { seededTilt, type Seed } from "../seed.js";
import styles from "./NumberStepper.module.css";

export interface NumberStepperProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "children" | "value" | "defaultValue" | "min" | "max" | "step" | "size"
  > {
  ref?: Ref<HTMLInputElement>;
  /** The visible label, e.g. "Quantity". Required: it names the input and the − and + buttons. */
  label: ReactNode;
  /** Hide the label visually (it stays for screen readers). Use it in tight rows like a cart. */
  hideLabel?: boolean;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Default `min`, or 0 when there is no lower limit. */
  defaultValue?: number;
  /** Lowest value. − disables here and Home jumps to it. Default 0. */
  min?: number;
  /** Highest value. + disables here and End jumps to it. Default no limit. */
  max?: number;
  /** How much − and + (and ArrowDown/ArrowUp) change the value, measured from `min`. Default 1. */
  step?: number;
  /** Called with the new value after every change: buttons, keys, or a typed number once it is valid. */
  onValueChange?: (value: number) => void;
  /** Accessible name of the − button. Default "Decrease {label}" when label is text, else "Decrease". */
  decrementLabel?: string;
  /**
   * Called when the trash button is pressed. When passed, − turns into a trash button at `min` instead of
   * disabling. The row usually unmounts afterwards: move focus somewhere sensible, like the next row or the cart heading.
   */
  onRemove?: () => void;
  /** Accessible name of the trash button shown at `min` when `onRemove` is passed. Default "Remove item". */
  removeLabel?: string;
  /** Announced to screen readers after the trash button is pressed. Default "Item removed". */
  removedMessage?: string;
  /** Accessible name of the + button. Default "Increase {label}" when label is text, else "Increase". */
  incrementLabel?: string;
  /** `sm` for dense rows like a cart, `md` otherwise. Default `md`. */
  size?: "sm" | "md";
  /** Stable imperfections, shared by server and client. Default generated from useId. */
  seed?: Seed;
}

/** Clamp into [min, max] and snap to the nearest step counted from min. */
function normalize(value: number, min: number, max: number, step: number) {
  const bounded = Math.min(max, Math.max(min, value));
  if (!Number.isFinite(min)) return Number(bounded.toPrecision(12));
  const steps = Math.round((bounded - min) / step);
  const snapped = min + steps * step;
  // Rounding up can overshoot max when the range isn't a whole number of steps: step back once.
  return Number((snapped > max ? snapped - step : snapped).toPrecision(12));
}

/** A quantity stepper (− 2 +): a native number input between two small round stickers. */
export function NumberStepper({
  ref,
  label,
  hideLabel = false,
  value,
  defaultValue,
  min: minProp = 0,
  max: maxProp = Infinity,
  step: stepProp = 1,
  onValueChange,
  decrementLabel,
  incrementLabel,
  onRemove,
  removeLabel = "Remove item",
  removedMessage = "Item removed",
  size = "md",
  seed: seedProp,
  id,
  className,
  style,
  disabled,
  readOnly,
  onChange,
  onKeyDown,
  onBlur,
  ...input
}: NumberStepperProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const autoSeed = useSeed(seedProp);
  const min = Number.isNaN(minProp) ? 0 : minProp;
  const max = Number.isNaN(maxProp) ? Infinity : Math.max(min, maxProp);
  const step = Number.isFinite(stepProp) && stepProp > 0 ? stepProp : 1;
  const initial = normalize(defaultValue ?? (Number.isFinite(min) ? min : 0), min, max, step);
  const [uncontrolled, setUncontrolled] = useState(initial);
  const current = normalize(value ?? uncontrolled, min, max, step);
  // What the person is typing, until it's committed on blur. null when not editing.
  const [draft, setDraft] = useState<string | null>(null);
  // Announced after − and +, whose presses don't move focus to the input.
  const [announcement, setAnnouncement] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const decRef = useRef<HTMLButtonElement>(null);
  const incRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form || value !== undefined) return;
    const reset = (event: Event) => {
      // Wait until other reset listeners have had a chance to cancel the reset.
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        setUncontrolled(initial);
        setDraft(null);
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [value, initial, input.form]);

  const atMin = current <= min;
  const atMax = current >= max;
  const locked = disabled || readOnly;
  // With onRemove, − becomes a trash button at the minimum instead of disabling.
  const removable = onRemove !== undefined && atMin;
  const name = typeof label === "string" || typeof label === "number" ? String(label) : "";

  function commit(next: number) {
    const normalized = normalize(next, min, max, step);
    if (normalized === current) return normalized;
    if (value === undefined) setUncontrolled(normalized);
    onValueChange?.(normalized);
    return normalized;
  }

  function press(direction: -1 | 1) {
    if (locked) return;
    setDraft(null);
    const next = commit(current + direction * step);
    setAnnouncement(String(next));
    // A button that disables under focus would drop focus to the page: hand it to the input instead.
    // With onRemove, − doesn't disable at min (it turns into trash), so focus stays on it.
    const button = direction < 0 ? decRef.current : incRef.current;
    const hitLimit = direction < 0 ? next <= min && !onRemove : next >= max;
    if (hitLimit && button && button === document.activeElement) inputRef.current?.focus();
  }

  function remove() {
    if (locked) return;
    // Announced from document.body, because the row (and this component's live region) usually unmounts next.
    announce(removedMessage);
    onRemove?.();
  }

  function change(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    const text = event.currentTarget.value;
    setDraft(text);
    const typed = event.currentTarget.valueAsNumber;
    // Commit a typed number right away only if it's already in range and on a step; otherwise wait for blur.
    if (Number.isFinite(typed) && normalize(typed, min, max, step) === typed) commit(typed);
  }

  function blur(event: FocusEvent<HTMLInputElement>) {
    onBlur?.(event);
    if (draft === null) return;
    const typed = event.currentTarget.valueAsNumber;
    if (Number.isFinite(typed)) commit(typed);
    setDraft(null);
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || locked) return;
    const base = draft !== null && Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : current;
    let next: number | undefined;
    if (event.key === "ArrowUp") next = base + step;
    else if (event.key === "ArrowDown") next = base - step;
    else if (event.key === "Home" && Number.isFinite(min)) next = min;
    else if (event.key === "End" && Number.isFinite(max)) next = max;
    else if (event.key === "Enter" && draft !== null) {
      // Enter settles what was typed, like leaving the field, without blocking form submit.
      if (Number.isFinite(event.currentTarget.valueAsNumber)) commit(event.currentTarget.valueAsNumber);
      setDraft(null);
      return;
    }
    if (next === undefined) return;
    event.preventDefault();
    setDraft(null);
    commit(next);
  }

  return (
    <div
      className={cx(styles.root, size === "sm" && styles.sm, disabled && styles.disabled, className)}
      style={{ "--stepper-tilt": `${seededTilt(autoSeed, 1.5)}deg`, ...style } as CSSProperties}
    >
      <label className={cx(styles.label, hideLabel && styles.vh)} htmlFor={fieldId}>
        {label}
      </label>
      <div className={styles.control}>
        <IconButton
          ref={decRef}
          icon={removable ? <TrashIcon className={styles.swapIn} /> : <MinusIcon />}
          className={removable ? styles.trash : undefined}
          label={removable ? removeLabel : decrementLabel ?? (name ? `Decrease ${name}` : "Decrease")}
          variant="plain"
          size="sm"
          seed={`${autoSeed}-dec`}
          aria-controls={removable ? undefined : fieldId}
          disabled={locked || (atMin && !removable)}
          onClick={() => (removable ? remove() : press(-1))}
        />
        <span className={styles.box}>
          <input
            {...input}
            ref={inputRef}
            id={fieldId}
            type="number"
            inputMode={Number.isInteger(step) && Number.isInteger(min) ? "numeric" : "decimal"}
            className={styles.input}
            min={Number.isFinite(min) ? min : undefined}
            max={Number.isFinite(max) ? max : undefined}
            step={step}
            value={draft ?? String(current)}
            disabled={disabled}
            readOnly={readOnly}
            onChange={change}
            onBlur={blur}
            onKeyDown={keyDown}
          />
        </span>
        <IconButton
          ref={incRef}
          icon={<PlusIcon />}
          label={incrementLabel ?? (name ? `Increase ${name}` : "Increase")}
          variant="plain"
          size="sm"
          seed={`${autoSeed}-inc`}
          aria-controls={fieldId}
          disabled={locked || atMax}
          onClick={() => press(1)}
        />
      </div>
      <span className={styles.vh} aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
