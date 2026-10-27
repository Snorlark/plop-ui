# PlopUI
Hand-drawn React UI kit, imperfect on purpose: it breaks the visual rulebook, never the accessibility one. Read PRD.md first when you have it (a private brief, not in the repo).

## Rules
- packages/react must never import from next/*. Next.js lives only in apps/.
- Interactive components start with "use client"; static ones stay Server Components.
- No Math.random() in render. All tilt, wobble and jitter come from seed() in packages/react/src/seed.ts.
- Colors, fonts, motion come only from packages/tokens CSS variables. No hex values in components.
- Every component: native element first, keyboard support, story for every state, Vitest test for keyboard behavior.
- Respect prefers-reduced-motion in every animation.
- Log real decisions in docs/decisions/ (one short file each).

## Commands
pnpm dev | pnpm test | pnpm lint | pnpm build | pnpm changeset

## Layout
- packages/tokens: single source of truth in src/tokens.ts; build emits dist/tokens.css + typed JS.
- packages/fonts: Sketchpop woff2 + OFL license + fonts.css.
- packages/react: components (CSS Modules), hooks, seed, onColor. Built with esbuild (scripts/build.mjs).
- apps/docs: Next.js 15 App Router + MDX docs site.
- apps/dispatch-demo: Next.js 15 live incident queue (SSE Route Handler + Server Action).
- apps/storybook: Storybook 8 workshop with the a11y addon.
