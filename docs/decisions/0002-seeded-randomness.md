# 0002 — Every imperfection is seeded

**Decision.** Tilt, wobble, letter jitter, avatar faces and ink bursts come from `seed()` (mulberry32 over an FNV-1a hash), never `Math.random()`. Components default to React's `useId()` as the seed. ESLint bans `Math.random()` in `packages/react`.

**Why.** Random values would differ between the server render and hydration, causing mismatches and layout shift. Seeded values are also stable in screenshot tests.
