import type { Metadata } from "next";
import { LoadingBoard } from "./LoadingBoard";

export const metadata: Metadata = { title: "Loading stress test", robots: { index: false, follow: false } };

/** Every loading piece, many times over. e2e/loading.spec.ts measures it. */
export default function LoadingStressPage() {
  return <LoadingBoard />;
}
