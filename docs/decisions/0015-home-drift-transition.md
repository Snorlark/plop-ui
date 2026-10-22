# 0015 — The hero hands off to the letter with Drift

**Decision.** On the home page, scrolling from the hero to the letter uses **Drift**: the hero's crowd rows slide apart sideways and the letter rises in. The two other options we compared, **Pop burst** (avatars and icons arc out of the crowd and land around the letter) and **Sheet slide** (the letter slides up over the crowd like a sheet of paper), are gone, along with the temporary picker used to choose between them.

**Why.** Drift reads as the crowd making room for the letter, and it's the quietest of the three. It's purely scroll-linked CSS on the compositor, so it needs no JavaScript.

**How.** `.home-flow` in `apps/docs/app/site.css`. Without scroll-driven animations, or with reduced motion on, the page stays still.
