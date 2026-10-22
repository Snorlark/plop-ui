# @plop-ui/react

## 0.1.0

### Minor Changes

- 476aa70: New `Buddy` and `BuddyPeek`: six characters that each stand for a state (`success`, `error`, `stale`, `congrats`, `preview`, `thinking`), standalone or peeking over any component. `Toast`, `toast()` and `Callout` take `buddy` (`true` picks the character for the kind or tone, or pass a mood). `BUDDY_CAST` lists each character's name and purpose.
- 476aa70: `Button` and `ButtonLink` take `buddy="peek"`: the buddy hides behind the sticker and pops up on hover or keyboard focus. New hand-drawn icons: `CopyIcon`, `LinkIcon`, `SearchIcon`, `ArrowDownIcon`, `ArrowRightIcon`, `ExternalIcon`, `MenuIcon`, `HapticsIcon` and `SoundIcon` (the last two take `off`).
- 476aa70: `Button` and `ButtonLink` take `buddyMood`, so any character can be the buddy (e.g. Bix on a Retry button). Toasts now lift off the page with a soft ink wash rising behind them, so they read apart from what's underneath.
- 476aa70: Nested `PlopProvider`s now inherit `haptics`, `sound` and `reducedMotion` from their parent unless passed, so one haptics/sound switch at the root covers the whole page. `Tooltip` adds `side="bottom"` and opens on keyboard focus (`:focus-visible`) rather than any focus. Fixes duplicate React keys in `Avatar`.
- First public release.
- 476aa70: `SearchField` is now a full combobox: grouped results on a taped sheet (avatar, status-dot or icon leads, washi-tape meta), highlighter matches, arrow keys and Enter, Escape to clear then close, recent searches (`recentKey`), loading dots, keycap shortcuts (`shortcut="/"`), a Hum empty state, and a wobbly marker outline that boils on focus. New `CommandPalette` (⌘K / Ctrl K) built on it, and `useIsMac`.
- 476aa70: Stickers now default to a `soft` flat shadow (the crayon `stripes` are still one prop away: `shadow="stripes"`). `tomato` stickers (cancel, delete) shake their head and puff dust (`burst="poof"`) instead of throwing confetti. New `SearchField`: a paper-sticker search box with a wiggling lens, a key-press squish, an eraser and a character that peeks while it has focus and reacts to `results`.
- 476aa70: `PlopProvider` without a `surface` now keeps the surrounding one (a parent provider's, or `data-plop-surface` on the page) instead of resetting to poster, so a page-level paper/mat switch reaches every provider. New `PaperIcon` and `CuttingMatIcon`.
- 5d6954e: `Toast` gets a die-cut paper edge and flat shadow like every other sticker. What shows behind a live toast is now a choice: `PlopProvider` takes `toastBackdrop` (`"solid"`, the default, a faint gradient wash; `"dots"`, a comic halftone screen over it; or `"none"`), and `Toaster` takes it as `backdrop`. With a `buddy`, the character and the toast now tilt together, so the hands grip the edge on long messages too.
- 476aa70: New `WordSticker` (die-cut Sketchpop lettering with a paper border, offset fill and ink edge) and `Doodle` (star, heart, sparkle, burst). Stickers (`Button`, `ButtonLink`, `IconButton`) take `shadow`: `"soft"` (default), `"solid"`, `"stripes"`, `"outline"` or `"none"`, and `PlopProvider` takes `stickerShadow` to set it for everything inside.

### Patch Changes

- Updated dependencies
- Updated dependencies [8cf9e12]
  - @plop-ui/tokens@0.1.0
