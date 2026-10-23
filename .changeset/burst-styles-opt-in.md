---
"@plop-ui/react": minor
---

Bursts are now opt-in and come in seven styles. **Breaking:** `Button`, `ButtonLink` and `IconButton` no longer throw ink marks on every press; add `burst` to the presses worth it (`burst` alone picks confetti, or a poof on `tomato`). Name a style to celebrate (`"confetti"`, `"stars"`, `"sparkle"`, `"hearts"`) or to mark something that went wrong (`"poof"`, `"zap"`, `"drops"`, which also shake the sticker). Toasts can burst too when they land: `toast.success("Saved!", { burst: true })` throws confetti, `toast.error(…, { burst: true })` puffs dust and shakes, or name any style. The wash behind a live toast now takes its kind: red for an error, green for success. New exports: `BURST_STYLES` and `BURST_PRESETS`.
