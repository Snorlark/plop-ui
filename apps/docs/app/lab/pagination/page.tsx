import type { Metadata } from "next";
import { PaginationBoard } from "./PaginationBoard";

export const metadata: Metadata = { title: "Pagination lab", robots: { index: false, follow: false } };

/** Every Pagination variant, state and recipe, plus narrow, stretched, surface and mass stress. e2e/pagination-lab.spec.ts drives it. */
export default function PaginationLabPage() {
  return <PaginationBoard />;
}
