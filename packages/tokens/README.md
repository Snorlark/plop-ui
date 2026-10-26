<p align="center"><img src="https://plopui.com/plop-logo.png" alt="PlopUI" width="300"></p>

# @plop-ui/tokens

The colors, type, motion and paper surfaces behind [PlopUI](https://plopui.com), the hand-drawn React UI kit that's imperfect on purpose. One source of truth, as CSS variables and a typed object.

You don't need to install this yourself if you use [`@plop-ui/react`](https://www.npmjs.com/package/@plop-ui/react): it comes along. Use it directly to style your own pieces so they match.

```sh
npm i @plop-ui/tokens
```

## CSS variables

```css
@import "@plop-ui/tokens/tokens.css";

.my-sticker {
  background: var(--plop-mustard);
  color: var(--plop-on-fill-mustard); /* the text color that passes WCAG AA on mustard */
  border: 2.5px solid var(--plop-ink);
  transition: transform var(--plop-duration-spring) var(--plop-ease-spring);
}
```

## In TypeScript

```ts
import { color, surfaces, surfaceNames } from "@plop-ui/tokens";

color.ink;               // "#2848D8"
surfaceNames;            // ["poster", "mat", "notebook", "kraft", "riso"]
surfaces.kraft.label;    // "Kraft"
```

## What's in it

- **Colors:** one cobalt ink plus spot colors (tomato, mustard, mint, periwinkle, bubblegum), each with an `on-fill` text color that passes WCAG AA.
- **Contrast roles:** `--plop-on`, `--plop-on-soft` and friends follow the surface, so text stays readable on paper and on the dark cutting mat.
- **Five surfaces,** each light and dark: Poster, Cutting mat, Notebook, Kraft, Riso.
- **Type and motion:** the Sketchpop letter and body stacks, sizes, weights, and the squish and spring curves.

Full reference: [plopui.com/docs/tokens](https://plopui.com/docs/tokens)

MIT © Lark Sigmuond Babao
