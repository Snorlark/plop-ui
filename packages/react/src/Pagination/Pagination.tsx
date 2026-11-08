import type { ComponentPropsWithRef, ElementType } from "react";
import { cx } from "../internal/cx.js";
import type { Seed } from "../seed.js";
import { PaginationControl } from "./PaginationControl.js";
import styles from "./Pagination.module.css";

export interface PaginationProps extends Omit<ComponentPropsWithRef<"nav">, "children" | "onChange"> {
  /** Current page, starting at 1. Values outside the range are clamped. */
  page: number;
  /** Total number of pages. Zero renders no pagination. */
  pageCount: number;
  /** Called when a different page is activated. Required for button-mode navigation. */
  onPageChange?: (page: number) => void;
  /** Build a destination for each page to render links instead of buttons. */
  href?: (page: number) => string;
  /** Router link component, e.g. Next.js Link. Default `a`. Used with href. */
  as?: ElementType;
  /** Disable all navigation. Default `false`. */
  disabled?: boolean;
  /** Previous control label. Default `Previous`. */
  previousLabel?: string;
  /** Next control label. Default `Next`. */
  nextLabel?: string;
  /** Accessible name for each numbered page. Default n => `Page ${n}`. */
  getPageLabel?: (page: number) => string;
  /** Stable sticker tilts. Default `pagination`. */
  seed?: Seed;
}

/** A bounded page window: first, last and neighbours, with decorative gaps. */
function pages(page: number, count: number): Array<number | string> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(page - 1, count - 3));
  const end = Math.min(count - 1, Math.max(page + 1, 4));
  const selected = [1];
  for (let i = start; i <= end; i++) selected.push(i);
  selected.push(count);
  return selected.flatMap((value, i) => {
    const before = selected[i - 1];
    if (before === undefined || value - before === 1) return [value];
    return value - before === 2 ? [before + 1, value] : [`gap-${before}`, value];
  });
}

/** Small stickers for a long list. Link mode can be composed on the server; event handlers live in client controls. */
export function Pagination({
  page, pageCount, onPageChange, href, as, disabled = false,
  previousLabel = "Previous", nextLabel = "Next", getPageLabel,
  seed = "pagination", className, "aria-label": label = "Pagination", ...nav
}: PaginationProps) {
  const count = Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
  if (count === 0) return null;
  const current = Number.isFinite(page) ? Math.min(count, Math.max(1, Math.floor(page))) : 1;
  function control(target: number, text: string, accessible: string, unavailable = false, rel?: "prev" | "next") {
    return <PaginationControl page={target} label={accessible} current={target === current && !rel}
      className={styles.control} disabled={disabled || unavailable} href={!disabled && !unavailable ? href?.(target) : undefined} as={as}
      onPageChange={onPageChange} seed={`${seed}-${rel ?? target}`} rel={rel}>{text}</PaginationControl>;
  }
  return (
    <nav {...nav} aria-label={label} className={cx(styles.root, className)}>
      <ul className={styles.list}>
        <li>{control(current - 1, previousLabel, previousLabel, current === 1, "prev")}</li>
        {pages(current, count).map((item) => (
          <li key={item}>
            {typeof item === "number"
              ? control(item, String(item), getPageLabel?.(item) ?? `Page ${item}`)
              : <span className={styles.gap} aria-hidden="true">…</span>}
          </li>
        ))}
        <li>{control(current + 1, nextLabel, nextLabel, current === count, "next")}</li>
      </ul>
    </nav>
  );
}
