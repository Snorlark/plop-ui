import type { ComponentPropsWithRef, ElementType } from "react";
import { cx } from "../internal/cx.js";
import type { Seed } from "../seed.js";
import { Spinner } from "../Spinner/Spinner.js";
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
  /** `full` shows page numbers. `compact` shows "2 of 17" between Previous and Next, for cards and toolbars. Default `full`. */
  variant?: "full" | "compact";
  /** Add First and Last controls, for long lists where people jump to the ends. Default `false`. */
  showEnds?: boolean;
  /** The current page is still fetching: it shows a spinner and the nav is `aria-busy`. Other pages stay usable. Default `false`. */
  loading?: boolean;
  /** Screen reader text while loading. Default `Loading`. */
  loadingLabel?: string;
  /** Disable all navigation. Default `false`. */
  disabled?: boolean;
  /** Previous control label. Default `Previous`. */
  previousLabel?: string;
  /** Next control label. Default `Next`. */
  nextLabel?: string;
  /** First control label, with showEnds. Default `First`. */
  firstLabel?: string;
  /** Last control label, with showEnds. Default `Last`. */
  lastLabel?: string;
  /** Accessible name for each numbered page. Default n => `Page ${n}`. */
  getPageLabel?: (page: number) => string;
  /** The compact variant's count. Default (page, count) => `${page} of ${count}`. */
  formatCount?: (page: number, pageCount: number) => string;
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

type Rel = "prev" | "next" | "first" | "last";

/** Small stickers for a long list. Link mode can be composed on the server; event handlers live in client controls. */
export function Pagination({
  page, pageCount, onPageChange, href, as, variant = "full", showEnds = false, loading = false, loadingLabel = "Loading",
  disabled = false, previousLabel = "Previous", nextLabel = "Next", firstLabel = "First", lastLabel = "Last",
  getPageLabel, formatCount, seed = "pagination", className, "aria-label": label = "Pagination", ...nav
}: PaginationProps) {
  const count = Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
  if (count === 0) return null;
  const current = Number.isFinite(page) ? Math.min(count, Math.max(1, Math.floor(page))) : 1;
  function control(target: number, text: string, accessible: string, unavailable = false, rel?: Rel) {
    const isCurrent = target === current && !rel;
    return <PaginationControl page={target} label={accessible} current={isCurrent} loading={loading && isCurrent} loadingLabel={loadingLabel}
      className={styles.control} disabled={disabled || unavailable} href={!disabled && !unavailable ? href?.(target) : undefined} as={as}
      onPageChange={onPageChange} seed={`${seed}-${rel ?? target}`} rel={rel === "prev" || rel === "next" ? rel : undefined}>{text}</PaginationControl>;
  }
  return (
    <nav {...nav} aria-label={label} aria-busy={loading || undefined} className={cx(styles.root, className)}>
      <ul className={styles.list}>
        {showEnds && <li>{control(1, firstLabel, firstLabel, current === 1, "first")}</li>}
        <li>{control(current - 1, previousLabel, previousLabel, current === 1, "prev")}</li>
        {variant === "compact"
          ? (
            <li className={styles.count}>
              {formatCount?.(current, count) ?? `${current} of ${count}`}
              {loading && <Spinner kind="dots" size="sm" label={loadingLabel} />}
            </li>
          )
          : pages(current, count).map((item) => (
            <li key={item}>
              {typeof item === "number"
                ? control(item, String(item), getPageLabel?.(item) ?? `Page ${item}`)
                : <span className={styles.gap} aria-hidden="true">…</span>}
            </li>
          ))}
        <li>{control(current + 1, nextLabel, nextLabel, current === count, "next")}</li>
        {showEnds && <li>{control(count, lastLabel, lastLabel, current === count, "last")}</li>}
      </ul>
    </nav>
  );
}
