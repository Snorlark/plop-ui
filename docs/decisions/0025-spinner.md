# 0025: Spinner

A hand-drawn `Spinner` for short waits (issue #74), from the loading reference sheet, redrawn to match the kit.

- Five kinds, one default. `ink` is a marker loop that starts inside, drifts out and overshoots its start, so it never closes neatly. It chases itself over a dashed pencil guideline. `dots` hop, stretch and squash, with a shadow that shrinks as they rise. `scribble` writes cursive loops and rubs them out. `sticker` flips a die-cut star like a coin and shows its paper back. `buddy` is Hum, rocking while thinking.
- The lines boil: each line is drawn three times from `seed()` and swapped like flipbook frames with CSS only. No JS timers, so it stays a Server Component.
- Lines draw in `currentColor`, so it works on ink, in a Card, or tinted by a parent. Only the sticker's fill takes a `tone`.
- `role="status"` with a label (default "Loading"); the drawing is `aria-hidden`. `delay` hides it for a moment, so quick loads don't flash.
- Reduced motion: the drawing holds still on one frame and three dots fade (opacity only). There is no spin and no hop.
- `Button loading` now shows `SpinnerMark` (the drawing without the status role), since the Button already announces with `aria-busy` and its own label.
- Progress rings, skeletons and the slow-state message from the reference are left for #75.
