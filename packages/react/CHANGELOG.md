# @plop-ui/react

## 0.3.2

### Patch Changes

- b73543f: Fix: in Firefox and Safari, pressing a sticker no longer loses keyboard focus or cancels its squish. The iOS haptics fallback is now used only on touch devices, and it hands focus straight back. Tooltips and search results no longer close when haptics tick.
- 71c7283: StatusTimeline: when forced horizontal in a narrow box (a card on a phone), its labels get smaller so neighbouring steps never overlap.

## 0.3.1

### Patch Changes

- 3cdcdce: Select's and Menu's sheets now open right under their button, even inside a grid or flex layout that stretches them, and below a Select that shows a hint or error.

## 0.3.0

### Minor Changes

- 5e5cb89: New: `Select` (with a searchable people-picker mode), `MultiSelect` (picks stick on as washi tape) and `Menu` (icons, keycap hints, separators, a red danger item), plus `MoreIcon`, `EditIcon` and `TrashIcon`. Full keyboard support: arrows, Home, End, type-to-jump, Enter, Space and Escape.

## 0.2.1

### Patch Changes

- 8b94e11: New description, keywords and homepage (https://plopui.com): PlopUI is hand-drawn UI, imperfect on purpose. No code changes.
- Updated dependencies [8b94e11]
  - @plop-ui/tokens@0.2.1

## 0.2.0

### Minor Changes

- b856d1f: Bursts are now opt-in and come in seven styles. **Breaking:** `Button`, `ButtonLink` and `IconButton` no longer throw ink marks on every press; add `burst` to the presses worth it (`burst` alone picks confetti, or a poof on `tomato`). Name a style to celebrate (`"confetti"`, `"stars"`, `"sparkle"`, `"hearts"`) or to mark something that went wrong (`"poof"`, `"zap"`, `"drops"`, which also shake the sticker). Toasts can burst too when they land: `toast.success("Saved!", { burst: true })` throws confetti, `toast.error(…, { burst: true })` puffs dust and shakes, or name any style. The wash behind a live toast now takes its kind: red for an error, green for success. New exports: `BURST_STYLES` and `BURST_PRESETS`.

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
