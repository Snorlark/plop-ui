# @plop-ui/fonts

**Sketchpop**, the hand-drawn marker family Plop! is lettered in: Light (300), Regular (400), Bold (700) and Black (900), each italic and upright, as woff2. Each letter has 3 hand-drawn versions that rotate through the `calt` feature so repeats never look copy-pasted.

```css
@import "@plop-ui/fonts/fonts.css";
```

In Next.js, load the files with `next/font/local` instead and expose the family as `--plop-sketchpop` (see the docs site's `app/fonts.ts`).

Covers A–Z, a–z, 0–9 and `. , ! ? ' " - : ; ( ) / + = & * #`. Anything else (ñ, curly quotes, @, %) falls back to Patrick Hand, which the token font stacks already include.

Licensed under the SIL Open Font License 1.1 — see `OFL.txt`.

## Rebuilding the font

`tools/build-font.py` regenerates all 8 weights from the skeletons in `tools/skeletons.py` (`pip install fonttools shapely brotli`). In `build_glyph`: `wob` = hand wobble, `rot` = letter tilt, `lift` = baseline bounce, `S = H * .86` = width, `sb` = letter spacing. `SLANT` sets the italic angle.
