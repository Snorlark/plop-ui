# 0003 — Build with esbuild directly, not tsup

**Decision.** `packages/react/scripts/build.mjs` builds with esbuild in two passes: one JS file per source file (imports between them kept as real module boundaries, `"use client"` restored where the source had it), and one pass that collects all CSS into `dist/styles.css`. `scripts/check-css.mjs` fails the build if the passes disagree on a class name.

**Why.** The PRD named tsup, but tsup's CSS handling treats every `.css` import as global (no CSS Modules), and bundling into one file drops the per-component `"use client"` boundaries that keep `StatusTimeline` and a static `Tag` as Server Components.
