# 0020: Bursts are opt-in, in seven styles

Every sticker used to throw confetti on every press. On a screen full of buttons, that turned a special moment into noise, and confetti on "Cancel" or "Skip" said the wrong thing.

- `burst` now defaults to off. Turn it on for the presses worth marking.
- `true` picks a style for the variant: confetti, or a poof on tomato (cancel, delete).
- Seven named styles, in two groups:
  - **celebrate:** `confetti`, `stars`, `sparkle`, `hearts`;
  - **something went wrong:** `poof`, `zap`, `drops`. These also shake the sticker, so the meaning doesn't rely on color.
- Toasts take the same `burst` option, fired as the stamp lands (300 ms in), with the same shake for failures.
- The wash behind a live toast takes its kind: red for an error, green for success, periwinkle otherwise. A cancelled or failed message no longer sits in a calm blue glow.
- The seven styles' drawings add about 0.5 kB (compressed) to a Button, so its size budget goes from 6 kB to 7 kB. Loading the drawings on demand was tried: size-limit counts lazy imports anyway, and the loader made it bigger.
- This is a breaking change before 1.0, so it ships as a minor version with a note in the changelog.
