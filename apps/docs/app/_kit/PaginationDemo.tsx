"use client";

import { Pagination } from "@plop-ui/react";
import { useState } from "react";

export function PaginationDemo({ initialPage = 1, pageCount = 20, disabled = false }: { initialPage?: number; pageCount?: number; disabled?: boolean }) {
  const [page, setPage] = useState(Math.min(pageCount, initialPage));
  return (
    <div style={{ width: "100%" }}>
      <p style={{ color: "var(--plop-on-soft)", marginBottom: 16 }} aria-live="polite">Page {page} of {pageCount}</p>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} disabled={disabled} />
    </div>
  );
}
