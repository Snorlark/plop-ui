# Skeletons use the surface's on-color

The React skeleton is a paper scrap at 11% of `--plop-on`, the readable text color for the current surface. That is why it stays visible on cream and on dark notebook paper without a separate token.

The first GPUI pass painted the scrap with 11% of `INK`. On the light poster surface that looked right; on every dark surface it put dark blue at 11% over dark navy and the placeholder disappeared. The port now takes a `PlopTheme` in `PlopSkeleton` and `PlopSkeletonText`, reads `mode.on`, and passes it into `paint_skeleton`. The alpha stays at 11% for the fill and 12% for the dashed edge, matching the CSS.

This keeps the component stateless: the caller already passes the theme to every other surface-aware piece, and a skeleton inside a card and a skeleton on the page can use different themes without a context walk.

The gallery's DRAFT card caught the other half of the rule: it sits on cream paper inside a dark page, and passing the page theme made the scrap cream-on-cream and invisible. It now passes `theme.on_paper()`, the same helper the ticket and unit cards use for their status pills.
