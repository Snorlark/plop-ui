"use client";

import { useId, type ReactNode } from "react";
import styles from "./tools.module.css";

const SWATCH_LABEL: Record<string, string> = {
  ink: "Ink blue",
  tomato: "Tomato",
  mustard: "Mustard",
  mint: "Mint",
  periwinkle: "Periwinkle",
  bubblegum: "Bubblegum",
  plain: "Plain paper",
  paper: "Paper",
};

/** Color chips as native radios: arrow keys move between them. */
export function Swatches({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const name = useId();
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.swatches}>
        {options.map((o) => (
          <label key={o} className={styles.swatch} title={SWATCH_LABEL[o] ?? o}>
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} />
            <span style={{ background: o === "plain" || o === "paper" ? "var(--plop-paper)" : `var(--plop-${o})` }} />
            <span className="vh">{SWATCH_LABEL[o] ?? o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A short list of words to pick one from, as pill radios. */
export function Choice({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, ReactNode]>; onChange: (v: string) => void }) {
  const name = useId();
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.pills}>
        {options.map(([v, text]) => (
          <label key={v} className={styles.pill}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A labelled range slider that shows its value. */
export function Slider({ label, value, min, max, step = 1, unit = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} <output htmlFor={id}>{`${Math.round(value * 100) / 100}${unit}`}</output>
      </label>
      <input id={id} className={styles.range} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

/** A plain text field in the kit's look (native input). */
export function Text({ label, value, onChange, maxLength = 40 }: { label: string; value: string; onChange: (v: string) => void; maxLength?: number }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input id={id} className={styles.text} type="text" value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
