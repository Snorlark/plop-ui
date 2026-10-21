import { Patrick_Hand } from "next/font/google";
import localFont from "next/font/local";

/**
 * Sketchpop, self-hosted from packages/fonts by next/font. Exposed as
 * --plop-sketchpop, which every Plop! font token reads before falling back
 * to the plain "Sketchpop" family name.
 */
export const sketchpop = localFont({
  variable: "--plop-sketchpop",
  display: "swap",
  src: [
    { path: "../../../packages/fonts/files/sketchpop-light.woff2", weight: "300", style: "normal" },
    { path: "../../../packages/fonts/files/sketchpop-light-italic.woff2", weight: "300", style: "italic" },
    { path: "../../../packages/fonts/files/sketchpop-regular.woff2", weight: "400", style: "normal" },
    { path: "../../../packages/fonts/files/sketchpop-regular-italic.woff2", weight: "400", style: "italic" },
    { path: "../../../packages/fonts/files/sketchpop-bold.woff2", weight: "700", style: "normal" },
    { path: "../../../packages/fonts/files/sketchpop-bold-italic.woff2", weight: "700", style: "italic" },
    { path: "../../../packages/fonts/files/sketchpop-black.woff2", weight: "900", style: "normal" },
    { path: "../../../packages/fonts/files/sketchpop-black-italic.woff2", weight: "900", style: "italic" },
  ],
});

/** Per-character fallback for anything Sketchpop doesn't cover (ñ, curly quotes, @, %). */
export const patrickHand = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--plop-patrick-hand", display: "swap" });
