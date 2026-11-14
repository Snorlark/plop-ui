---
"@plop-ui/react": patch
---

`StampCard`'s header, title, count, slots and stamps are styled by its CSS Module again instead of inline styles, so apps can restyle them with a class. Only the per-card values stay inline: the column count and each stamp's seeded ink, pressure and tilt. Nothing changes visually.
