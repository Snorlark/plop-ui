"use client";

import { Pagination } from "@plop-ui/react";
import { useState } from "react";

export function PaginationExample() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pageCount={20} onPageChange={setPage} />;
}
