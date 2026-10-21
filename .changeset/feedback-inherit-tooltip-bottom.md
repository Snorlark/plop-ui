---
"@plop-ui/react": minor
---

Nested `PlopProvider`s now inherit `haptics`, `sound` and `reducedMotion` from their parent unless passed, so one haptics/sound switch at the root covers the whole page. `Tooltip` adds `side="bottom"` and opens on keyboard focus (`:focus-visible`) rather than any focus. Fixes duplicate React keys in `Avatar`.
