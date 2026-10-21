import type { CSSProperties, ReactNode } from "react";
import { ErrorIcon, InfoIcon, SuccessIcon, WarnIcon } from "../icons.js";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import styles from "./Callout.module.css";

export type CalloutTone = "info" | "warn" | "error" | "success";

export interface CalloutProps {
  title: ReactNode;
  children?: ReactNode;
  /** Default `info`. */
  tone?: CalloutTone;
  /** A button under the text, e.g. "Try again". */
  action?: ReactNode;
  /** Rotation in degrees. Default -0.5. */
  tilt?: number;
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** `alert` for errors that need attention right away. Default: none (it is just content). */
  role?: "alert" | "status";
  className?: string;
}

const ICONS: Record<CalloutTone, ReactNode> = { info: <InfoIcon />, warn: <WarnIcon />, error: <ErrorIcon />, success: <SuccessIcon /> };

/** A strip torn off a pad. Use it for things people need to know before they act, not for decoration. */
export function Callout({ title, children, tone = "info", action, tilt, headingLevel = 3, role, className }: CalloutProps) {
  const H = `h${headingLevel}` as const;
  return (
    <div className={cx(styles.root, tone !== "info" && styles[tone], className)} role={role} style={tilt === undefined ? undefined : ({ "--tilt": `${tilt}deg` } as CSSProperties)}>
      {ICONS[tone]}
      <div>
        <H className={styles.title}>
          <Lettering amp={2.2}>{title}</Lettering>
        </H>
        {children && <div className={styles.body}>{children}</div>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}
