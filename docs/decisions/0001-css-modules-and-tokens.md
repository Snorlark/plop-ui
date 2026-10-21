# 0001 — CSS Modules + CSS variables, no runtime styling

**Decision.** Components are styled with CSS Modules that read only `--plop-*` variables from `@plop-ui/tokens`. No CSS-in-JS, no Tailwind.

**Why.** Zero runtime cost and safe in React Server Components. The irregular radii, hatched shadows, SVG filters and per-surface variables are plain CSS anyway. Theming by surface is just a `data-plop-surface` attribute.

**Trade-off.** Consumers import one stylesheet (`@plop-ui/react/styles.css`). A Tailwind preset that maps the tokens can be added later.
