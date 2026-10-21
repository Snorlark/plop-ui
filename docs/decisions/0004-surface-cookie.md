# 0004 — Static site on poster; the surface cookie lives on /kit

**Decision.** The docs website is printed on poster paper in light mode and every page is static. Other surfaces and dark mode live where people try them: the Playground (query string, client-side) and `/kit`, which stores the surface and theme in cookies and reads them on the server, so the right paper renders on the first paint.

**Why.** Reading cookies in the root layout (the first version) made every page render per request, against the PRD's "static where possible". The landing-page design is also drawn for one paper. Keeping the cookie on `/kit` still demonstrates the no-flash pattern the PRD asks the docs to teach.

**Trade-off.** Visitors can't browse the whole docs site on kraft or in dark mode; they can preview any component that way in the Playground.
