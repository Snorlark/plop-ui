# Performance audit: plopui.com docs site

Date: 2026-10-30 · Scope: `apps/docs` and the `@plop-ui/react` components it shows · Tracking issue: #67
Read-only audit: no source file was changed.

## 1. Executive summary

The site is not heavy, it's **busy**. JavaScript is modest (102 KB shared, 156 KB on `/`, 174 KB on `/playground`), taps respond in 64–120 ms on a phone with a 4× slower CPU, and nothing overflows on any screen size. What makes it feel laggy is **work that never stops**:

- **The footer** plays 33 looping SVG (SMIL) animations inside one full-width wobble filter, on every page, from load, even off screen. On a docs page it is the *only* thing keeping the CPU busy: pausing it takes idle CPU from **12 % → 0 %** and style recalculations from **580/s → 1/s**.
- **The home page** also never goes idle: PaperStack's boil, the StatusTimeline dots and the Avatar blinks keep looping off screen. Idle CPU is **~33 %** of a throttled phone, with **60 layouts/s**, and it doesn't drop when you scroll away.
- **First load on phones** is slow for a different reason: all **8 font files (≈258 KB)** are preloaded on every page (2 are never used), and the biggest text (hero title, doc headings) waits behind a crayon SVG filter and a write-on animation. Mobile Lighthouse is **82–89**, LCP **3.6–3.9 s**.

