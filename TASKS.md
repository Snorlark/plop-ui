# Tasks

The working tracker for PlopUI. [PRD.md](PRD.md) says *what* and *why*; this file says *what's next*, most important first.

**How to use it:** tick a box in the same pull request that finishes the work. Add new work under the right priority with a one-line "done when". If it isn't in the PRD's scope table, write down why before adding it (PRD: "Polishing never ends").

Legend: 🔴 before going public · 🟡 next release · ⚪ later · **You** only you can do it

Where things stand (2026-10-26): `@plop-ui/react` 0.3.0, `@plop-ui/tokens` and `@plop-ui/fonts` 0.2.1 on npm. The rebrand ("Hand-drawn UI, imperfect on purpose"), the new header, Select / MultiSelect / Menu and the dropdown fix are on `main`. 0.3.1 is waiting in the bot's version PR.

---

## 1. Now: before going public 🔴

### Release
- [x] 🔴 **You:** release 0.3.1. Close and reopen the bot's "chore(release): version packages" PR so CI runs, merge it, then approve the staged versions on npmjs.com (`npm stage list` / `npm stage approve <id>`): tokens, then fonts, then react.
  Done when: `npm view @plop-ui/react version` says 0.3.1.
- [x] 🔴 **You:** fix the trusted publisher on `@plop-ui/tokens` and `@plop-ui/fonts` (CI got `ENEEDAUTH` for both, so 0.2.1 was published by hand). It must match react's: `Snorlark` / `plop-ui` / `release.yml`, "npm stage publish".
  Done when: a release run stages tokens and fonts without errors.
- [x] 🔴 **You:** check the second collaborator on `@plop-ui/tokens` (the red avatar on npm). Remove it if it isn't you or your org.

### Cross-browser
- [x] 🔴 **Found and fixed in Firefox and Safari:** pressing a sticker lost keyboard focus and its squish (the iOS haptics fallback stole focus); tooltips and search results closed for the same reason. See decision 0024.
- [ ] 🔴 **Test on more than Chrome.** **You:** if the Firefox bug you saw is something else, write it down here (which page, what you see). Check every page on Firefox, Safari (macOS and iPhone) and Edge: wobble filters, the paper ↔ mat tear, menus and their roll-up, Select and Menu sheets, scrollbars, toasts, the hero lettering.
  Done when: each browser's issues are listed here and fixed, or written down as known limits.
- [x] 🔴 **Run e2e on Firefox and WebKit in CI.** Add `firefox` and `webkit` projects to `apps/docs/playwright.config.ts` (and install those browsers in `ci.yml`), so a Firefox or Safari bug fails the build.
  Done when: CI runs the e2e suite on Chromium, Firefox and WebKit.

### Fixes
- [x] 🔴 **Phone layout.** Done: the Ride-along ticket shrinks to a round stamp on phones (it covered content), props tables stack into cards, narrow horizontal timelines get smaller labels, and the header fits one row with three toggles. Still to add: a phone-layout test.
- [ ] 🔴 **Refresh bug.** **You:** write down the page, browser and what you see (a screen recording is best). Then fix it and add a test.
<<<<<<< HEAD
- [x] 🔴 **Header, Hick's law.** One Settings sticker opens a taped sheet with three switches (cutting mat / dark, haptics, sound) instead of three buttons in the bar. On phones the header is one row (logo, a round search sticker that opens the palette, settings, menu), down to 320px; the phone menu is a compact accordion. e2e test included.
- [x] 🔴 **Install stress test.** Done 2026-10-26 against the real npm packages: Vite + React 19 with pnpm (strict), Next.js 16 with npm, Next.js 15 with pnpm. Types resolve, builds pass, no console errors or hydration warnings in Chromium, Firefox and WebKit, and a Server Component page ships no `StatusTimeline` code. Not tested: yarn, bun. Note: pnpm 11 waits 24 hours before installing a newly published version (`minimum-release-age`), so pnpm users get a release a day later.
- [ ] ⚪ Automate the install stress test in CI on every release, and add yarn and bun.
=======

## 3. Next release 🟡

