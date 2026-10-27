<p align="center"><img src="https://plopui.com/plop-logo.png" alt="PlopUI" width="300"></p>

<p align="center"><strong>Sketchpop: the hand-drawn marker font behind PlopUI.</strong><br>Every letter drawn three times, so repeats never look copy-pasted.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@plop-ui/fonts"><img src="https://img.shields.io/npm/v/@plop-ui/fonts?label=%40plop-ui%2Ffonts&color=2848D8" alt="npm version"></a>
  <a href="https://plopui.com/playground?tool=lettering"><img src="https://img.shields.io/badge/try%20it-Lettering%20studio-F6C445" alt="Try it in the Lettering studio"></a>
  <img src="https://img.shields.io/badge/license-SIL%20OFL%201.1-2848D8" alt="SIL Open Font License 1.1">
</p>

**Sketchpop** is the lettering of [PlopUI](https://plopui.com), the hand-drawn React UI kit that's imperfect on purpose. Four weights, Light (300), Regular (400), Bold (700) and Black (900), each italic and upright, as woff2 with ttf fallbacks. Every letter has three hand-drawn versions that rotate through the `calt` feature, so a word like "Shipped!" never repeats the same p twice.

<p align="center"><img src="https://plopui.com/readme/fonts.png" alt="Sketchpop specimen: the name in Black Italic, then Light, Regular, Bold and Black lines, and a Plop! sticker" width="100%"></p>

## Install

```sh
npm i @plop-ui/fonts
# or: pnpm add @plop-ui/fonts / yarn add @plop-ui/fonts / bun add @plop-ui/fonts
```

## Use it

Any bundler that handles CSS imports (Vite, webpack, Next.js):

```css
@import "@plop-ui/fonts/fonts.css";

h1 {
  font-family: "Sketchpop", "Patrick Hand", cursive;
  font-weight: 900;
  font-style: italic;
}
```

With [`@plop-ui/react`](https://www.npmjs.com/package/@plop-ui/react), import `@plop-ui/fonts/fonts.css` once at your app's root and every component uses it.

**Next.js:** self-host it with `next/font/local` instead, and expose it as `--plop-sketchpop` (every PlopUI font token reads that variable first):

```ts
import localFont from "next/font/local";

export const sketchpop = localFont({
  variable: "--plop-sketchpop",
  display: "swap",
  src: [
    { path: "../node_modules/@plop-ui/fonts/files/sketchpop-regular.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@plop-ui/fonts/files/sketchpop-bold-italic.woff2", weight: "700", style: "italic" },
    { path: "../node_modules/@plop-ui/fonts/files/sketchpop-black-italic.woff2", weight: "900", style: "italic" },
  ],
});
```

Then put `sketchpop.variable` on `<html>`. The full setup is in [Using with Next.js](https://plopui.com/docs/nextjs).

## What's inside

| | |
| --- | --- |
| **Weights** | Light 300, Regular 400, Bold 700, Black 900, each italic and upright |
| **Files** | `files/sketchpop-*.woff2` and `.ttf`, plus `fonts.css` with every `@font-face` |
| **Coverage** | A–Z, a–z, 0–9 and `. , ! ? ' " - : ; ( ) / + = & * #` |
| **Fallback** | Anything else (ñ, curly quotes, @, %) falls back to Patrick Hand, which the PlopUI font stacks already include |
| **Alternates** | 3 versions of every letter, rotated by the `calt` feature (on by default) |

Want to see a word in it first? Letter anything in the [Lettering studio](https://plopui.com/playground?tool=lettering) and export it as React, HTML, SVG or PNG.

## Rebuilding the font

`tools/build-font.py` regenerates all 8 styles from the skeletons in `tools/skeletons.py` (`pip install fonttools shapely brotli`). In `build_glyph`: `wob` = hand wobble, `rot` = letter tilt, `lift` = baseline bounce, `S = H * .86` = width, `sb` = letter spacing. `SLANT` sets the italic angle.

## License

Sketchpop is licensed under the [SIL Open Font License 1.1](https://openfontlicense.org) (see `OFL.txt`): free to use, embed and ship in your apps and products. Designed by Lark Sigmuond Babao.

**Links:** [plopui.com](https://plopui.com) · [`@plop-ui/react`](https://www.npmjs.com/package/@plop-ui/react) · [`@plop-ui/tokens`](https://www.npmjs.com/package/@plop-ui/tokens) · [Changelog](https://plopui.com/changelog)
