# Tasks

The working tracker for PlopUI. [PRD.md](PRD.md) says *what* and *why*; this file says *what's next*.

**How to use it:** tick a box in the same pull request that finishes the work. Add new work under the right heading with a one-line "done when". If it isn't in the PRD's scope table, write down why before adding it (PRD: "Polishing never ends").

Legend: 🔴 blocks a release · 🟡 should happen this milestone · ⚪ nice to have

---

## 1. Decisions only you can make

These block publishing. Nothing else in "Next up" depends on them, so work can continue meanwhile.

- [ ] 🔴 **npm scope.** Check whether `@plop-ui` is free on npm (`npm view @plop-ui/react`). If not, pick a personal scope and rename the 3 packages.
  Done when: the scope is reserved on npm under your account.
- [x] 🔴 **License.** MIT now, or source-available until v1.0? The packages say MIT, but there's no `LICENSE` file at the root.
  Done when: `LICENSE` exists and matches every `package.json` `license` field.
- [ ] 🟡 **Docs domain.** `plop-ui.vercel.app` or a custom domain?
- [ ] 🟡 **Client sign-off.** Does Quadsync or MEC need to approve Plop! before it's used in client work? (PRD open question)
- [ ] ⚪ **MapPanel engine** for v1.0: MapLibre or Leaflet, given the dispatch app works offline.

## 2. Next up (in order)

### Ship v0.1 to npm
- [x] 🔴 Add the root `LICENSE` file (after the decision above).
- [ ] 🔴 Write the first changeset: `pnpm changeset` → minor for `@plop-ui/tokens`, `@plop-ui/fonts`, `@plop-ui/react`.
- [ ] 🔴 Add `NPM_TOKEN` to the GitHub repo secrets and a release workflow (Changesets action: opens the "Version packages" PR, publishes on merge, with provenance).
  Done when: `npm i @plop-ui/react` works in a fresh project.
- [ ] 🔴 Smoke-test the published package in a brand-new Next.js app and a Vite app: styles load, fonts load, a Server Component page renders `StatusTimeline` with no client JS.

### Deploy
- [ ] 🔴 Deploy `apps/docs` to Vercel (root: `apps/docs`, build: `pnpm build`). Turn on preview deploys for pull requests.
- [ ] 🟡 Deploy Storybook to Vercel (or Chromatic) and link it from the footer ("Find PlopUI on").
- [ ] 🟡 Replace the placeholder npm and Changelog links in `apps/docs/app/_site/SiteFooter.tsx` once they exist.

### Dispatch demo (PRD: `apps/dispatch-demo`)
- [x] 🟡 Scaffold a Next.js 15 app in `apps/dispatch-demo` that uses only Plop! components.
- [x] 🟡 Live incident queue fed by a Server-Sent Events Route Handler (`app/api/incidents/stream/route.ts`), mock incidents every few seconds.
- [x] 🟡 "Send report" form with a Server Action, `useOptimistic` and `<Button loading>`.
- [ ] 🟡 Deploy it (Vercel) and add the "Dispatch demo" link to the footer.
- [ ] ⚪ Take the portfolio screenshot and write the case study page on the docs site.
  Done when: the demo is deployed and linked from the footer ("Dispatch demo").

### v0.3 ops pack (still to build)
- [ ] 🟡 `DispatchQueue`: a list of incidents built on `TicketCard`, keyboard navigable, with sorting by priority.
- [ ] 🟡 `SyncIndicator`: online / syncing / offline with queued count; uses `Progress` and `StatusDot`.
- [ ] ⚪ `RoleGate`: renders children only for allowed roles (no visual of its own).
  For each: component + CSS Module, tests (keyboard + states), Storybook stories, a registry entry in `apps/docs/app/_site/registry.ts`, a demo in `apps/docs/app/_kit/demos.tsx`, and a Playground entry.

## 3. Quality gates still missing (PRD "Testing and quality gates")

- [ ] 🟡 **Visual regression.** Chromatic or Playwright screenshots of every story. Seeded randomness keeps snapshots stable.
- [ ] 🟡 **Lighthouse CI** on the docs site: Performance and Accessibility ≥ 90.
- [ ] 🟡 **Contrast audit script.** Playwright script that measures every visible text element against its real background on all 5 surfaces in light and dark (axe already runs on `/kit` and the Playground in all 10 combinations).
- [ ] 🟡 **Manual phone check** before each release: Android Chrome and iPhone Safari. Haptics fire, presses feel instant, VoiceOver and TalkBack read every control.
- [ ] ⚪ Performance budget: the SVG filters must not push Interaction to Next Paint over 200 ms on a low-end Android phone. If they do, fall back to static wobble on small screens (PRD risk table).

## 4. Docs and content

- [ ] 🟡 Hand-write better descriptions for props that still show "—" in the generated tables (`className`, `id`, and a few others): add JSDoc in `packages/react/src`, the tables pick it up.
- [ ] 🟡 "Do / Don't" visuals on component pages (right now they're text only).
- [ ] ⚪ Add Tooltip, RadioGroup, Tabs and Cards to the Playground (`apps/docs/app/playground/Playground.tsx`, add an entry to `ENTRIES`).
- [ ] ⚪ Changelog page fed from Changesets.
- [ ] ⚪ Test the lettering with real barangay names that use ñ (Sketchpop falls back to Patrick Hand for it).

## 5. Later (v1.0)

- [ ] `MapPanel` (MapLibre wrapper).
- [ ] Dark mode audit across every component and page.
- [ ] Figma file synced with the tokens.
- [ ] 30 days of real use in the dispatch app, no open a11y bugs.
- [ ] At least 8 decision records (5 so far in `docs/decisions/`).

---

## Done

- [x] Monorepo: pnpm + Turborepo, strict TypeScript, ESLint rules from CLAUDE.md, Changesets, CI.
- [x] `@plop-ui/tokens`: colors, contrast roles, status mapping, type, motion, 5 surfaces × light/dark.
- [x] `@plop-ui/fonts`: Sketchpop (woff2 + ttf), OFL license, font build tools.
- [x] `@plop-ui/react`: every v0.1 component and hook, plus the rest of the prototype kit, `ButtonLink`, ink burst and `toast()`.
- [x] 100+ unit tests (~96% line coverage); size budgets met (Button 3.9 kB, library 16.9 kB).
- [x] Storybook with every state and the a11y addon.
- [x] Docs site: landing page from the "PlopUI docs website" design, a page per component with generated props tables, search, Playground, `/kit`.
- [x] Playwright: no hydration warnings on any page, zero serious axe violations on every page, `/kit` and Playground on all 5 surfaces × light/dark, keyboard checks.
