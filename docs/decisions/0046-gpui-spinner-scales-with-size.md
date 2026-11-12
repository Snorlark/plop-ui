# The spinner scales its geometry with its size

`PlopSpinner` accepts any size, but `paint_spinner` had been tuned on the 34 px standalone mark: a 5 px stroke, a 5 px head, and `radius = size * 0.5 - 5.0` with a guard of `radius <= 4.0`. At 18 px — the size inside a button — the radius came out at 4.0, the guard returned early, and the loading button painted nothing. The spinner was there in the layout and invisible in the image.

The painter now derives its parts from the box: stroke is `size * 0.12` clamped to 1.5–4.0 px, the head is `size * 0.11` clamped to 1.2–3.6 px, and the radius is `size * 0.5 - stroke * 0.9`. The early return only fires below a 2 px radius, where a ring cannot be drawn. The wobble offset also scales with `size / 34`, so small marks stay tight instead of looking like a scribble.

`tests/headless.rs::spinner_paints_inside_an_absolute_overlay` renders an 18 px tomato spinner in an absolute inset and fails if fewer than 20 tomato pixels reach the image. That is the regression test for this bug; the earlier tests only checked that a button existed, not that its spinner drew.
