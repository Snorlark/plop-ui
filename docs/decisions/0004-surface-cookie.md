# 0004 — Surface in a cookie, read by the root layout

**Decision.** The docs site stores the chosen surface and theme in cookies and reads them in `app/layout.tsx`, so the server renders the right paper on the first paint.

**Trade-off.** Reading cookies makes those pages render per request instead of statically. Worth it for no flash of the wrong surface; a static alternative (inline script setting `data-plop-surface`) is documented on the Next.js page.
