# Plop! — PRD for a hand-lettered sticker UI library

Oct 21, 2026 · @lark pogi · **Living document**: updated as the project moves. Day-to-day work is tracked in [TASKS.md](TASKS.md).

## Overview

Plop! is an open-source React + TypeScript component library for real-time operations apps (dispatch, field service, ticketing), drawn in a hand-lettered, one-ink sticker style. v0.1 ships 6 components to npm, with Storybook and a Next.js docs site, in 6 weeks; v1.0 follows once the library powers a real dispatch app.

The visual reference is the Plop! v0.6 prototype: cobalt marker lettering on cream poster paper, die-cut sticker buttons, hatched shadows, boiling ink outlines, and tactile press feedback. This PRD turns that single HTML prototype into a real, installable package.

**Problem.** Ops apps (incident queues, responder tracking, status timelines) get rebuilt from scratch for every client, and they usually look like generic admin templates. There is no component kit built around ops workflows, and none with a distinctive, human visual identity.

**Goals**

- Publish `@plop-ui/react` to npm with typed, tree-shakeable components and design tokens.
- Cover the ops workflows the author rebuilds most: buttons, status tags, timeline, dispatch queue, sync indicator.
- Meet WCAG 2.2 AA: keyboard support, screen reader labels, contrast, reduced motion.
- Keep the hand-drawn look consistent: every "imperfection" is seeded, so it never changes between renders.
- Prove Plop! works in Next.js (App Router, Server Components, SSR) through the docs site and a dispatch demo app, both built with Next.js.
- Use Plop! in at least one real app (the offline dispatch project) before v1.0.

**Non-goals**

- A general-purpose library competing with shadcn, Radix or MUI.
- Vue, Svelte or React Native ports (React DOM only until v1.0).
- A data grid, rich text editor, date picker or charting library.
- Selling a Figma kit. The Figma file exists to keep design and code in sync.

## Status (updated Oct 21, 2026)

| Area | State | Notes |
| --- | --- | --- |
| Monorepo, tooling, CI | Done | pnpm + Turborepo, ESLint (jsx-a11y, no `next/*` or `Math.random()` in the library), Changesets, GitHub Actions |
| `@plop-ui/tokens` | Done | One TS source → typed object + `tokens.css`; 5 surfaces × light/dark; `.plop-surface`, `.plop-paper` |
| `@plop-ui/fonts` | Done | Sketchpop 4 weights × italic/upright, woff2 + ttf, OFL, font build tools |
| `@plop-ui/react` v0.1 scope | Done | PlopProvider, Button, IconButton, Tag, Switch, Checkbox, StatusTimeline, useHaptics, useBoil |
| Rest of the prototype kit | Done (pulled forward) | ButtonLink, Tooltip, TextField/TextArea, RadioGroup, Avatar, Cards, Tabs, Progress, Callout, Toast, Count/StatusDot, Sheet, Heading, Lettering, ink burst. See decision 0005 |
| Tests | Done | 100+ Vitest tests (~96% lines); Playwright: hydration, axe on every page, surface × theme matrix, keyboard |
| Storybook | Done | Every state, a11y addon, surface/theme toolbar |
| Docs site | Done | Home (landing design), docs per component with generated props tables, search, Playground, `/kit` showcase |
| Dispatch demo app | Built, not deployed yet | See TASKS.md |
| npm publish, Vercel deploys | Not started | Blocked on the open questions below |
| Figma sync, MapPanel | Not started | v1.0 |

## Audience and positioning

Plop! is for small teams building operations software for government and business clients, starting with its author's own client work at Quadsync and MEC.

| Audience | What they need from Plop! |
| --- | --- |
| The author (primary user) | Stop rebuilding dispatch UIs per client; ship faster with a consistent look |
| Client teams (LGUs, police stations, field service firms) | Interfaces that feel friendly and calm for citizens and staff, not like admin templates |
| Developers who install it | Typed components, good docs, accessible defaults, no fighting the styles |
| Recruiters and hiring managers | A live, documented proof of design engineering and frontend depth |

**Positioning line:** "Plop! is a hand-lettered UI kit for real-time operations apps. Press it like you mean it."