The fixes are mostly *gating* (run the animation only while it's on screen), not removing anything. The look and motion can stay as they are.

## 2. Frontend architecture overview

| Area | What's there |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, mostly static (SSG) pages |
| Build | Next (webpack) for the site; esbuild for `@plop-ui/react` |
| Styling | CSS Modules + one global `site.css` (658 lines); tokens as CSS variables; no Tailwind |
| Animation | No libraries: CSS keyframes and transitions, SMIL in the footer and 404 scenes, WAAPI for ink bursts, view transitions for the paper ↔ mat tear, scroll-driven `view()` timelines |
| State | React context (`_kit/Providers.tsx`: surface, haptics, sound); local state elsewhere |
| Dependencies | Lean: next, react, MDX, `@radix-ui/react-switch`. No icon library (hand-drawn SVG), no third-party scripts, no images on the site |
| Fonts | Sketchpop via `next/font/local` (8 faces, all preloaded) + Patrick Hand via `next/font/google` |
| Code splitting | None: no `next/dynamic` or `React.lazy`; 26 of 44 app files are client components |

## 3. Rendering performance

- Interactions are fast. Worst event duration with the CPU slowed 4×: `/` 120 ms, `/playground` 80 ms, Button and Select pages 64 ms. All are under the 200 ms INP target.
- Long tasks on load: 1–2 per page, 57–258 ms (the 258 ms one is on `/`).
- `Providers.tsx:95-111` passes a new object as the context value on every render, so every consumer re-renders. It's rare in practice (P3).
- `/playground` drag: each `pointermove` re-renders the whole board, writes `localStorage` and rebuilds the Inspector's ResizeObserver (`StickerBoard.tsx:170-184`, `Inspector.tsx:45-73`) (P2).

## 4. Animation performance

| Finding | Evidence |
| --- | --- |
| Footer: 33 infinite SMIL animations under one 1440×380 wobble filter (`_site/footerScene.ts:10`, `FooterFactory.tsx:40-51`), no IntersectionObserver or `visibilitychange` | Pausing them on `/docs/getting-started`: CPU 12 % → 0 %, style recalcs 580/s → 1/s, layouts 60/s → 1/s |
| Home: 21 infinite animations. PaperStack's sheet 0 stays `data-active` off screen (`PaperStack.tsx:174-183,220`); StatusTimeline current-dot boil (`StatusTimeline.module.css:74`, 3 timelines); Avatar 5 s blink (`Avatar.module.css:64`) | With the footer paused, `/` still uses 18 % CPU and does 60 layouts/s. Pausing every animation brings it to 0 % |
| Filter keyframes (`filter: url(#boil-n)` swaps) can't run on the compositor, so each step repaints on the main thread | Code; same steps in profiling |
| Layout-triggering transitions: `.doc-nav`/`.pg-picker` animate `top` (`site.css:101`); button hover peel drives `.fold` width and height (`Sticker.module.css:3-7,39`); footer `plopdrop` animates `left/top`; Progress animates `width`; Ride-along animates width and height | Code |

Already good: reduced motion is respected everywhere, InkBurst uses WAAPI transform and opacity and removes its nodes, scroll-driven timelines run on the compositor, and every listener and timer reviewed is cleaned up.

## 5. DOM complexity

| Page | DOM nodes | Elements with a CSS `filter` | SVG `<filter>` defs |
| --- | --- | --- | --- |
| `/` | 4,315 | 135 | 5 |
| `/docs/components/button` | 1,547 | 85 | 5 |
| `/playground` | 1,006 | 59 | 9 |

The home "crowd" renders 3×44 = 132 Avatar SVGs, of which only about 12 are visible on a phone (`Home.tsx:77-82,132-149`). That is the biggest share of the home DOM.

## 6. CSS and visual effects

- One global stylesheet blocks rendering for 290–430 ms on mobile, with 11–34 KB unused per page. Total CSS is about 37 KB gzipped across 5 files.
- `.site-header[data-scrolled]` uses `background-attachment: fixed` with a texture on a sticky header (`site.css:92`), which repaints on every scroll frame in Chrome.
- The crayon SVG filter sits on large text: the hero title (`site.css:211`) and doc headings (`Heading.module.css:17`), combined with a per-letter write-on animation right in the LCP window.

## 7. JavaScript bundle

| Chunk | Raw / gzip | Notes |
| --- | --- | --- |
| framework | 185 / 58 KB | React |
| `63cfd8a4…` | 168 / 53 KB | react-dom (shared) |
| `993…` | 169 / 45 KB | Kit and site chrome (shared) |
| main + polyfills | 234 / 74 KB | Next runtime |
| `/playground` page | 73 / 22 KB | Imports all 3 tools; only 1 mounts |

No oversized or duplicate dependencies were found. `_kit/demos.tsx` ships every demo to every component page (P3).

## 8. Images, icons and fonts

- No images on the site. Icons are hand-drawn inline SVG, with no icon library.
- **Fonts: 274 KB, half the page weight.** All 8 Sketchpop faces are preloaded. Light (300, upright and italic) is never used anywhere. Font weights used: 700 (55×), 900 (26×), 400 (6×), 600 (2×, synthesized).

## 9. Component showcase

- Each component page mounts one demo, and `/playground` mounts one tool, so cost doesn't grow with the size of the library. ✅
- But the always-on chrome (header texture, footer scene) costs more than the demos themselves.
- Scaling to 30+ demos on one page hasn't been tested, because no page does that today. `/lab/stress` exists for it.

## 10. Mobile

- No horizontal overflow at 320, 390, 768, 1024 or 1440 px on 6 pages.
- Scrolling with the CPU slowed 4× runs at 57–60 fps in headless Chrome. But headless Chrome has no GPU, so filter repaint cost on real phones is **not measured**.
- Layout shift: `.home-hero__cta` (0.102 on prod mobile); `/playground` footer (0.334 prod desktop, 0.48 local mobile). The Suspense fallback is one line tall, so the footer jumps when the tools appear (`playground/page.tsx:19-21`).

## 11. Core Web Vitals

**Production, Lighthouse mobile:**

| Page | Score | LCP | CLS | SI | TBT |
| --- | --- | --- | --- | --- | --- |
| `/` | 82 | 3.9 s | 0.102 | 4.7 s | 30 ms |
| `/docs/components/button` | 88 | 3.7 s | 0 | 3.1 s | 0 ms |
| `/playground` | 89 | 3.6 s | 0 | 3.3 s | 0 ms |

Desktop: 99–100, except `/playground` at 84 (CLS 0.334).

**Local production build, median of 2 runs:** `/` 84 · LCP 4.47 s; button 85 · 4.27 s; `/playground` 60 · 5.06 s · CLS 0.482.

LCP breakdown on every page: almost all of it is **render delay** (2.5–3 s), not download.

## 12. Issues by priority

| P | Component / file | Problem | Evidence | Fix |
| --- | --- | --- | --- | --- |
| **P0** | `_site/FooterFactory.tsx`, `footerScene.ts` | 33 infinite SMIL animations under a full-scene filter, always running | **Measured**: 12 % → 0 % idle CPU when paused | Pause on mount; IntersectionObserver plays only while visible; pause on `document.hidden`; move the filter off the moving parts |
| **P1** | `_home/PaperStack.tsx` | Boil and 4 loops stay active off screen | **Measured** (part of `/`'s 18 % after the footer fix) | Set `data-active` only while the track intersects |
| **P1** | `StatusTimeline.module.css`, `Avatar.module.css` (home) | Infinite boil and blink off screen | **Measured** (same) | `content-visibility: auto` on below-the-fold home sections, or one IntersectionObserver pausing `animation-play-state` |
| **P1** | `app/fonts.ts` | 8 faces preloaded, 2 never used, about 258 KB | Lighthouse network: fonts 274 KB of 559 KB | Drop Light from the site; `preload: false`, or preload only the 3 above-the-fold faces |
| **P1** | `site.css:211`, `_home/HeroTitle.tsx`, `Heading.module.css` | Crayon filter plus write-on on the LCP text | LCP render delay 2.5–3 s (**suspected** cause) | Keep the server-painted text visible on first load; apply the filter after the write-on finishes |
| **P1** | `site.css:92` | `background-attachment: fixed` on the sticky header | Known Chrome repaint behavior (**suspected**, not traced) | Fixed pseudo-element plus `clip-path`, like `.site::before` |
| **P2** | `playground/page.tsx`, `PlaygroundTools.tsx` | One-line Suspense fallback causes the footer shift | **Measured** CLS 0.334–0.48 | Fallback with min-height; `next/dynamic` for the inactive tools |
| **P2** | `_home/Home.tsx` | 132 Avatar SVGs, about 12 visible | **Measured**: 4,315 nodes | Render about 16 per row, reuse via `<symbol>`/`<use>` |
| **P2** | `.home-hero__cta` | Layout shift on mobile | **Measured** CLS 0.102 | Reserve its height |
| **P2** | `Providers.tsx:76-82`, `HeaderBar.tsx:18-26` | Scroll handler writes an attribute, then reads `offsetHeight` | Code (forced reflow **suspected**) | Write only on change; cache height via ResizeObserver; rAF |
| **P2** | `site.css:101`, `Sticker.module.css` | Animating `top` / fold width and height | Code | `transform` instead |
| **P2** | `StickerBoard.tsx`, `Inspector.tsx` | Drag does a full re-render, a storage write and observer churn per move | Code | Ref transform while dragging; commit on pointerup |
| **P2** | `site.css` (global) | Render-blocking, 11–34 KB unused per page | Lighthouse | Move page-specific rules into CSS Modules |
| P3 | footer `plopdrop`, `Progress`, Ride-along | Layout-property animations | Code | `transform`, `clip-path`, `offset-path` |
| P3 | `Providers.tsx:95-111` | Context value not memoized | Code | `useMemo`, functional updates |
| P3 | `_kit/demos.tsx` | Every demo shipped to every component page | Code | One module per demo, or `next/dynamic` |
| P3 | `useBoil.ts`, `Sticker.tsx:135-139` | Interval not paused when hidden; timers array never pruned | Code | Pause on hidden; prune ids |

## 13. Optimization roadmap

1. **Stop idle work.** Fixes P0 and the two P1 off-screen loops. Expected result: idle CPU near 0 % on every page; this is the biggest felt improvement.
2. **First load.** Fixes the P1 fonts and LCP text items, plus the CLS items. Target: Lighthouse mobile ≥ 90, LCP ≤ 2.5 s, CLS < 0.1.
3. **Smooth interactions.** The P1 header repaint plus the P2 scroll, transition and drag items.
4. **Cleanup.** P2 DOM and CSS splitting, then the P3 items.
5. **Guard rails.** Lighthouse CI plus an "idle CPU" Playwright check (below) so it doesn't regress.

## 14. Exact files to modify

`apps/docs/app/_site/FooterFactory.tsx`, `_site/footerScene.ts`, `_site/notFoundScene.ts`, `_home/PaperStack.tsx`, `_home/Home.tsx`, `_home/HeroTitle.tsx`, `app/site.css`, `app/fonts.ts`, `playground/page.tsx`, `playground/PlaygroundTools.tsx`, `playground/StickerBoard.tsx`, `playground/Inspector.tsx`, `_kit/Providers.tsx`, `_site/HeaderBar.tsx`, `_kit/demos.tsx`; `packages/react/src/`: `StatusTimeline`, `Avatar`, `Heading`, `Sticker`, `Progress`, `hooks/useBoil.ts`.

## 15. Risks and trade-offs

- **`content-visibility: auto`** can break the sticky PaperStack and the `view()` scroll timelines. Test it section by section.
- **Pausing the footer off screen:** the scene should resume where it stopped, not restart. SMIL `pauseAnimations()` and `unpauseAnimations()` do that.
- **Not preloading fonts** can show the fallback font a little longer (`display: swap` is already on). Preloading the 3 above-the-fold faces keeps that short.
- **Delaying the crayon filter on headings:** the first paint looks cleaner for a moment, then gets its texture. That's a visible but small change, so it needs your sign-off.
- **Library changes** (StatusTimeline, Avatar, Sticker, Progress) reach users of `@plop-ui/react`. They need a changeset and stories checked in Storybook.

## 16. Performance testing strategy

- **Idle-CPU check (Playwright):** Pixel 7, CPU slowed 4×. Load, wait 3 s, read CDP `Performance.getMetrics` over 5 s. Pass when `TaskDuration` < 5 % and `LayoutCount` < 5/s, at the top of the page and at the bottom.
- **Interaction check:** `PerformanceObserver({ type: "event" })`, worst duration < 200 ms on `/`, a component page and `/playground`.
- **Lighthouse CI** (mobile): `/`, `/docs/components/button`, `/playground`; score ≥ 90, LCP ≤ 2.5 s, CLS < 0.1.
- **Real devices:** a mid-range Android phone with Chrome (DevTools Performance panel over USB) and an iPhone with Safari (Web Inspector Timelines). Scroll the home page and the footer, drag on `/playground`, switch paper ↔ mat.
- **Not done in this audit:** React DevTools Profiler, memory over time (the heap is a steady 4–5 MB after load), real-device GPU cost of the filters, WebPageTest.

### Method

Measured with production builds (plopui.com and a local `next build`), Lighthouse 12.6.1 with simulated mobile throttling, and Playwright on Chromium with Pixel 7 emulation and the CPU slowed 4×. Idle cost was read from CDP `Performance.getMetrics` (TaskDuration, LayoutCount, RecalcStyleCount) over 5 s, then again with the footer's SMIL paused, with all SMIL paused, and with every animation paused, to attribute the cost to each source.
