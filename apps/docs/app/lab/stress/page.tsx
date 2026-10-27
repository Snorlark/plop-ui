import type { Metadata } from "next";
import { StressBoard } from "./StressBoard";

export const metadata: Metadata = { title: "Stress test", robots: { index: false, follow: false } };

/** Components the way apps really place them: stretched by grid and flex parents, in light and dark. e2e/stress.spec.ts reads it. */
export default function StressPage() {
  return <StressBoard />;
}
