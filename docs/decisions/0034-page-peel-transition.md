# Page changes peel the old page off like a sticker

Moving between pages of the docs site used to be a hard cut. Now the old page peels off like a sticker. A 45-degree fold starts at the bottom-right corner, which lifts and hesitates for a beat, then the fold sweeps to the top-left in one pull (1 s in all). The peeled part lies folded back over the page as a flap drawn in the site's own language: a die-cut paper sheet with a hand-drawn ink edge and the hatched sticker shadow. The fold gets an ink crease and a hatched band where the lifted sheet shades the new page. It reuses the site's motion verb (stickers peel on hover, squish on press) instead of a generic fade or slide.

Earlier versions were rejected:

- a diagonal mask alone read as a slide-deck wipe;
- grey gradient shading didn't match the hand-drawn style;
- a solid header strip during the peel looked like the header darkening;
- animating a custom property every frame wasn't smooth.

How it works:

- It is a view transition started from `app/_site/PagePeel.tsx`. A click listener in the capture phase catches clicks on same-site links before Next's `<Link>` handler, calls `preventDefault`, and runs `router.push` inside `document.startViewTransition`. The "after" snapshot is taken once the new pathname renders, or after 1.5 s at the latest, so a slow route never freezes the page.
- The fold is the line `x + y = c`. Each layer has its own keyframes written from the same `c` and the same timing, so they stay locked together:
  - the old page's mask (a `clip-path`);
  - the turned square that cuts the flap at the fold;
  - the flap;
  - the crease.
- Everything except the mask animates `transform` only, so it runs on the compositor.
- The flap is the peeled corner mirrored across the fold: a right triangle whose tip is the corner's mirror image and whose legs are the page's bottom and right edges, now lying along x and y.
- The flap and the crease live in a fixed layer that `PagePeel` renders. It has its own `view-transition-name`, so it stays live, and its animations wait, paused, until the transition is `ready`. The header is part of the sheet: it peels off with the old page, and the new page's header is underneath.

The peel is skipped, and links behave exactly as before, when:

- the browser has no view transitions;
- the person prefers reduced motion;
- a modifier key or a middle click asks for a new tab;
- the link opens in another target, downloads, leaves the site, points at the current page (hash links) or at a file such as `llms.txt`.

The browser's default view-transition styles blend the old and new snapshots with `mix-blend-mode: plus-lighter`, which shows both pages at once, so both are set to `normal`.

Back and forward buttons keep the browser's own behavior: the peel only runs on clicks.
