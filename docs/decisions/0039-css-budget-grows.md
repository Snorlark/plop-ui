# The styles.css budget grows with the kit

`styles.css` holds every component's styles in one file, so its size budget grows each time a component lands. A fixed cap started shaping the components instead of catching bloat: #152 left out a confirm dialog and #154 moved StampCard's layout into inline styles just to fit, which stops apps from restyling those parts with a class. StampCard then failed CI by 9 B only because #152 merged first.

So the budget goes from 16 kB to 18 kB (brotli). That is still small for 30+ components, and the 40 kB budget on the whole library's JS keeps catching real bloat.

When a new component pushes past the limit, raise it here with a line on why, in the maintainer's PR, not the contributor's. Don't move styles inline to fit: put them in the component's CSS Module.
