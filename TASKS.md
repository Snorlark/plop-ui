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
  Status (2026-10-27): the sitemap lists `plopui.com` and `www` redirects. Left for **You**: in Vercel, Settings → Domains → `plop-ui.vercel.app` → Edit → Redirect to `plopui.com` (it still serves the site with a 200); on GitHub, About ⚙ → Website `https://plopui.com`.
- [ ] 🔴 **You:** upload the social preview (Settings → General → Social preview). The image is `~/Documents/Github/plopui-social-preview.jpg`; its source lives in `docs/assets/og-card/page.tsx`.
- [ ] 🔴 **You:** GitHub About and topics. Description: "Hand-drawn React UI, imperfect on purpose. Wobbly stickers, washi tape and a hand-lettered font, accessible to WCAG AA." Topics: drop `dispatch`, `field-service`, `ticketing`; add `tactile`, `playful`, `whimsical`, `hand-drawn`, `design-system`.
- [x] 🔴 **Client sign-off.** Does Quadsync or MEC need to approve PlopUI before it's used in client work, or before it's announced publicly? (PRD open question)
  Done when: answered in writing, before the launch posts go out.

## 2. Before going public 🔴

- [ ] 🔴 **Test on more than Chrome.** **You:** if the Firefox bug you saw is something else, write it down here (which page, what you see). Check every page on Firefox, Safari (macOS and iPhone) and Edge: wobble filters, the paper ↔ mat tear, menus and their roll-up, Select and Menu sheets, scrollbars, toasts, the hero lettering.
  Done when: each browser's issues are listed here and fixed, or written down as known limits.
- [ ] 🔴 **Refresh bug.** **You:** write down the page, browser and what you see (a screen recording is best). Then fix it and add a test.

## 3. Next release 🟡

- [ ] 🟡 **Firefox hydration mismatch.** In production builds Firefox occasionally throws React error #418 (about 1 in 130 page loads, on random pages, already on `main`). React recovers on the client, so nothing visible breaks, but find the cause: something global (header, footer, Ride-along, layout script) renders differently on the server. Not reproducible on the dev server. CI retries the Firefox project once until then.

- [x] 🟡 **npm READMEs** for `@plop-ui/react` and `@plop-ui/tokens` (and the logo and links on the fonts one): logo, pitch, badges, a demo GIF (**You** record it), install, quick start, a component strip. Image links must work on npm while the repo is private (host them on plopui.com).
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
- [x] 🟡 **Sticker peel on the hero's sticker pack.** On hover, a sticker in the pack peels up from a corner like the React Bits "Sticker Peel" effect, and settles back when the pointer leaves. Prefer CSS and the kit's own motion tokens over adding GSAP; keyboard focus gets the same peel; off under reduced motion.
  Done when: hovering (or focusing) a sticker in the hero pack peels it, in every major browser, with no new heavy dependency.

## 4. Later ⚪

- [ ] ⚪ Automate the install stress test in CI on every release, and add yarn and bun.

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
- [x] Docs live at https://plopui.com (Spaceship DNS → Vercel), `www` redirects to it; Search Console verified and the sitemap submitted.
- [x] 0.3.1 released; trusted publisher fixed on `@plop-ui/tokens` and `@plop-ui/fonts`; the second collaborator on tokens checked.
- [x] Cross-browser fixes: pressing a sticker kept keyboard focus and its squish in Firefox and Safari (decision 0024); e2e runs on Chromium, Firefox and WebKit in CI.
- [x] Phone layout (Ride-along stamp, stacked props tables, one-row header); header Hick's law (one Settings sheet); install stress test (Vite + React 19, Next.js 16, Next.js 15; not yarn or bun).
- [x] New social preview with the new headline; `main` protected by a ruleset; `plopui.com` re-rated by Fortinet.
- [x] Docs site: a page per component with generated props tables, search and ⌘K palette, Playground, changelog, privacy, `llms.txt`, SEO, sticker-factory footer, Ride-along tour.
- [x] Rebrand: "Hand-drawn UI, imperfect on purpose"; "Plop!" → "PlopUI" in prose; the home page reworked (washi-tape section labels, two-part titles, the manifesto letter); sketchbook examples everywhere instead of dispatch.
- [x] Header: sections are links with a menu caret, a distinct active state, menus that unroll and roll back up; `/kit` removed (redirects to the Button docs); the 404 without the header; thin scrollbars that only show while scrolling.
- [x] Select / MultiSelect / Menu, with docs pages, stories and tests; their sheets open right under the button in any layout.
- [x] Storybook with every state and the a11y addon; 147 unit tests; size budgets met.
- [x] Playwright: no hydration warnings on any page, zero serious axe violations, the Playground on all 5 surfaces × light/dark, keyboard checks.
- [x] Dispatch demo app (`apps/dispatch-demo`), to be replaced by the demos site.
- [x] 23 decision records in `docs/decisions/`.
