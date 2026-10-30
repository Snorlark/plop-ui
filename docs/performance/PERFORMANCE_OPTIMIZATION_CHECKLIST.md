# Performance optimization checklist

Tracks #67. Full findings and evidence: [PERFORMANCE_AUDIT_REPORT.md](PERFORMANCE_AUDIT_REPORT.md).
Tick "done" in the PR that ships the fix, and tick "verified" once the measurement is taken.

## P0: critical

- [ ] **Footer scene pauses when off screen or when the tab is hidden** (`_site/FooterFactory.tsx`, `footerScene.ts`)
  - [ ] verified: idle CPU on `/docs/getting-started` is about 0 % at the top of the page (now 12 %)

## P1: high

- [ ] **PaperStack is active only while its track is on screen** (`_home/PaperStack.tsx`)
- [ ] **Home StatusTimeline and Avatar loops pause off screen** (`content-visibility` or an IntersectionObserver)
  - [ ] verified: idle CPU on `/` is under 5 % at the top and at the bottom (now about 33 %)
- [ ] **Fonts: drop Light from the site; preload only the faces above the fold** (`app/fonts.ts`)
  - [ ] verified: font bytes on `/` under 120 KB (now 274 KB)
- [ ] **LCP text: no crayon filter or write-on in the first paint** (`site.css:211`, `HeroTitle.tsx`, `Heading`)
  - [ ] verified: mobile LCP ≤ 2.5 s on `/` and a component page (now 3.7–3.9 s)
- [ ] **Sticky header texture without `background-attachment: fixed`** (`site.css:92`)
  - [ ] verified: no header repaint per scroll frame (DevTools paint flashing)

## P2: moderate

- [ ] `/playground` Suspense fallback reserves the tool's height, and inactive tools load with `next/dynamic`
  - [ ] verified: CLS < 0.1 on `/playground` (now 0.334–0.48)
- [ ] `.home-hero__cta` reserves its height (verified: CLS < 0.1 on `/`, mobile)
- [ ] Home crowd: about 16 Avatars per row reused via `<symbol>`/`<use>` (verified: `/` under 2,000 nodes, now 4,315)
- [ ] Scroll handler: write `data-scrolling` only on change; header height cached; work in rAF (`Providers.tsx`, `HeaderBar.tsx`)
- [ ] `.doc-nav` / `.pg-picker` move with `transform` instead of `top` (`site.css:101`)
- [ ] Button peel fold animates `transform`, not width and height (`Sticker.module.css`), plus a changeset
- [ ] Playground drag: ref transform while dragging, commit and save on pointerup (`StickerBoard.tsx`, `Inspector.tsx`)
- [ ] Split page-specific rules out of the global `site.css` (verified: unused CSS under 5 KB per page)

## P3: minor

- [ ] Footer `plopdrop`, Progress fill and Ride-along use `transform`, `clip-path` or `offset-path`
- [ ] `Providers` context value memoized; functional updates
- [ ] `_kit/demos.tsx`: one module per demo, or `next/dynamic`
- [ ] `useBoil` pauses when the tab is hidden; `Sticker` prunes its fired timer ids
- [ ] 404 scene pauses like the footer (`notFoundScene.ts`)

## Guard rails

- [ ] Playwright idle-CPU test (Pixel 7, CPU slowed 4×, < 5 % over 5 s) in CI
- [ ] Lighthouse CI on mobile: score ≥ 90, LCP ≤ 2.5 s, CLS < 0.1
- [ ] Real-device pass: mid-range Android phone with Chrome and an iPhone with Safari (scroll home and footer, drag on the playground, paper ↔ mat)
