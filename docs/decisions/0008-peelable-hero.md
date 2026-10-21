# 0008 — Home hero: real components, still crowd, one scroll transition

**Decision.** The home page keeps its original hero layout (kicker, headline, Get started beside the install command) with three upgrades: the headline is the kit's `Heading` (letters write on), Get started is a `ButtonLink` with `buddy="peek"`, and the copy button is an `IconButton`. Everything on the sticker sheet is a real `@plop-ui/react` component. The avatar crowd runs the full width of the screen. A peel-and-throw toy on the sheet was tried and removed.

**Performance.** The crowd's ~100 avatars are drawn still: no SVG wobble filter and no blink (`data-plop-motion="reduce"` plus `filter: none`). Blinking inside filtered SVGs made the browser re-run the filters nearly every frame; measured main-thread work at the crowd roughly halved, and scrolling holds 60 fps.

**Open.** `Preview.tsx` is a temporary picker comparing two hero backgrounds (paper grain, cutting mat) and three hero-to-letter transitions (Drift and Sheet slide are CSS scroll-driven animations on the compositor; Pop burst plays once). Keep one of each and delete the rest.
