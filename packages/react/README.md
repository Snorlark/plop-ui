<p align="center"><img src="https://plopui.com/plop-logo.png" alt="PlopUI" width="360"></p>

<p align="center"><strong>Hand-drawn UI, imperfect on purpose.</strong><br>Press it like you mean it.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@plop-ui/react"><img src="https://img.shields.io/npm/v/@plop-ui/react?label=%40plop-ui%2Freact&color=2848D8" alt="npm version"></a>
  <a href="https://plopui.com"><img src="https://img.shields.io/badge/docs-plopui.com-F6C445" alt="Docs"></a>
  <img src="https://img.shields.io/badge/license-MIT-2848D8" alt="MIT license">
  <img src="https://img.shields.io/badge/WCAG-AA-9FD8B8" alt="WCAG AA">
</p>

PlopUI is a React component library for people who'd rather have fun than follow the design rulebook. Lines wobble, stickers sit a little crooked, and the colors are picked by instinct. It breaks the visual rules on purpose and keeps the ones that matter: every piece is a real, accessible element, readable to WCAG AA on every surface, light and dark.

<p align="center"><img src="https://plopui.com/readme/components.png" alt="PlopUI components: a Post sketch button with a buddy peeking over it, washi-tape tags, a Brush select, a sticky note, a status timeline, a switch, a checkbox, avatars, a toast and more" width="100%"></p>

## Install

```sh
npm i @plop-ui/react @plop-ui/fonts
# or: pnpm add @plop-ui/react @plop-ui/fonts
# or: yarn add @plop-ui/react @plop-ui/fonts
# or: bun add @plop-ui/react @plop-ui/fonts
```

`@plop-ui/tokens` comes along with it. React 19 is a peer dependency.

## Quick start

```tsx
import "@plop-ui/fonts/fonts.css";
import "@plop-ui/react/styles.css";
import { PlopProvider, Button, Select, StatusTimeline, toast } from "@plop-ui/react";

export function App() {
  return (
    <PlopProvider surface="poster">
      <Button buddy onClick={() => toast.success("Sketch posted", { buddy: true })}>
        Post sketch
      </Button>
      <Select label="Brush" options={[{ value: "pencil", label: "Pencil" }, { value: "marker", label: "Marker" }]} />
      <StatusTimeline steps={["Sketched", "Inked", "Colored", "Shipped"]} current={2} />
    </PlopProvider>
  );
}
```

**Next.js:** the library never imports `next/*`, and every interactive component already carries `"use client"`, so it drops straight into the App Router. Static pieces like `StatusTimeline` and a plain `Tag` stay Server Components and ship no client JavaScript. See [Using with Next.js](https://plopui.com/docs/nextjs).

To cover the whole screen with the paper, and why buttons stretch inside a grid, see [Good to know](https://plopui.com/docs/getting-started).

## What's inside

| Group | Pieces |
| --- | --- |
| **Actions** | `Button`, `ButtonLink`, `IconButton`, `Menu`, `Tooltip` |
| **Inputs** | `Select` (with a searchable people picker), `MultiSelect`, `TextField`, `TextArea`, `Switch`, `Checkbox`, `RadioGroup`, `SearchField` |
| **Navigation** | `CommandPalette` (⌘K / Ctrl K), `Tabs` |
| **Display** | `Tag`, `Avatar`, `AvatarStack`, `TicketCard`, `UnitCard`, `StickyNote`, `Count`, `StatusDot`, `EmptyState` |
| **Feedback** | `StatusTimeline`, `Progress`, `Callout`, `Toast` / `toast()`, ink bursts |
| **Characters** | `Buddy`, `BuddyPeek`: a cast of six, one per state |
| **Lettering** | `Heading`, `Lettering`, `WordSticker`, `Doodle` |
| **Foundations** | `PlopProvider` (5 paper surfaces, light and dark, haptics, sound, reduced motion), `Sheet`, hand-drawn icons |
| **Hooks and helpers** | `useHaptics`, `useSound`, `useBoil`, `useInkBurst`, `useReducedMotion`, `onColor`, `seed` |

Every wobble and tilt comes from a seed, so the server and the browser draw the same thing. Every animation respects `prefers-reduced-motion`.

## Links

- **Docs:** [plopui.com](https://plopui.com) · [Getting started](https://plopui.com/docs/getting-started) · [Every component](https://plopui.com/docs/components/button)
- **Playground:** [plopui.com/playground](https://plopui.com/playground): stick components on a board, letter words, tweak props, copy the code
- **Changelog:** [plopui.com/changelog](https://plopui.com/changelog)
- **For AI tools:** [plopui.com/llms.txt](https://plopui.com/llms.txt)
- **Related packages:** [`@plop-ui/tokens`](https://www.npmjs.com/package/@plop-ui/tokens) (colors, type, motion, surfaces) · [`@plop-ui/fonts`](https://www.npmjs.com/package/@plop-ui/fonts) (Sketchpop)

MIT © Lark Sigmuond Babao
