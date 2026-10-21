<p align="center"><img src="docs/assets/plop-logo.png" alt="Plop UI" width="420"></p>

<p align="center"><strong>A hand-lettered sticker UI kit for real-time operations apps.</strong><br>Press it like you mean it.</p>

Plop! is an open-source React + TypeScript component library for dispatch, field service and ticketing apps, drawn in one cobalt marker on cream paper: die-cut sticker buttons, hatched shadows, boiling ink outlines and tactile press feedback. Every "imperfection" is seeded, so it renders the same on the server and the client.

## Packages

| Package | What it is |
| --- | --- |
| [`@plop-ui/react`](packages/react) | Components, hooks, `onColor`, seeded randomness |
| [`@plop-ui/tokens`](packages/tokens) | Colors, contrast roles, type, motion and 5 surfaces, as CSS variables and a typed object |
| [`@plop-ui/fonts`](packages/fonts) | Sketchpop, the hand-drawn marker family (SIL OFL 1.1) |

## Quick start

```sh
pnpm add @plop-ui/react @plop-ui/fonts
```

```tsx
import "@plop-ui/fonts/fonts.css";
import "@plop-ui/react/styles.css";
import { PlopProvider, Button, StatusTimeline, toast } from "@plop-ui/react";

export function App() {
  return (
    <PlopProvider surface="poster">
      <Button variant="tomato" buddy onClick={() => toast.success("Report sent")}>
        Send report
      </Button>
      <StatusTimeline steps={["Reported", "Dispatched", "En route", "Resolved"]} current={2} />
    </PlopProvider>
  );
}
```

## Components

**Actions** Button, IconButton, Tooltip · **Inputs** Switch, Checkbox, RadioGroup, TextField, TextArea · **Display** Tag, Avatar, AvatarStack, TicketCard, UnitCard, StickyNote, Tabs, Count, StatusDot, EmptyState · **Feedback** StatusTimeline, Progress, Callout, Toast / `toast()` · **Foundations** PlopProvider, Sheet, Heading, Lettering · **Hooks** `useHaptics`, `useBoil`, `useInkBurst`, `useReducedMotion`, `useSound`

Accessible by default: native elements first, full keyboard support, WCAG 2.2 AA contrast on every surface in light and dark, and every effect respects `prefers-reduced-motion`.

## Repo

```
packages/tokens   design tokens → CSS variables + typed object
packages/fonts    Sketchpop woff2/ttf + OFL license + font build tools
packages/react    @plop-ui/react (esbuild, CSS Modules, per-file "use client")
apps/docs         Next.js 15 docs site: the kit showcase + one page per component
apps/storybook    Storybook 8 workshop with the a11y addon
docs/             PRD, decision records, the original v0.6 prototype, brand assets
```

```sh
pnpm install
pnpm build        # all packages and apps
pnpm test         # Vitest + Testing Library
pnpm lint
pnpm --filter @plop-ui/docs dev        # docs on :3000
pnpm --filter @plop-ui/storybook dev   # Storybook on :6006
pnpm --filter @plop-ui/docs test:e2e   # Playwright: hydration, axe on every surface, keyboard
```

Read [`docs/PRD.md`](docs/PRD.md) for the plan and [`CLAUDE.md`](CLAUDE.md) for the rules the codebase follows.

## License

Code: MIT. Sketchpop font: SIL Open Font License 1.1.
