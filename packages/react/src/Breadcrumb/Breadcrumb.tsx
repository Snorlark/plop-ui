"use client";

import { useState, type ComponentPropsWithRef, type ElementType, type ReactNode } from "react";
import { cx } from "../internal/cx.js";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  /** The visible name of this location. */
  label: ReactNode;
  /** Ancestor destination. Ignored on the final (current) item. */
  href?: string;
}

export interface BreadcrumbProps extends Omit<ComponentPropsWithRef<"nav">, "children"> {
  /** Locations in hierarchy order; the last item is always the current page. */
  items: readonly BreadcrumbItem[];
  /** Your router's link component, e.g. Next.js `Link`. Default `a`. */
  as?: ElementType;
  /** Collapse intermediate items below 520px of available width. Default `true`. */
  collapse?: boolean;
  /** Accessible name for the collapsed trail's disclosure. Default `Show intermediate pages`. */
  expandLabel?: string;
  /** Accessible name when intermediate pages are visible. Default `Hide intermediate pages`. */
  collapseLabel?: string;
}

/** A trail of hand-drawn chevrons; ancestors are links and the current page is plain text. */
export function Breadcrumb({
  items, as: Link = "a", collapse = true,
  expandLabel = "Show intermediate pages", collapseLabel = "Hide intermediate pages",
  className, "aria-label": ariaLabel = "Breadcrumb", ...props
}: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const collapsible = collapse && items.length > 2;
  return (
    <nav {...props} aria-label={ariaLabel} className={cx(styles.root, className)}>
      <ol className={cx(styles.list, collapsible && styles.collapsible)} data-expanded={expanded ? "" : undefined}>
        {items.map((item, index) => (
          <li key={index} className={cx(styles.item, index > 0 && index < items.length - 1 && styles.middle)}>
            {index > 0 && <Chevron />}
            {index === items.length - 1
              ? <span className={styles.current} aria-current="page">{item.label}</span>
              : item.href
                ? <Link className={styles.link} href={item.href}><span>{item.label}</span></Link>
                : <span className={styles.label}>{item.label}</span>}
          </li>
        )).flatMap((item, index) => index === 0 && collapsible ? [item,
          <li key="disclosure" className={styles.disclosure}>
            <Chevron />
            <button type="button" className={styles.toggle} aria-label={expanded ? collapseLabel : expandLabel}
              aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
              <span aria-hidden="true">…</span>
            </button>
          </li>,
        ] : [item])}
      </ol>
    </nav>
  );
}

function Chevron() {
  return (
    <svg className={styles.separator} viewBox="0 0 12 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M3.5 4.5C5.5 7 7.4 8.6 8.8 10.2C7.2 12 5.6 13.6 3.8 15.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
