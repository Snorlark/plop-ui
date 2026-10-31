import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Lettering } from "../Lettering/Lettering.js";
import { Skeleton } from "../Skeleton/Skeleton.js";
import styles from "./Cards.module.css";

type Tilted = {
  /** Rotation in degrees. Leave it out for the card's own small tilt. */
  tilt?: number;
};
const tiltStyle = (tilt: number | undefined, style?: CSSProperties) =>
  (tilt === undefined ? style : { "--tilt": `${tilt}deg`, ...style }) as CSSProperties | undefined;

export interface TicketCardProps extends Tilted, Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Small line above the title, e.g. "Sketch #1042, 9:14 AM". */
  meta?: ReactNode;
  /** The ticket's title, lettered in Sketchpop. */
  title: ReactNode;
  /** Still on its way: the same card with paper scraps for the words, `aria-busy` and read out as "Loading". */
  loading?: boolean;
  /** The tear-off stub, e.g. "Open". */
  stub?: ReactNode;
  /** Tags, assignee and so on. */
  children?: ReactNode;
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

/** A ticket stub for queue items: the title, a meta line, and a tear-off stub with the state. */
export function TicketCard({ meta, title, stub, children, tilt, headingLevel = 3, loading = false, className, style, ...rest }: TicketCardProps) {
  const H = `h${headingLevel}` as const;
  if (loading) {
    return (
      <article {...rest} className={cx(styles.ticket, className)} style={tiltStyle(tilt, style)} aria-busy="true">
        <div className={styles.ticketMain}>
          <Skeleton width="38%" height={12} />
          <H className={styles.ticketTitle}>
            <span className={styles.vh}>Loading</span>
            <Skeleton shape="title" width="72%" />
          </H>
          <div className={styles.ticketMeta}>
            <Skeleton shape="pill" />
          </div>
        </div>
        <div className={styles.stub} aria-hidden="true" />
      </article>
    );
  }
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
  /** The person's or project's name, lettered in Sketchpop. */
  name: ReactNode;
  /** Still on its way: a loading avatar and paper scraps for the words, `aria-busy` and read out as "Loading". */
  loading?: boolean;
  /** A small line under the name, e.g. a role. */
  subtitle?: ReactNode;
  /** Usually an <Avatar>. */
  avatar?: ReactNode;
  /** Rows: status and ETA, actions. */
  children?: ReactNode;
  /** Heading level of the name. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

/** A taped unit card for people and projects. Put `UnitCardRow`s inside for status and actions. */
export function UnitCard({ name, subtitle, avatar, children, tilt, headingLevel = 3, loading = false, className, style, ...rest }: UnitCardProps) {
  const H = `h${headingLevel}` as const;
  if (loading) {
    return (
      <article {...rest} className={cx(styles.unit, className)} style={tiltStyle(tilt, style)} aria-busy="true">
        <div className={styles.unitTop}>
          <Skeleton shape="circle" width={52} height={52} />
          <div className={styles.loadingLines}>
            <H className={styles.unitName}>
              <span className={styles.vh}>Loading</span>
              <Skeleton shape="title" width="70%" />
            </H>
            <Skeleton width="45%" height={12} />
          </div>
        </div>
        <Skeleton width="100%" height={12} />
      </article>
    );
  }
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

/** A big lettered number with a unit: "6 min left". */
export function Eta({ value, unit }: { value: ReactNode; unit: ReactNode }) {
  return (
    <span className={styles.eta}>
      {value}
      <small>{unit}</small>
    </span>
  );
}

export interface StickyNoteProps extends Tilted, HTMLAttributes<HTMLElement> {
  /** What the note says. */
  children: ReactNode;
  /** Small line at the bottom, e.g. "Added by Ana, 9:06 AM". */
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