What makes it different is the combination: ops-specific components (dispatch queue, status timeline, sync indicator) plus a visual identity nobody else has. Either one alone is common; together they are memorable and clearly tied to the author's niche.

## Design language

One cobalt ink draws everything on cream paper; a few spot colors are printed underneath, slightly off-register. Every token below lives in `packages/tokens` and is exported as CSS variables and a typed JS object.

**Principles**

1. **Stickers, not boxes.** Interactive things are die-cut stickers with a paper border and a hatched shadow. Static things are paper, tape and ink.
2. **One ink.** All lines and text use the ink color. Spot colors fill shapes but never draw lines.
3. **Imperfect on purpose, but seeded.** Tilt, wobble and jitter come from a seed (the component's `id` or a `seed` prop), so the same component looks the same on every render and in SSR.
4. **Every press answers.** Squish on press, spring on release, haptic tap on phones. Motion only happens in response to a person, except one hero moment per page.
5. **Readable first.** Lettering (Sketchpop Bold Italic) is for short labels and headings only. Anything people read in full uses Sketchpop Regular, upright, at 17px or larger.

**Color tokens**

| Token | Value | Use |
| --- | --- | --- |
| `--plop-ink` | #2848D8 | All outlines, icons, hatching, and text on paper colors |
| `--plop-ink-text` | #1C2E8C | Text on spot fills (periwinkle, mint, mustard, bubblegum) and on kraft or riso surfaces |
| `--plop-ink-soft` | #3B4A92 | Captions, hints, timestamps; always solid, never faded with opacity |
| `--plop-on-ink` | #FFF8E7 | Text on ink and tomato fills |
| `--plop-paper` | #FFFDF7 | Sticker die-cut border, card faces |
| `--plop-sheet` | #FBF8F0 | Panels and sheets |
| `--plop-tomato` | #D2381E | Destructive, critical status |
| `--plop-mustard` | #F6C445 | Warning, en route, highlights |
| `--plop-bubblegum` | #F6A9B8 | Error backgrounds, cheeks, accents |
| `--plop-periwinkle` | #A9B6EE | Secondary fills, info |
| `--plop-mint` | #9FD8B8 | Success, resolved |

**Status mapping:** critical → tomato, dispatched → ink, en route → mustard, resolved → mint, unassigned → periwinkle. Every status also carries a text label, never color alone.

**Contrast roles.** Like Material's "on" colors, every fill has a paired text color that passes WCAG AA, so text never sits on a background it can't be read on. The bright ink draws lines; the deeper text ink carries words on color.

| Fill | Text role | Measured contrast |
| --- | --- | --- |
| Ink | `--plop-on-ink` | 6.6:1 (AA) |
| Tomato | `--plop-on-ink` | 4.6:1 (AA) |
| Periwinkle | `--plop-ink-text` | 5.8:1 (AA) |
| Bubblegum | `--plop-ink-text` | 6.2:1 (AA) |
| Mint | `--plop-ink-text` | 7.1:1 (AAA) |
| Mustard | `--plop-ink-text` | 7.1:1 (AAA) |
| Paper | `--plop-ink` | 6.9:1 (AA) |
| Sheet, soft text | `--plop-ink-soft` | 7.7:1 (AAA) |

Each surface also defines its own `on` and `on-soft` text colors for light and dark, chosen to pass 4.5:1. For colors set at runtime (a client's brand color, a custom tag), `onColor(bg)` measures the fill and returns whichever of deep ink or cream has the higher contrast. It ships in v0.1 next to `useHaptics`.

**Typography**

| Token | Value | Use |
| --- | --- | --- |
| `--plop-font-logo` | "Sketchpop" Black Italic (900) | The Plop! wordmark only: a die-cut sticker with a paper border, thin ink edge and drop shadow; never crayon-filtered |
| `--plop-font-letter` | "Sketchpop" Bold Italic (700); Black Italic (900) for section headings | Headings, buttons, tags, tabs; uppercase, `calt` on so repeated letters vary |
| `--plop-font-body` | "Sketchpop" Regular upright (400); Patrick Hand as per-character fallback | Body, hints, inputs, lists; sentence case |
| Type scale (px) | 13, 15, 17, 19, 24, 32, 44, 72 | Body defaults to 19 |

**Sketchpop** is the author's own hand-drawn marker family (SIL Open Font License 1.1): Light, Regular, Bold and Black, each in italic and upright, with 3 hand-drawn versions of every letter that rotate through the `calt` feature so repeats never look copy-pasted. It lives in the repo as `packages/fonts` (woff2 + license) and covers A–Z, a–z, 0–9 and basic punctuation; any other character falls back to Patrick Hand.

**Shape, shadow and motion**

| Token | Value |
| --- | --- |
| `--plop-radius-sticker` | 26px 20px 28px 18px / 20px 28px 18px 26px (irregular on purpose) |
| `--plop-stroke` | 3px default, 2.5px small, 7px illustrations |
| `--plop-shadow-hatch` | repeating 45° ink lines, 2.2px on / 3.4px off, offset 5px 7px |
| `--plop-ease-spring` | cubic-bezier(.28, 1.75, .5, 1), 500ms |
| `--plop-ease-squish` | cubic-bezier(.2, .9, .3, 1), 80ms |
| `--plop-boil` | 3 SVG displacement filters swapped every 140ms |

**Surfaces (themes):** poster (default), cutting mat, notebook, kraft, riso. Each surface sets background, on-surface text, focus color and hatch color, with a light and dark value. Components never hard-code a surface.

## Scope by release

v0.1 is deliberately small: foundations plus 6 components, chosen because the offline dispatch app needs them first. **Update:** the v0.2 and most of the v0.3 components shipped early, ported straight from the prototype (decision 0005); the release plan below now tracks what is left.

| Release | Components and features | Exit criteria | State |
| --- | --- | --- | --- |
| v0.1 | Tokens + 5 surfaces, `PlopProvider`, `Button`, `IconButton`, `Tag`, `Switch`, `Checkbox`, `StatusTimeline`, `useHaptics`, `useBoil` | Published to npm, Storybook live, all v0.1 tests and a11y checks green | Built and tested; **not published yet** |
| v0.2 | `TextField`, `TextArea`, `RadioGroup`, `Tooltip`, `Toast`, `Callout`, `Avatar`, `Progress` | Used in the dispatch app's report form | Built and tested; waits for the dispatch app |
| v0.3 (ops pack) | `DispatchQueue`, `SyncIndicator`, `UnitCard`, `TicketCard`, `Tabs`, `RoleGate` | Dispatch app console built only from Plop! | `UnitCard`, `TicketCard`, `Tabs` done; `DispatchQueue`, `SyncIndicator`, `RoleGate` to do |
| v1.0 | `MapPanel` (MapLibre wrapper), dark mode audit, Figma file synced, docs site with case study | 30 days in production use, no open a11y bugs | Not started |

Anything not in this table needs a written reason before it is added, so the project does not turn into an endless polishing loop.

## Component specs (v0.1)

Every v0.1 component is a thin Plop! layer over an accessible primitive, takes a `seed` for its imperfections, and works in both client and server-rendered pages. Interactive ones ship with `"use client"`; static ones (`StatusTimeline`, and `Tag` without `onRemove`) render as Server Components.

| Component | Key props | States to support | Accessibility |
| --- | --- | --- | --- |
| `PlopProvider` | `surface`, `haptics`, `sound`, `reducedMotion` | light, dark, 5 surfaces | Respects `prefers-reduced-motion` and `prefers-color-scheme` by default |
| `Button` | `variant` (ink, periwinkle, mint, tomato, mustard, plain), `size`, `tilt`, `buddy`, `loading`, `iconLeft` | idle, hover (peel), pressed (squish), loading, disabled, focus | Native `<button>`, `aria-busy` while loading, Space and Enter both show the press |
| `IconButton` | `icon`, `label` (required), `variant`, `size` | same as Button | `label` becomes `aria-label`; TypeScript fails the build without it |
| `Tag` | `tone`, `pattern` (stripes, dots, grid), `onRemove` | static, removable, removing (peel-off) | Remove button named "Remove \<label>"; focus moves to the next tag |
| `Switch` | `checked`, `onCheckedChange`, `color`, `disabled` | off (sleepy face), on (awake), disabled | `role="switch"`, `aria-checked`, label click toggles |
| `Checkbox` | `checked`, `indeterminate`, `tickColor` | unchecked, checked (tick draws in), indeterminate, disabled | Real `<input type="checkbox">`, visible focus ring |
| `StatusTimeline` | `steps`, `current`, `times`, `orientation` | done, current (boils), pending; horizontal and vertical | `<ol>` with `aria-current="step"`; status always written in text |
| `useHaptics` | `tap()`, `success()`, `error()` | Android vibrate, iOS 18 switch fallback, off | Never the only feedback; always paired with a visual change |
| `useBoil` | `seed`, `active` | still, boiling | Disabled under reduced motion |

**Example API**

```tsx
<Button variant="tomato" size="lg" tilt={-3} buddy loading={sending}>
  Send report
</Button>

<StatusTimeline
  steps={["Reported", "Dispatched", "En route", "Resolved"]}
  current={2}
/>
```

## Technical architecture

Plop! is a pnpm + Turborepo monorepo: the library stays plain React + TypeScript so it runs in any React app, and two Next.js apps prove it works in the framework most clients use. The library never imports from `next/*`.

```
plop-ui/
  packages/
    tokens/          # colors, type, motion, surfaces → CSS variables + typed TS object
    fonts/           # Sketchpop woff2 (4 weights, italic + upright) + OFL license
    react/           # @plop-ui/react: components, hooks, SVG filters
  apps/
    docs/            # Next.js App Router + MDX docs site (plop-ui.vercel.app)
    dispatch-demo/   # Next.js demo: live incident queue built only from Plop!
    storybook/       # component workshop, a11y and visual tests
  .changeset/        # versioning and changelog
  turbo.json
```

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript, `strict: true` | Typed props are the library's API contract |
| Components | React 19 + Radix primitives | Radix handles focus, ARIA and keyboard; Plop! adds the look |
| Styling | CSS Modules + CSS variables from `tokens` | Zero runtime, safe in Server Components, easy to theme by surface |
| Library build | esbuild (one module per file) + `tsc` for `.d.ts`; `"use client"` restored per interactive file | Keeps client boundaries and CSS Modules intact. tsup was the plan; see decision 0003 for why it changed |
| Docs site | Next.js 15 App Router, MDX, `next/font`, generated props tables | Real-world proof of SSR, RSC and font loading |
| Demo app | Next.js 15 with Route Handlers (SSE) and Server Actions | Live dispatch queue without a separate backend |
| Workshop | Storybook 8 | Every state of every component in isolation |
| Monorepo and releases | pnpm workspaces, Turborepo, Changesets | Fast cached builds; versioned releases with a changelog |
| Hosting | Vercel (docs, demo, Storybook) | Preview deploy on every pull request |

**What Next.js adds, and what it teaches**

- **Server and client boundaries.** Deciding which components need `"use client"` and keeping the rest as Server Components.
- **Hydration-safe randomness.** `Math.random()` tilt would differ between server and browser and break hydration. Plop! derives every tilt and wobble from a `seed`, so both renders match.
- **Theme without a flash.** The chosen surface is stored in a cookie and read on the server (the docs site does this on `/kit`), so the right paper renders on the first paint. The rest of the docs site is static, printed on poster paper.
- **Fonts done right.** `next/font/local` self-hosts the Sketchpop woff2 files from `packages/fonts` and exposes them as CSS variables that Plop!'s tokens point to; Patrick Hand comes in through `next/font/google` only as the fallback.
- **Real-time in one framework.** A Route Handler streams incident updates over Server-Sent Events; a Server Action handles the "Send report" form.
- **Performance budget.** Lighthouse and Core Web Vitals checked on the docs site; the SVG filters must not push Interaction to Next Paint over 200 ms.

## Accessibility, motion and haptics

The hand-drawn look must never cost usability: every component meets WCAG 2.2 AA, and every effect has an accessible off switch.

**Accessibility**

- Text contrast at least 4.5:1, large lettering and UI outlines at least 3:1, checked on all 5 surfaces in light and dark.
- Text color always comes from a contrast role (`on-ink`, `ink-text`, `ink-soft`, the surface's `on`), never from the fill's own palette or an opacity fade.
- Runtime colors go through `onColor(bg)`, which picks deep ink or cream, whichever passes with the higher ratio.
- Every interactive part works with keyboard alone; focus shows as the dashed "cut here" line, never removed.
- Native elements first (`button`, `input`, `ol`); ARIA only where a native element does not exist.
- Status is never color alone: every tag, timeline step and callout carries a text label.
- Crayon and wobble filters apply to decoration and lettering only, never to body text people read in full or to the wordmark.

**Motion**

- Motion answers a person's action (press, toggle, remove). The only ambient motion is one hero moment per page.
- `prefers-reduced-motion` turns off boil, ink bursts, peel-offs and spring overshoot; state changes still show instantly.
- Press feedback lands within 80 ms; release spring settles within 500 ms.

**Haptics and sound**

- `useHaptics` uses `navigator.vibrate` on Android and the iOS 18 Safari switch fallback; it silently does nothing elsewhere.
- Patterns: tap 8 ms on press, success `[6, 40, 14]`, error `[14, 30, 14]`.
- Sound is off by default and only plays after a person turns it on.
- Haptics and sound always accompany a visual change; they are never the only signal.

## Testing and quality gates

A pull request merges only when every gate below passes in CI (GitHub Actions); a release needs all of them plus a manual check on a real phone.

| Gate | Tool | Passes when |
| --- | --- | --- |
| Types and lint | `tsc --noEmit`, ESLint (`jsx-a11y`) | Zero errors |
| Unit and behavior | Vitest + Testing Library | Keyboard, click and state tests pass for every component; 80% line coverage on `packages/react` |
| Accessibility | Storybook a11y addon (axe), Playwright + `@axe-core/playwright` | Zero serious or critical violations on every story and docs page |
| Visual regression | Chromatic or Playwright screenshots | No unreviewed diffs; seeded randomness keeps snapshots stable |
| SSR and hydration | Playwright against `next build` of the docs and demo apps | No hydration warnings in the console; first paint shows the right surface |
| Bundle size | `size-limit` | `Button` under 6 kB gzipped; whole library under 40 kB |
| Performance | Lighthouse CI on the docs site | Performance and Accessibility scores at least 90 |
| Manual | Android Chrome and iPhone Safari | Haptics fire, press feels instant, VoiceOver and TalkBack read every control |
| Contrast audit | Playwright script that measures every visible text element against its real background | 0 failing elements across 5 surfaces in light and dark (the v0.5 prototype went from 400+ per surface to 0) |

## Docs site, Storybook and releases

The Next.js docs site is the public face of Plop!; Storybook is the workshop where components are built and tested.

**Docs site (`apps/docs`, Next.js)**

- One MDX page per component: live demo, props table generated from the TypeScript types, do and don't examples, accessibility notes.
- A landing page (the "PlopUI docs website" design), a header search, and a **Playground** where every component's props, surface and theme can be changed live and the code copied.
- A surface switcher on `/kit`, stored in a cookie so the server renders the right paper.
- Pages: Getting started, Tokens, each component, Surfaces, "Using Plop! with Next.js", and a case study of the dispatch demo.
- Static where possible (`generateStaticParams`), so pages load fast and cost nothing to host.

**Dispatch demo (`apps/dispatch-demo`, Next.js)**

- A live incident queue fed by a Server-Sent Events Route Handler with mock incidents every few seconds.
- A "Send report" form using a Server Action, `useOptimistic` and Plop!'s loading button.
- Shows the whole kit working together and doubles as the portfolio screenshot.

**Storybook (`apps/storybook`)**

- Every state from the component specs table has a story; the a11y and visual tests run against them.

**Releases**

- Semantic versioning through Changesets: every pull request that changes the library adds a changeset; merging to `main` opens a release PR.
- Breaking changes only in minor versions before 1.0, always listed in the changelog with a migration note.
- Publish `@plop-ui/tokens` and `@plop-ui/react` to npm with provenance; docs, demo and Storybook redeploy on Vercel.

## Milestones: 6-week plan

v0.1 ships at the end of week 6, with the library and the two Next.js apps built side by side so every component is tested in a real framework the week it lands.

&#91;embedded content: 6-week plan · 3 workstreams, 1 release gate\]

Each week ends with a working deploy on Vercel; if a week slips, cut a component from v0.1, never the tests or the release gate.

## Working with Claude Code

Use Claude Code to build faster, but keep the decisions yours: you write the API and the tests' intent, Claude Code writes and refactors, and you review every diff. That is what makes the interview stories true.

**`CLAUDE.md` at the repo root**

```markdown
# Plop!
Hand-lettered sticker UI kit for real-time ops apps. Read PRD.md first.

## Rules
- packages/react must never import from next/*. Next.js lives only in apps/.
- Interactive components start with "use client"; static ones stay Server Components.
- No Math.random() in render. All tilt, wobble and jitter come from seed() in packages/react/src/seed.ts.
- Colors, fonts, motion come only from packages/tokens CSS variables. No hex values in components.
- Every component: native element first, keyboard support, story for every state, Vitest test for keyboard behavior.
- Respect prefers-reduced-motion in every animation.

## Commands
pnpm dev | pnpm test | pnpm lint | pnpm build | pnpm changeset
```

**Phase prompts** (one per milestone; paste, then review the diff before the next)

1. "Set up the pnpm + Turborepo monorepo from the PRD's repo tree: tokens and react packages, Next.js 15 docs and dispatch-demo apps, Storybook. CI runs lint, types and tests."
2. "Build `packages/tokens` from the PRD's token tables, export CSS variables and a typed object, and wire `next/font` in the docs app to the font tokens."
3. "Port the prototype's Button to `packages/react`: CSS Modules, seeded tilt, peel on hover, squish on press. Write stories for every state and Vitest tests for Space and Enter."
4. "Add a Playwright test that builds the docs app and fails on any hydration warning."

**Rules for yourself**

- Write the props interface by hand before asking for an implementation.
- Never merge code you cannot explain line by line in an interview.
- Log each real decision (controlled vs uncontrolled, why CSS Modules) in `docs/decisions/`; these become your case study.

## Success metrics, risks and open questions

Plop! succeeds if it saves real build time on client work and gives the author concrete stories for mid-level interviews.

**Success metrics**

| Metric | Target | By |
| --- | --- | --- |
| v0.1 published to npm, docs and demo live | Done | Week 6 |
| Accessibility violations (axe, serious or critical) | 0 | Every release |
| Hydration warnings in docs and demo builds | 0 | Every release |
| Client projects using Plop! | 1 | v1.0 |
| Time to build a new dispatch screen vs. before Plop! | At least 40% faster | v1.0 |
| Written decision records for the case study | At least 8 | v1.0 |

**Risks**

| Risk | Fallback |
| --- | --- |
| SVG filters slow on low-end Android phones | Static wobble paths on small screens; boil only on hover-capable devices |
| Polishing never ends | Scope table is fixed; new ideas go to a backlog until v0.1 ships |
| Next.js upgrades break the apps | Pin versions; the library itself never depends on Next.js |
| Hand-drawn look hurts readability for older users | Lettering limited to short labels; body text in Sketchpop Regular upright at 19px |
| Sketchpop covers only A–Z, a–z, 0–9 and basic punctuation (no ñ, curly quotes, @ or %) | Test with real barangay names early; fallback stack in tokens |

**Open questions**

- [ ] Library name on npm: is `@plop-ui` available, or use a personal scope? (blocks publishing)
- [ ] MIT license, or keep source-available until v1.0? (packages say MIT for now; no LICENSE file yet)
- [ ] Where do the docs live: `plop-ui.vercel.app`, or a custom domain?
- [ ] Should `MapPanel` use MapLibre or Leaflet given the dispatch app's offline needs?
- [ ] Does Quadsync or MEC need sign-off before Plop! is used in client work?
