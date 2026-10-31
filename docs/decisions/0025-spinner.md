# 0025: Loading (Spinner, Progress, Skeleton, Loader)

Issue #74 asked for a Spinner. Built from the loading reference sheet, redrawn to match the kit, it grew into one Loading page.

- **Spinner** comes in five kinds. `ink` (default) is a marker arc surging round a dotted pencil guideline that never closes neatly. `dots` hop, stretch and squash. `scribble` is a stop-motion flipbook: the pen writes cursive loops stroke by stroke, holds, and they're rubbed out. `sticker` is a die-cut star flipped like a coin, with a paper back. `buddy` is Hum rocking while thinking. Lines draw in `currentColor`; wobble comes from `seed()`.
- **Performance rule:** every looping animation is a transform or opacity change on an HTML box or a whole `<svg>`, so the compositor runs it. The "boil" is several drawings on one strip, stepped through a window like flipbook frames. No stroke-dash, SVG-child or filter animations. The first version animated stroke-dash on SVG paths: 300 spinners ran at 9 fps. Now they hold the same frame rate as an idle page. `e2e/loading.spec.ts` checks the rule on `/lab/loading`.
- **Progress** gains `indeterminate`, a hatching band that sweeps by transform. **ProgressRing** traces a lumpy marker circle from the top and draws a tick at 100%.
- **Skeleton / SkeletonText** are hand-cut paper scraps (seeded corners, line lengths), `aria-hidden`; the region gets `aria-busy`. The shimmer is one transform per scrap.
- **Loader** is a spinner with manners: after `slowAfter` it says the wait is slow and offers Cancel. The `card` variant is a taped `Sheet` on dots, lined, kraft or plain paper, with Hum, rotating tips and an optional close button, so a whole-page wait can always be left. `useDelayedLoading` avoids flicker on quick loads.
- **Docs:** Spinner, Progress and Skeleton share one Loading page with four sections, linked from the sidebar. `/docs/components/progress`, `/spinner` and `/skeleton` redirect to those sections.
- **Reduced motion:** drawings hold still, three dots fade, the sweep becomes a slow fade, and the shimmer stops.
