# Performance optimization checklist

Tracks #67. Full findings and evidence: [PERFORMANCE_AUDIT_REPORT.md](PERFORMANCE_AUDIT_REPORT.md).
Tick "done" in the PR that ships the fix, and tick "verified" once the measurement is taken.

## P0: critical

- [x] **Footer scene pauses when off screen or when the tab is hidden** (`_site/FooterFactory.tsx`, `footerScene.ts`)
  - [x] verified: idle CPU on `/docs/getting-started` at the top of the page 12 % → 0 %; guarded by `e2e/idle.spec.ts`
  - [ ] follow-up: while the footer *is* on screen its 33 SMIL loops still cost about 15 % of a throttled phone's CPU (not the filter: removing it changes nothing). Porting the loops to CSS animations would fix it.

## P1: high

- [x] **PaperStack loops pause while off screen** (`_home/PaperStack.tsx`, `data-pausable` + `_site/OffscreenPause.tsx`)
- [x] **Home StatusTimeline and Avatar loops pause off screen** (`OffscreenPause` pauses clock-driven infinite loops; scroll-driven `view()` animations are left alone)
  - [ ] partly verified: `/` at the top is 33 % → 17 %. What's left is the loops that are on screen in the hero (StatusTimeline boil, Buddy's thinking dots), which are part of the design
- [x] **Fonts: Light dropped; nothing preloaded, so each page fetches only the faces it uses** (`app/fonts.ts`)
  - [x] verified: page weight 576 → 435 KB on `/`, 643 → 421 KB on `/playground`
- [ ] ~~LCP text: no crayon filter or write-on in the first paint~~ not needed: measured locally, LCP = FCP (the text paints with the first paint). Lighthouse's simulated LCP adds the JS downloaded before it, so the hero design stays as it is
  - [ ] simulated mobile LCP is still 3.3–3.6 s (was 4.3–5.1 s locally); cutting it further means shipping less JS before first paint
- [x] **Sticky header texture without `background-attachment: fixed`** (`site.css:92`): the header sits at the screen's top-left, so the texture still lines up
  - [ ] verify on a real device with DevTools paint flashing

## P2: moderate

- [x] `/playground` Suspense fallback reserves the tool's height, and inactive tools load with `next/dynamic`
  - [x] verified: CLS 0.48 → 0, Lighthouse mobile 60 → 88 (local build)
- [x] Hero headline holds its 5th line open at 400–480 px, where Sketchpop wraps one line deeper than the fallback font (verified: CLS on `/` 0.102 → 0.029)
- [x] Home crowd: smaller screens skip the faces they'd never show (`display: none` past face 24 on phones and face 38 on tablets), still covering the ±320 px drift. The DOM count is unchanged, but those faces get no style, layout or paint
- [x] Scroll handler: `data-scrolling` written once per scroll burst; header height from a ResizeObserver (`Providers.tsx`, `HeaderBar.tsx`)
- [ ] `.doc-nav` / `.pg-picker` move with `transform` instead of `top` (`site.css:101`): skipped. It runs only during the 0.3 s header slide, and a sidebar that isn't stuck yet would overlap the content with `transform`
- [ ] Button peel fold animates `transform`, not width and height (`Sticker.module.css`): skipped. The fold is absolutely positioned (a tiny relayout, on desktop hover only), and a transform version needs typed `calc()` division that Safari doesn't support yet
- [x] Playground drag: the board is measured once per drag, and the board is saved once when the drag ends (`StickerBoard.tsx`). The Inspector still re-measures, because it follows the sticker
- [ ] Split page-specific rules out of the global `site.css` (verified: unused CSS under 5 KB per page)

## P3: minor

- [ ] Footer `plopdrop`, Progress fill and Ride-along use `transform`, `clip-path` or `offset-path`
- [x] `Providers` context value memoized
- [ ] `_kit/demos.tsx`: one module per demo, or `next/dynamic`
- [ ] `useBoil` pauses when the tab is hidden; `Sticker` prunes its fired timer ids
- [x] 404 scene pauses like the footer (`NotFound.tsx`)

## Guard rails

- [x] Playwright idle test in CI (`e2e/idle.spec.ts`): fewer than 10 layouts and 20 style recalcs in 2 s on 3 pages (Chromium). It fails against the old footer
- [ ] Lighthouse CI on mobile: score ≥ 90, LCP ≤ 2.5 s, CLS < 0.1
- [ ] Real-device pass: mid-range Android phone with Chrome and an iPhone with Safari (scroll home and footer, drag on the playground, paper ↔ mat)
