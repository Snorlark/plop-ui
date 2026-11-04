# Breadcrumbs use ordered items and a native disclosure button

Breadcrumb follows the existing ButtonLink `as` convention for router adapters; the library never imports Next.js. An ordered `items` array ensures the final location always has `aria-current="page"` and cannot accidentally become a link. Ancestors without destinations remain text.

Like shadcn's breadcrumb, the trail uses a named nav, an ordered list, decorative separators and a non-linked current location. Plop draws the separators as marker slashes and uses surface text/focus tokens.

A CSS container query collapses intermediate items below 520px, avoiding viewport reads and hydration differences. A native button toggles their visibility, keeps focus, and exposes aria-expanded. Hidden links leave both keyboard order and the accessibility tree. The button stays available to collapse the trail again. The component is a client boundary because of this interaction; it has no animation.

Docs reuse this component through Next.js Link above each title instead of the old plain-text breadcrumb. Section labels are sidebar categories, so the trail uses actual navigable locations: Home / Docs / current page.
