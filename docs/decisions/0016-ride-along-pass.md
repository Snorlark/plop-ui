# 0016 — The Ride-along pass replaces the Plop Pass

**Decision.** The Plop Pass (0012) is gone as a home-page section and from the footer. In its place, every page has a small ticket stub floating in the bottom-right corner ("New here? 2/5"). It opens the **Ride-along pass**: a die-cut paper boarding pass with five stops, in order: what Plop is, install, components, playground, GitHub. Each stop is a link, and a "Next stop" line says what to do. A stop gets its rubber stamp (the old face stamps, one hat per stop, each in its own ink) when you reach it: the "Why PlopUI" section on the home page, the install guide or copying the install command, any component page or /kit, the playground, any link to the repo. A full pass still unlocks Holo Pip, and people who already had it keep it.

**Why.** The Pass rewarded visits and fiddling, which didn't help someone who doesn't know where to start. A ride-along is how a new dispatcher learns the job, so the pass is a guided first shift instead of a loyalty card.

**Also.** Stamps are pressed in five deep inks so a full pass isn't all cobalt: tomato, ink, leaf, and two new tokens, `ochre` and `berry` (mustard and bubblegum are too light to read as ink on paper). The pass's shadow is a drop-shadow on the cut-out shape, so it follows the notches.

**How.** `apps/docs/app/_site/RideAlong.tsx`, `ridealong.module.css` and `pass.ts` (stored on the device under `plop-ride-along-v1`).
