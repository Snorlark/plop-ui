<p align="center"><img src="https://plopui.com/plop-logo.png" alt="PlopUI" width="300"></p>

<p align="center"><strong>The colors, papers, type and motion behind PlopUI.</strong><br>Hand-drawn UI, imperfect on purpose.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@plop-ui/tokens"><img src="https://img.shields.io/npm/v/@plop-ui/tokens?label=%40plop-ui%2Ftokens&color=2848D8" alt="npm version"></a>
  <a href="https://plopui.com/docs/tokens"><img src="https://img.shields.io/badge/docs-plopui.com-F6C445" alt="Docs"></a>
  <img src="https://img.shields.io/badge/license-MIT-2848D8" alt="MIT license">
  <img src="https://img.shields.io/badge/every%20fill-WCAG%20AA-9FD8B8" alt="Every fill passes WCAG AA">
</p>

`@plop-ui/tokens` is the single source of truth for [PlopUI](https://plopui.com): one cobalt ink, a handful of spot colors picked by instinct, five paper surfaces in light and dark, the Sketchpop type scale and the squish-and-spring motion curves. As CSS variables and as a typed object.

<p align="center"><img src="https://plopui.com/readme/tokens.png" alt="The PlopUI fills (ink, tomato, mustard, mint, periwinkle, bubblegum) each with its readable text color and contrast ratio, and the five paper surfaces: poster, cutting mat, notebook, kraft and riso" width="100%"></p>

## Install

```sh
npm i @plop-ui/tokens
# or: pnpm add @plop-ui/tokens / yarn add @plop-ui/tokens / bun add @plop-ui/tokens
```

Using [`@plop-ui/react`](https://www.npmjs.com/package/@plop-ui/react)? Then you already have it: the components bring the tokens along. Install it yourself to style your own pieces so they match.

## Use it in CSS

```css
@import "@plop-ui/tokens/tokens.css";

.my-sticker {
  background: var(--plop-mustard);
  color: var(--plop-on-fill-mustard); /* the text color that passes WCAG AA on mustard */
  border: 2.5px solid var(--plop-ink);
  font-family: var(--plop-font-letter);
  transition: transform var(--plop-duration-spring) var(--plop-ease-spring);
}

.my-note {
  color: var(--plop-on);           /* follows the surface: ink on paper, cream on the dark mat */
  background: var(--plop-sheet);
}
```

## Use it in TypeScript

```ts
import { color, onFill, surfaceNames, surfaces } from "@plop-ui/tokens";

color.ink;                  // "#2848D8"
onFill.tomato;              // { text: "#FFF8E7", ratio: 4.6 }  readable text for a tomato fill
surfaceNames;               // ["poster", "mat", "notebook", "kraft", "riso"]
surfaces.mat.dark.bg;       // the cutting mat's background in dark mode
```

## What's inside

| Group | What you get |
| --- | --- |
| **Colors** | One cobalt ink (`--plop-ink`, `--plop-ink-text`, `--plop-ink-soft`) and spot colors: tomato, mustard, mint, periwinkle, bubblegum |
| **Readable text** | `--plop-on-fill-*` for every fill, each at least 4.5:1 (WCAG AA), and `onFill` with the ratios |
| **Surfaces** | Poster, Cutting mat, Notebook, Kraft and Riso, each light and dark, with `--plop-on` / `--plop-on-soft` that follow them |
| **Type** | The Sketchpop lettering and body stacks, sizes and weights |
| **Motion** | `--plop-ease-squish`, `--plop-ease-spring` and their durations |
| **Shape** | Radii, strokes, shadows and the crayon hatch |

Full reference with every variable: [plopui.com/docs/tokens](https://plopui.com/docs/tokens)

## Links

- **The kit:** [`@plop-ui/react`](https://www.npmjs.com/package/@plop-ui/react) · **The font:** [`@plop-ui/fonts`](https://www.npmjs.com/package/@plop-ui/fonts)
- **Docs:** [plopui.com](https://plopui.com) · [Surfaces](https://plopui.com/docs/surfaces) · [Tokens & contrast](https://plopui.com/docs/tokens)
- **Changelog:** [plopui.com/changelog](https://plopui.com/changelog)

MIT © Lark Sigmuond Babao
