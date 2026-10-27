import { useId, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import { ErrorIcon } from "../icons.js";
import { cx } from "../internal/cx.js";
import styles from "./TextField.module.css";

interface FieldOwnProps {
  /** The visible label. Required: every field needs a name. */
  label: ReactNode;
  /** Help under the field. */
  hint?: ReactNode;
  /** An error that says how to fix it. Turns the field tomato and sets aria-invalid. */
  error?: ReactNode;
  /** Shows a green tick when the value is good. */
  success?: boolean;
  /** Extra class on the field wrapper (label, box and hint), not the input itself. */
  className?: string;
}

function Field({
  id,
  label,
  hint,
  error,
  success,
  required,
  className,
  children,
}: FieldOwnProps & { id: string; required?: boolean; children: (described: string | undefined) => ReactNode }) {
  const hintId = `${id}-hint`;
  const message = error ?? hint;
  return (
    <div className={cx(styles.field, error ? styles.error : success && styles.ok, className)}>
      <label className={styles.label} htmlFor={id}>
        <span>
          {label}
          {required && (
            <span className={styles.req} aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>
      <div className={styles.box}>{children(message ? hintId : undefined)}</div>
      {message && (
        <p className={styles.hint} id={hintId}>
          {error ? <ErrorIcon /> : null}
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}

export interface TextFieldProps extends FieldOwnProps, Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  ref?: Ref<HTMLInputElement>;
}

/** A labeled text input. Focus swipes a highlighter across the label and makes the outline boil. */
export function TextField({ ref, label, hint, error, success, className, id, ...input }: TextFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} success={success} required={input.required} className={className}>
      {(described) => (
        <input
          {...input}
          ref={ref}
          id={fieldId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(input["aria-describedby"], described) || undefined}
        />
      )}
    </Field>
  );
}

export interface TextAreaProps extends FieldOwnProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  ref?: Ref<HTMLTextAreaElement>;
  /** Notebook lines behind the text. Default true. */
  ruled?: boolean;
}

/** A labeled multi-line field on ruled notebook paper. */
export function TextArea({ ref, label, hint, error, success, className, id, ruled = true, ...area }: TextAreaProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} success={success} required={area.required} className={className}>
      {(described) => (
        <textarea
          {...area}
          ref={ref}
          id={fieldId}
          className={cx(styles.input, ruled && styles.ruled)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(area["aria-describedby"], described) || undefined}
        />
      )}
    </Field>
  );
}