- [ ] ⚪ **WebKit axe flake on CI.** Once, on CI's Linux runner, `axe: /playground` on the iPhone project reported footer color-contrast (20 nodes). It never reproduced in 60 isolated runs or a full local Linux WebKit run. Safari and iPhone retry once in CI until it's understood.
>>>>>>> 71d2d14 (fix(e2e): stop the WebKit races that turned CI red)
- [ ] 🟡 **Firefox hydration mismatch.** In production builds Firefox occasionally throws React error #418 (about 1 in 130 page loads, on random pages, already on `main`). React recovers on the client, so nothing visible breaks, but find the cause: something global (header, footer, Ride-along, layout script) renders differently on the server. Not reproducible on the dev server. CI retries the Firefox project once until then.

### Rebrand leftovers
- [x] 🔴 **New social preview** with the new headline. Done; its source now lives in `docs/assets/og-card/page.tsx`. **You:** upload `~/Documents/Github/plopui-social-preview.jpg` to GitHub (Settings → General → Social preview).
- [ ] 🔴 **You:** GitHub About and topics. Description: "Hand-drawn React UI, imperfect on purpose. Wobbly stickers, washi tape and a hand-lettered font, accessible to WCAG AA." Topics: drop `dispatch`, `field-service`, `ticketing`; add `tactile`, `playful`, `whimsical`, `hand-drawn`, `design-system`.

### Your GitHub and launch steps
- [x] 🔴 **You:** protect `main` (Settings → Rules → Rulesets: block force pushes and deletions, require a PR and the `check` and `e2e` checks).
- [ ] 🔴 **You:** upload the social preview (Settings → General → Social preview).
- [x] 🔴 **You:** get `plopui.com` re-rated by Fortinet so office networks can open it.
- [x] 🔴 **You: client sign-off.** Does Quadsync or MEC need to approve PlopUI before it's used in client work or announced? (PRD open question)
  Done when: answered in writing, before the launch posts go out.

## 2. Next release 🟡

- [ ] 🟡 **npm READMEs** for `@plop-ui/react` and `@plop-ui/tokens` (and the logo and links on the fonts one): logo, pitch, badges, a demo GIF (**You** record it), install, quick start, a component strip. Image links must work on npm while the repo is private (host them on plopui.com).
- [ ] 🟡 **Demos site** at `demo.plopui.com` (`apps/demos`): the first three demos (Sketch café, Sketchbook with Select/MultiSelect/Menu, Settings page), "View code" and "Components used" on each, installed from npm. Then delete `apps/dispatch-demo`.
- [ ] 🟡 **Playground:** a radius option in the library and a slider; label editing everywhere; the missing components (Tooltip, RadioGroup, Tabs, Cards, Select, Menu); fix whatever is buggy on the sticker board.
- [ ] 🟡 **Design skill** (`skills/plopui-design/SKILL.md`): when to use which component, the one-ink rule, surfaces, the accessibility rules, the "imperfect on purpose" concept, links to `llms-full.txt`.
- [ ] 🟡 `Select` `name` prop: hidden inputs so it works in plain HTML forms and Server Actions.
- [ ] 🟡 Deploy Storybook (Vercel or Chromatic) and link it from the footer.
- [ ] 🟡 Hand-write descriptions for props that still show "—" in the generated tables (JSDoc in `packages/react/src`).
- [ ] 🟡 "Do / Don't" visuals on component pages (text only today).
- [ ] 🟡 **Manual phone check** before each release: Android Chrome and iPhone Safari; haptics fire, presses feel instant, VoiceOver and TalkBack read every control.

