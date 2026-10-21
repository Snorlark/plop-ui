import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import styles from "./Cards.module.css";

type Tilted = { /** Rotation in degrees. */ tilt?: number };
const tiltStyle = (tilt: number | undefined, style?: CSSProperties) =>
  (tilt === undefined ? style : { "--tilt": `${tilt}deg`, ...style }) as CSSProperties | undefined;

export interface TicketCardProps extends Tilted, Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Small line above the title, e.g. "Ticket #1042, 9:14 AM". */
  meta?: ReactNode;
  title: ReactNode;
  /** The tear-off stub, e.g. "Open". */
  stub?: ReactNode;
  /** Tags, assignee and so on. */
  children?: ReactNode;
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

/** A ticket stub for queue items: the title, a meta line, and a tear-off stub with the state. */
export function TicketCard({ meta, title, stub, children, tilt, headingLevel = 3, className, style, ...rest }: TicketCardProps) {
  const H = `h${headingLevel}` as const;
  return (
    <article {...rest} className={cx(styles.ticket, className)} style={tiltStyle(tilt, style)}>
      <div className={styles.ticketMain}>
        {meta && <span className={styles.ticketId}>{meta}</span>}
        <H className={styles.ticketTitle}>
          <Lettering amp={2.2}>{title}</Lettering>
        </H>
        {children && <div className={styles.ticketMeta}>{children}</div>}
      </div>
      {stub && <div className={styles.stub}>{stub}</div>}
    </article>
  );
}

export interface UnitCardProps extends Tilted, HTMLAttributes<HTMLElement> {
  name: ReactNode;
  subtitle?: ReactNode;
  /** Usually an <Avatar>. */
  avatar?: ReactNode;
  /** Rows: status and ETA, actions. */
  children?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}

/** A taped unit card for people and vehicles. Put `UnitCardRow`s inside for status and actions. */
export function UnitCard({ name, subtitle, avatar, children, tilt, headingLevel = 3, className, style, ...rest }: UnitCardProps) {
  const H = `h${headingLevel}` as const;
  return (
    <article {...rest} className={cx(styles.unit, className)} style={tiltStyle(tilt, style)}>
      <div className={styles.unitTop}>
        {avatar}
        <div>
          <H className={styles.unitName}>
            <Lettering amp={2.2}>{name}</Lettering>
          </H>
          {subtitle && <span className={styles.unitSub}>{subtitle}</span>}
        </div>
      </div>
      {children}
    </article>
  );
}

/** A spaced row inside a UnitCard. */
export function UnitCardRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.unitRow, className)}>{children}</div>;
}

/** A big lettered number with a unit: "6 min away". */
export function Eta({ value, unit }: { value: ReactNode; unit: ReactNode }) {
  return (
    <span className={styles.eta}>
      {value}
      <small>{unit}</small>
    </span>
  );
}

export interface StickyNoteProps extends Tilted, HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Small line at the bottom, e.g. "Added by dispatcher Ana, 9:06 AM". */
  footer?: ReactNode;
  /** Paper color of the note. Default `mustard`. */
  tone?: "mustard" | "pink" | "mint";
}

/** A sticky note taped to the page, for quick context. */
export function StickyNote({ children, footer, tone = "mustard", tilt, className, style, ...rest }: StickyNoteProps) {
  return (
    <aside {...rest} className={cx(styles.sticky, tone !== "mustard" && styles[tone], className)} style={tiltStyle(tilt, style)}>
      <div className={styles.stickyBody}>{children}</div>
      {footer && <small className={styles.stickyFoot}>{footer}</small>}
    </aside>
  );
}
