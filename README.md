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

**Actions** Button, ButtonLink, IconButton, Tooltip · **Inputs** Switch, Checkbox, RadioGroup, TextField, TextArea · **Display** Tag, Avatar, AvatarStack, TicketCard, UnitCard, StickyNote, Tabs, Count, StatusDot, EmptyState · **Feedback** StatusTimeline, Progress, Callout, Toast / `toast()` · **Foundations** PlopProvider, Sheet, Heading, Lettering · **Hooks** `useHaptics`, `useBoil`, `useInkBurst`, `useReducedMotion`, `useSound`

Accessible by default: native elements first, full keyboard support, WCAG 2.2 AA contrast on every surface in light and dark, and every effect respects `prefers-reduced-motion`.

## Run it locally

Needs Node 20+ and pnpm 11 (`corepack enable` sets it up).

```sh
pnpm install
pnpm build                              # builds tokens, fonts, the library and the apps
pnpm --filter @plop-ui/docs dev         # docs website → http://localhost:4321
pnpm --filter @plop-ui/storybook dev    # Storybook   → http://localhost:6006
```

Editing the library while the website runs? Keep `pnpm --filter @plop-ui/react dev` going in a second terminal; it rebuilds on save.

| Page | What it is |
| --- | --- |
| `/` | The landing page |
| `/docs/getting-started` | Docs: installation, Next.js guide, surfaces, tokens, one page per component |
| `/playground` | Change any component's props, surface and theme live, then copy the code |
| `/kit` | Every piece on one page (the original prototype, rebuilt from the library) |

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test                               # Vitest + Testing Library (packages/react)
pnpm size                               # size-limit budgets
pnpm --filter @plop-ui/docs test:e2e    # Playwright: hydration, axe on every page and surface, keyboard
                                        # (builds into .next-e2e, so it's safe while `pnpm dev` runs)
```

## Repo

```
PRD.md            what we're building and why (with a status table)
TASKS.md          what to do next: the tracker
CLAUDE.md         rules the codebase follows
packages/tokens   design tokens → CSS variables + typed object
packages/fonts    Sketchpop woff2/ttf + OFL license + font build tools
packages/react    @plop-ui/react (esbuild, CSS Modules, per-file "use client")
apps/docs         Next.js 15 website: landing, docs, Playground, /kit
apps/storybook    Storybook 8 workshop with the a11y addon
docs/decisions    why things are the way they are
docs/prototype    the original v0.6 HTML prototype
docs/assets       logo and mark
```

## Contributing

Pick something from [TASKS.md](TASKS.md). Every pull request that changes a package adds a changeset (`pnpm changeset`). Read [CLAUDE.md](CLAUDE.md) for the rules: no `next/*` in the library, no `Math.random()` in render, colors only from tokens, a story and a keyboard test for every component.

## License

Code: MIT (pending, see TASKS.md). Sketchpop font: SIL Open Font License 1.1.
