import { Patrick_Hand } from "next/font/google";
import localFont from "next/font/local";

/** Sketchpop, self-hosted from packages/fonts by next/font (same setup as the docs site). */
export const sketchpop = localFont({
  variable: "--plop-sketchpop",
  display: "swap",
  src: [
    { path: "../../../packages/fonts/files/sketchpop-regular.woff2", weight: "400", style: "normal" },
    { path: "../../../packages/fonts/files/sketchpop-regular-italic.woff2", weight: "400", style: "italic" },
    { path: "../../../packages/fonts/files/sketchpop-bold.woff2", weight: "700", style: "normal" },
    { path: "../../../packages/fonts/files/sketchpop-bold-italic.woff2", weight: "700", style: "italic" },
    { path: "../../../packages/fonts/files/sketchpop-black-italic.woff2", weight: "900", style: "italic" },
  ],
});

/** Per-character fallback for anything Sketchpop doesn't cover. */
export const patrickHand = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--plop-patrick-hand", display: "swap" });
