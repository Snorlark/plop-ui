"use client";

import { Pagination, type PaginationProps } from "@plop-ui/react";
import { useEffect, useRef, useState } from "react";

type Props = { initialPage?: number; pageCount?: number; disabled?: boolean; label?: string; slowFetch?: boolean } & Pick<PaginationProps, "variant" | "showEnds" | "loading">;

/** label names the nav (and its caption) when a page shows several; slowFetch fakes a 900ms fetch after each pick. */
export function PaginationDemo({ initialPage = 1, pageCount = 20, disabled = false, label, slowFetch = false, loading = false, ...props }: Props) {
  const [page, setPage] = useState(Math.min(pageCount, initialPage));
  const [fetching, setFetching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const pick = (next: number) => {
    setPage(next);
    if (!slowFetch) return;
    setFetching(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFetching(false), 900);
  };
  return (
    <div style={{ width: "100%" }}>
      <p style={{ color: "var(--plop-on-soft)", marginBottom: 16 }} aria-live="polite">{label ? `${label}: ` : ""}Page {page} of {pageCount}</p>
      <Pagination {...props} aria-label={label} loading={loading || fetching} page={page} pageCount={pageCount} onPageChange={pick} disabled={disabled} />
    </div>
  );
}
