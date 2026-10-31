---
"@plop-ui/react": minor
---

Loading, drawn by hand:
- `Spinner`: an ink loop, hopping dots, a stop-motion scribble, a coin-flip sticker and Hum.
- `Progress indeterminate` and `ProgressRing`.
- `Skeleton` and `SkeletonText`.
- `Loader`: says when a wait is slow and offers Cancel; the card version sits on paper and has a close button.
- `useDelayedLoading`.

Every loop runs on the compositor. `Button loading` and `SearchField`'s busy state use the new Spinner.
