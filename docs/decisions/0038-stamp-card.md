# StampCard: a list of slots, stamps as decoration

StampCard is an `<ol>` with one `<li>` per slot, named with the progress ("Matcha Corner, 3 of 8 stamps"). Each slot says "Stamped" or "Empty" in visually hidden text, so the list is the information and the stamps are pictures of it (`aria-hidden`). That means an app's custom stamp never needs alt text, and the count shown on the card is hidden from screen readers too, because the list's name already says it. Nothing on the card is focusable: it shows progress, it isn't a control. With no state or handlers it stays a Server Component; `useSeed` uses `useId`, which works on the server.

It isn't `Progress`: a punch card is a handful of countable visits, and people read it as "3 of 8", slot by slot, not as a percentage bar. It isn't `StatusTimeline` either: there's no current step, just how many slots are full.

The card is a `Sheet` with no tape (paper roles, ink edge, printed shadow, a small seeded tilt), so it matches the kit's panels and passes AA on all five surfaces in light and dark without surface-specific colors. Reusing Sheet's styles also keeps StampCard's own CSS small. Stamps are pressed in the five deep stamp inks from the Ride-along pass (0016): tomato, ink, leaf, ochre and berry, each 3:1 or more on paper. `ink="mixed"` (the default) gives each stamp its own seeded ink; any one ink can be fixed for a café's brand.

Every impression gets a seeded tilt (±14°), ink, pressure (opacity) and a nudge of a couple of pixels, from `seed()` per slot, so the server and the browser draw the same card and no two stamps line up. Those values, the card's tilt and the column count are per instance, so they're written inline.

The inner layout (header, slots, stamp box, visually hidden text) lives in `StampCard.module.css`, so apps can restyle any part with a class. Only per-instance values are inline: the card's tilt, the column count and each stamp's look. (It first shipped with that layout inline to fit the old 16 kB `styles.css` budget; 0039 raised the budget and moved it back.) The stylesheet also sizes the stamp's drawing and holds the crayon filter, the thunk and its reduced-motion stop, and the forced-colors fix. The card itself is a `Sheet`, so its paper, edge and shadow cost nothing extra.

Rows hold at most six slots and balance (8 → 2 × 4, 10 → 2 × 5); slots shrink with a narrow card rather than overflowing it. `columns` overrides the count.