### Website
- [x] 🟡 **Smooth scroll** across the docs site (done for in-page links and the hero's down arrow, off under reduced motion) (anchor links, the "See what's in the pack" arrow, page scrolling). Off under reduced motion. Check it doesn't break the sticky PaperStack, the scroll-driven Why cards and the hero's drift, and that the header's hide-on-scroll still works.
  Done when: scrolling feels smooth in Chrome, Firefox and Safari, and every scroll animation still lines up.
- [ ] 🟡 **Sticker peel on the hero's sticker pack.** On hover, a sticker in the pack peels up from a corner like the React Bits "Sticker Peel" effect, and settles back when the pointer leaves. Prefer CSS and the kit's own motion tokens over adding GSAP; keyboard focus gets the same peel; off under reduced motion.
  Done when: hovering (or focusing) a sticker in the hero pack peels it, in every major browser, with no new heavy dependency.

## 3. Later ⚪

- [ ] ⚪ **Ops-flavored API names.** New names alongside `Tag status="dispatched" / "en-route" / "critical"`, `UnitCard`, `TicketCard` and `Eta`; remove the old ones at 1.0.
- [ ] ⚪ **Visual regression:** Playwright or Chromatic screenshots of every story (seeded randomness keeps them stable).
- [ ] ⚪ **Lighthouse CI** on the docs: Performance and Accessibility ≥ 90.
- [ ] ⚪ **Contrast audit script:** every visible text element against its real background, on all 5 surfaces in light and dark.
- [ ] ⚪ Performance budget: the SVG filters must keep Interaction to Next Paint under 200 ms on a low-end Android phone; fall back to static wobble on small screens if not.
- [ ] ⚪ Evals: prompts run through AI coding tools with `llms.txt` and the design skill; then decide on an MCP server.
- [ ] ⚪ A shadcn-style registry of blocks built from the demos.
- [ ] ⚪ Launch: demo video (20–40 s, landscape and vertical), posts (LinkedIn, X, Bluesky, r/reactjs Showoff Saturday, Show HN, dev.to, Philippine dev groups, Instagram Reels), Product Hunt a week or two later. Only after the client sign-off.
- [ ] ⚪ Dark mode audit across every component and page.
- [ ] ⚪ Figma file synced with the tokens.
- [ ] ⚪ Test the lettering with names that use ñ (Sketchpop falls back to Patrick Hand for it).

### Reconsider after the rebrand
These came from the original "real-time ops" plan. Keep, rename for everyday apps, or drop.
- [ ] ⚪ `DispatchQueue`, `SyncIndicator`, `RoleGate`.
- [ ] ⚪ `MapPanel` (MapLibre or Leaflet) for v1.0.
- [ ] ⚪ "30 days of real use in the dispatch app" as the v1.0 bar.

---

## Done

- [x] Monorepo: pnpm + Turborepo, strict TypeScript, ESLint rules from CLAUDE.md, Changesets, CI (`check` and `e2e`).
- [x] `@plop-ui/tokens`, `@plop-ui/fonts` (Sketchpop, OFL), `@plop-ui/react` with every v0.1 component and hook, plus the prototype kit, `ButtonLink`, ink burst and `toast()`.
- [x] npm scope `@plop-ui`, MIT `LICENSE`, author credit on the font and packages.
- [x] Releases: Changesets workflow on npm 11 with trusted publishing (no token), **staged publishing** with 2FA approval, provenance only while the repo is public.
- [x] 0.1.0 (2026-10-22), 0.2.0 (opt-in bursts in seven styles, toast bursts, kind-colored toast washes), 0.2.1 (rebrand descriptions, keywords, homepages), 0.3.0 (Select, MultiSelect, Menu).
- [x] Smoke test in a brand-new Next.js 16 app.
- [x] Docs live at https://plopui.com (Spaceship DNS → Vercel), `www` and `plop-ui.vercel.app` redirect to it; Search Console verified and the sitemap submitted.
- [x] Docs site: a page per component with generated props tables, search and ⌘K palette, Playground, changelog, privacy, `llms.txt`, SEO, sticker-factory footer, Ride-along tour.
- [x] Rebrand: "Hand-drawn UI, imperfect on purpose"; "Plop!" → "PlopUI" in prose; the home page reworked (washi-tape section labels, two-part titles, the manifesto letter); sketchbook examples everywhere instead of dispatch.
- [x] Header: sections are links with a menu caret, a distinct active state, menus that unroll and roll back up; `/kit` removed (redirects to the Button docs); the 404 without the header; thin scrollbars that only show while scrolling.
- [x] Select / MultiSelect / Menu, with docs pages, stories and tests; their sheets open right under the button in any layout.
- [x] Storybook with every state and the a11y addon; 147 unit tests; size budgets met.
- [x] Playwright: no hydration warnings on any page, zero serious axe violations, the Playground on all 5 surfaces × light/dark, keyboard checks.
- [x] Dispatch demo app (`apps/dispatch-demo`), to be replaced by the demos site.
- [x] 23 decision records in `docs/decisions/`.
