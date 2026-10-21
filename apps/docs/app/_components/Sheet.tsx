import type { ReactNode } from "react";

/** A taped sheet of paper for live demos. */
export function Sheet({ children, tape = "mustard" }: { children: ReactNode; tape?: "mustard" | "pink" | "blue" | "mint" }) {
  return <div className={`sheet plop-paper${tape === "mustard" ? "" : ` sheet--${tape}`}`}>{children}</div>;
}
