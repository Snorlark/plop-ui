# Tasks

The working tracker for PlopUI. [PRD.md](PRD.md) says *what* and *why*; this file says *what's next*.

**How to use it:** tick a box in the same pull request that finishes the work. Add new work under the right heading with a one-line "done when". If it isn't in the PRD's scope table, write down why before adding it (PRD: "Polishing never ends").

Legend: 🔴 blocks a release · 🟡 should happen this milestone · ⚪ nice to have

---

## 1. Decisions only you can make

Only you can settle these. The client sign-off should be answered before the launch posts; the rest can wait.

- [x] 🔴 **npm scope.** `@plop-ui` is reserved (the `plop-ui` npm organization) and all three packages are published.
- [x] 🔴 **License.** MIT now, or source-available until v1.0? The packages say MIT, but there's no `LICENSE` file at the root.
  Done when: `LICENSE` exists and matches every `package.json` `license` field.
- [x] 🟡 **Docs domain.** `plopui.com` (bought at Spaceship, DNS points at Vercel, HTTPS on). `ui.plop.com` wasn't possible: `plop.com` belongs to someone else.
- [ ] 🟡 Finish the domain switch: make `plopui.com` the primary domain in Vercel (with `www` redirecting to it), set `NEXT_PUBLIC_SITE_URL=https://plopui.com` for Production and redeploy, redirect `plop-ui.vercel.app` to it, and update the GitHub About website.
  Done when: https://plopui.com/sitemap.xml lists `plopui.com` URLs.
- [ ] 🔴 **Client sign-off.** Does Quadsync or MEC need to approve PlopUI before it's used in client work, or before it's announced publicly? (PRD open question)
  Done when: answered in writing, before the launch posts go out.
- [ ] ⚪ **MapPanel engine** for v1.0: MapLibre or Leaflet, given the dispatch app works offline.

## 2. Next up (in order)

### Ship v0.1 to npm
- [x] 🔴 Add the root `LICENSE` file (after the decision above).
- [x] 🔴 Write the first changeset and version the packages: `@plop-ui/tokens`, `@plop-ui/fonts` and `@plop-ui/react` at 0.1.0, with a CHANGELOG.md each.
- [x] 🔴 Release workflow (`.github/workflows/release.yml`, Changesets action: opens the "Version packages" PR, publishes on merge). 0.1.0 published 2026-10-22.
- [x] 🔴 Smoke test in a brand-new Next.js 16 app: installs from npm, styles and fonts load, `Button`, `Tag`, `TicketCard`, `StatusTimeline` and `toast()` work, no console errors.
- [ ] 🟡 Smoke test in a Vite app, and check that a Server Component page renders `StatusTimeline` with no client JS.

### Finish the release setup
- [ ] 🔴 **Trusted publishing.** On npm, for each package: Settings → Trusted Publisher → GitHub Actions (`Snorlark` / `plop-ui` / `release.yml`). Then delete the npm token and the `NPM_TOKEN` repo secret.
  Done when: a release publishes with no token.
- [ ] 🟡 **Provenance.** 0.1.0 went out without a provenance attestation. Check the next release has one (`npm view @plop-ui/react dist.attestations`); if not, publish with `npm` instead of `pnpm` in the workflow.
- [ ] 🟡 Settings → Actions → General: allow GitHub Actions to create and approve pull requests (so the bot can open "Version packages").
- [ ] 🟡 Delete the stale `changeset-release/main` branch (left by the first workflow run) and the merged feature branches.
- [ ] 🟡 GitHub Release for `@plop-ui/react@0.1.0`: the changelog plus a GIF.

### Deploy
- [x] 🔴 Deploy `apps/docs` to Vercel: live at https://plopui.com, with the sitemap, robots, social preview, `llms.txt`, privacy and changelog pages.
- [ ] 🟡 **Google Search Console:** verify `https://plopui.com` and submit `https://plopui.com/sitemap.xml`.
- [ ] 🟡 Deploy Storybook to Vercel (or Chromatic) and link it from the footer ("Find PlopUI on").
- [x] 🟡 Replace the placeholder npm and Changelog links in the footer (npm links go to the real packages; Changelog goes to `/changelog`).

### Dispatch demo (PRD: `apps/dispatch-demo`)
- [x] 🟡 Scaffold a Next.js 15 app in `apps/dispatch-demo` that uses only PlopUI components.
- [x] 🟡 Live incident queue fed by a Server-Sent Events Route Handler (`app/api/incidents/stream/route.ts`), mock incidents every few seconds.
- [x] 🟡 "Send report" form with a Server Action, `useOptimistic` and `<Button loading>`.
- [ ] 🟡 Deploy it: a second Vercel project from the same repo (root `apps/dispatch-demo`, build `cd ../.. && pnpm turbo run build --filter=@plop-ui/dispatch-demo`). Then add the "Dispatch demo" link to the footer and the README.
- [ ] ⚪ Take the portfolio screenshot and write the case study page on the docs site.
  Done when: the demo is deployed and linked from the footer ("Dispatch demo").

### Launch
- [ ] 🟡 GitHub About: description, website, topics; a social preview image (`apps/docs/app/opengraph-image.png`); pin the repo on your profile.
- [ ] 🟡 Demo video, 20–40 s: sticker presses, the toast buddy, the dispatch demo live, the header menus, the 404. Landscape plus a vertical cut.
- [ ] 🟡 Posts: LinkedIn, X and Bluesky, r/reactjs (Showoff Saturday), Show HN, dev.to, Philippine dev groups, Instagram Reels. Product Hunt a week or two later. Only after the client sign-off above.
- [ ] ⚪ A Claude Code skill (`skills/plop-ui/SKILL.md`) that teaches an AI to build with PlopUI, pointing at `llms-full.txt`.
- [ ] ⚪ shadcn-style registry of "blocks" (incident queue, unit board) built from the dispatch demo.

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
- [x] ⚪ Changelog page fed from Changesets (`/changelog`).
- [x] 🟡 "Good to know" in Getting Started: covering the whole screen with the paper, and why buttons stretch in a grid.
- [ ] ⚪ Test the lettering with real barangay names that use ñ (Sketchpop falls back to Patrick Hand for it).

## 5. Later (v1.0)

- [ ] `MapPanel` (MapLibre wrapper).
- [ ] Dark mode audit across every component and page.
- [ ] Figma file synced with the tokens.
- [ ] 30 days of real use in the dispatch app, no open a11y bugs.
- [x] At least 8 decision records (19 in `docs/decisions/`).

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
- [x] MIT `LICENSE`; the Sketchpop font and packages credit Lark Sigmuond Babao.
- [x] npm: `@plop-ui/tokens`, `@plop-ui/fonts`, `@plop-ui/react` 0.1.0 (2026-10-22), released by the Changesets workflow.
- [x] Docs site live on Vercel: mega-menu header, sticker-factory footer, Ride-along pass, privacy, changelog, `llms.txt`, a 404, and SEO basics.
- [x] Dispatch demo app built (`apps/dispatch-demo`): SSE queue, Server Action report form with `useOptimistic`.
