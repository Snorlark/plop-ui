# Contributing to PlopUI

Thanks for helping. PlopUI is small and opinionated, so this page tells you both how to work in the repo and what a finished change looks like.

## Before you start

- **Find something to do.** Look through the open issues. For a new component or a larger change, open an issue first so we can agree on the shape before you build it.
- **Know the idea.** PlopUI is imperfect on purpose and accessible on principle: it breaks the visual rulebook, never the accessibility one. [docs/decisions/](docs/decisions/) explains why things look the way they do.
- **Read the rules.** [CLAUDE.md](CLAUDE.md) is short and every pull request is checked against it. The most important ones are repeated below.

## Set up

You need Node 20+ and pnpm 11. `corepack enable` installs the right pnpm.

```sh
git clone https://github.com/Snorlark/plop-ui.git
cd plop-ui
pnpm install
pnpm build
```

Then run what you need, each in its own terminal:

```sh
pnpm --filter @plop-ui/react dev        # rebuilds the library on save
pnpm --filter @plop-ui/docs dev         # docs site  → http://localhost:4321
pnpm --filter @plop-ui/storybook dev    # Storybook  → http://localhost:6006
```

The apps load the library from `packages/react/dist`, so keep the first command running while you edit components. If the site says something you just exported "is not a function", the build is stale: rebuild it.

## The rules

1. **No Next.js in the library.** `packages/react` never imports from `next/*`. Next.js lives only in `apps/`.
2. **Server Components unless interactive.** A component that uses state, effects or event handlers starts with `"use client"`. A static one doesn't.
3. **No `Math.random()` in render.** Every tilt, wobble and jitter comes from `seed()` in `packages/react/src/seed.ts`, so the server and the client draw the same thing.
4. **Tokens only.** Colors, fonts and motion come from the `packages/tokens` CSS variables (`var(--plop-ink)`, `var(--plop-ease-spring)`, …). No hex values in components. If a value you need doesn't exist, add it to `packages/tokens/src/tokens.ts`.
5. **Accessible by default.** Use a native element first (`<button>`, `<input>`, `<a>`), support the keyboard fully, keep focus visible, and meet WCAG 2.2 AA contrast on every surface, in light and dark.
6. **Respect reduced motion.** Every animation has a `prefers-reduced-motion` path.
7. **Characters never work alone.** A `Buddy` can reinforce a message, but the text always says it too. Each character keeps its one meaning (Pip = success, Bix = error, and so on).
8. **Write down real decisions.** If you choose between two reasonable approaches, add a short file to `docs/decisions/` (next number, what you chose, why). Look at the existing ones for the tone.

## Adding a component

Say you're adding `Stamp`. A finished component touches these places:

**1. The component** in `packages/react/src/Stamp/`:

```
Stamp.tsx            the component, with JSDoc on its props (the docs site reads it)
Stamp.module.css     styles, using token variables only
Stamp.test.tsx       Vitest + Testing Library tests
```

- Export it, its props type and any public types from `packages/react/src/index.ts`.
- Write the tests with `renderWithPlop` from `packages/react/test/render.tsx`. Cover keyboard behavior (Tab, Enter, Space, arrow keys, Escape, whatever applies), plus anything seeded rendering the same on a second render.

**2. A story for every state** in `apps/storybook/stories/Stamp.stories.tsx`: default, every variant and size, disabled, loading, error, long text, and so on. The a11y addon flags problems as you go.

**3. The docs site** in `apps/docs`:

- Add `Stamp: "StampProps"` to `COMPONENTS` in `scripts/gen-props.mjs`, so the props table is generated from your types.
- Add an entry to `COMPONENT_DOCS` in `app/_site/registry.ts` (title, group, lede, code sample, do/don't, accessibility notes). That creates the page at `/docs/components/stamp`.
- Add a link to `DOC_NAV` in `app/_site/nav.ts`, with a few search keywords. That puts it in the docs sidebar, the previous/next links and the ⌘K search.
- Add it to the kit page (`app/kit/page.tsx` and `app/_kit/`) if it belongs in the showcase.

**4. A changeset**, because you changed a published package:

```sh
pnpm changeset
```

Pick `@plop-ui/react` (and `tokens` / `fonts` if you touched them), choose the bump (new component = `minor`, fix = `patch`), and write one or two sentences for the changelog. The docs and Storybook apps never need a changeset.

## Before you open a pull request

Run the checks and make sure they pass:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm size
pnpm --filter @plop-ui/docs test:e2e    # if you changed the docs site or a component's markup
```

CI runs the right subset for your change on the pull request; [docs/ci-cd.md](docs/ci-cd.md) explains what runs when and how releases work.

Then look at your change in the docs site on at least two surfaces (try Poster and Cutting mat), in light and dark, with reduced motion turned on in your OS, and with the keyboard only.

## Branches, commits and pull requests

- Branch from `main` with a prefix: `feat/…` for something new, `fix/…` for a bug, `docs/…` for docs only. Example: `feat/stamp`.
- Keep commits focused, one change each. Write the subject as what the commit does ("Add Stamp component", "Fix Start over button stretching").
- In the pull request, say what changed and why, link the issue, and add a screenshot or short clip for anything visual.
- One topic per pull request. A bug fix you found along the way gets its own branch.

## Reporting a bug

Open an issue with:

- what you did, what you expected, and what happened
- the component, surface and theme (light or dark)
- your browser and OS, and whether reduced motion was on
- a screenshot or a small code sample, if you can

## The font

Sketchpop is under the SIL Open Font License 1.1. Changes to it go through the font build tools in `packages/fonts`, and the license file stays with the font files.
