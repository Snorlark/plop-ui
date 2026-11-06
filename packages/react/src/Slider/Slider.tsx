"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cx } from "../internal/cx.js";
import { useSeed } from "../internal/useSeed.js";
import { seed, seededTilt, type Seed } from "../seed.js";
import styles from "./Slider.module.css";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children" | "value" | "defaultValue" | "min" | "max" | "step" | "size" | "readOnly" | "required"> {
  ref?: Ref<HTMLInputElement>;
  /** Visible label associated with the native range input. */
  label: ReactNode;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Default the midpoint of min and max. */
  defaultValue?: number;
  /** Lowest value. Default 0. */
  min?: number;
  /** Highest value. Default 100. */
  max?: number;
  /** Step measured from min, or `any` for continuous values. Default 1. */
  step?: number | "any";
  /** Called with the new numeric value after the native onChange event. */
  onValueChange?: (value: number) => void;
  /** Display the value beside the label. Default `false`. */
  showValue?: boolean;
  /** Format the displayed value and aria-valuetext, e.g. v => `${v}×`. */
  formatValue?: (value: number) => string;
  /** Marker color of the filled part. Default `ink`. */
  tone?: SliderTone;
  /** Ruler ticks under the track: `true` marks every step (or tenths past 20 steps), a number sets how many gaps. Default `false`. */
  ticks?: boolean | number;
  /** Stable imperfections, shared by server and client. Default generated from useId. */
  seed?: Seed;
}

export type SliderTone = "ink" | "tomato" | "mustard" | "mint" | "periwinkle" | "bubblegum";

const ADJUST_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]);

/** Clamp and align the visual value with the native range's stepping rules. */
function normalize(value: number, min: number, max: number, step: number | "any") {
  const bounded = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min + (max - min) / 2));
  if (step === "any") return bounded;
  const steps = Math.min(Math.round((bounded - min) / step), Math.floor((max - min) / step + 1e-10));
  return Number((min + steps * step).toPrecision(12));
}

/** A native range with a marker track and a paper-edged sticker thumb. */
export function Slider({
  ref, label, value, defaultValue, min = 0, max = 100, step = 1,
  onValueChange, onChange, showValue = false, formatValue, tone = "ink", ticks = false, seed: seedProp,
  className, style, id, dir, disabled, onKeyDown, onKeyUp, onBlur, ...input
}: SliderProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const autoSeed = useSeed(seedProp);
  const random = seed(autoSeed);
  const track = `M0 10 C80 ${8 + random() * 4}, 210 ${8 + random() * 4}, 300 10`;
  const lower = Number.isFinite(min) ? min : 0;
  const upper = Number.isFinite(max) ? Math.max(lower, max) : Math.max(lower, 100);
  const increment = step === "any" || (Number.isFinite(step) && step > 0) ? step : 1;
  const initial = normalize(defaultValue ?? lower + (upper - lower) / 2, lower, upper, increment);
  const [uncontrolled, setUncontrolled] = useState(initial);
  const [pressed, setPressed] = useState(false);
  const current = normalize(value ?? uncontrolled, lower, upper, increment);
  const ratio = upper > lower ? (current - lower) / (upper - lower) : 0;
  const text = formatValue?.(current) ?? String(current);
  const steps = increment === "any" ? Infinity : (upper - lower) / increment;
  const gaps = typeof ticks === "number" ? Math.min(100, Math.max(1, Math.round(ticks))) : ticks ? (Number.isInteger(steps) && steps <= 20 ? steps : 10) : 0;
  // Drawn by hand: each tick a little taller or shorter, a touch off vertical.
  const tickMarks = Array.from({ length: gaps > 0 ? gaps + 1 : 0 }, (_, i) => ({
    at: i / gaps,
    major: i === 0 || i === gaps || i * 2 === gaps,
    h: 5 + random() * 3,
    r: (random() - 0.5) * 8,
  }));
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form || value !== undefined) return;
    const reset = (event: Event) => {
      // Wait until other reset listeners have had a chance to cancel the reset.
      queueMicrotask(() => { if (!event.defaultPrevented) setUncontrolled(initial); });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [value, initial, input.form]);

  function change(event: ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.valueAsNumber;
    if (value === undefined) setUncontrolled(next);
    onChange?.(event);
    onValueChange?.(next);
  }

  return (
    <div className={cx(styles.root, styles[tone], className)} style={{ "--slider-tilt": `${seededTilt(autoSeed, 5)}deg`, ...style } as CSSProperties} dir={dir}>
      <div className={styles.top}>
        <label className={styles.label} htmlFor={fieldId}>{label}</label>
        {showValue && <output className={styles.value} htmlFor={fieldId} aria-hidden="true">{text}</output>}
      </div>
      <div className={styles.control} data-ticks={gaps > 0 ? "" : undefined}>
        {gaps > 0 && (
          <span className={styles.ticks} aria-hidden="true">
            {tickMarks.map((t, i) => (
              <span key={i} data-major={t.major ? "" : undefined} style={{ "--at": t.at, "--h": `${t.major ? t.h + 4 : t.h}px`, "--r": `${t.r}deg` } as CSSProperties} />
            ))}
          </span>
        )}
        {/* The wobble filter goes on this span, not the svg: WebKit squashes non-scaling strokes to a hairline under an svg filter. */}
        <span className={styles.track} aria-hidden="true">
          <svg viewBox="0 0 300 20" preserveAspectRatio="none" focusable="false">
            <defs>
              <clipPath id={`${autoId}-fill`} clipPathUnits="userSpaceOnUse">
                <rect x="-10" y="-10" width={ratio * 300 + 10 + (ratio === 1 ? 10 : 0)} height="40" />
              </clipPath>
            </defs>
            <path className={styles.outline} d={track} />
            <path className={styles.paper} d={track} />
            <path className={styles.fill} d={track} clipPath={`url(#${autoId}-fill)`} visibility={ratio === 0 ? "hidden" : undefined} />
          </svg>
        </span>
        <input {...input} ref={inputRef} id={fieldId} type="range" className={styles.input}
          min={lower} max={upper} step={increment} value={current} disabled={disabled}
          aria-valuetext={input["aria-valuetext"] ?? (formatValue ? text : undefined)}
          data-pressed={pressed ? "" : undefined} onChange={change}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!event.defaultPrevented && ADJUST_KEYS.has(event.key)) setPressed(true);
          }}
          onKeyUp={(event) => { setPressed(false); onKeyUp?.(event); }}
          onBlur={(event) => { setPressed(false); onBlur?.(event); }}
        />
      </div>
    </div>
  );
}
