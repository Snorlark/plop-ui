# 0007 — Haptics and sound are a person's choice, switched in one place

**Decision.** A nested `PlopProvider` inherits `haptics`, `sound` and `reducedMotion` from its parent unless they are passed. The docs site puts a haptics toggle and a sound toggle in the header (round IconButtons with `aria-pressed`), remembers the choice per device in `localStorage`, and plays a sample buzz or plop when one is turned on. `Tooltip` gains `side="bottom"` for header triggers and now opens on keyboard focus (`:focus-visible`) instead of any focus, so a mouse click doesn't leave a bubble stuck open.

**Why.** Feel is the point of the kit, so people need an obvious way to turn it on or off. Before, nested providers (on `/kit`, in the Playground stage) reset haptics to on and sound to off, so a root switch did nothing inside them.

**Trade-off.** The saved choice is read after hydration, so a returning visitor with sound on gets the default for the first instant. No press can happen in that window, so nobody hears or feels the difference.
