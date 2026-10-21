# 0006 — The capped buddy is the "o" in the logo

**Decision.** The wordmark's "o" is the capped buddy that peeks over the Button, not the round smiley. The buddy sits on top of the "p": its cap brim laps over the letter so the word reads as one sticker with no gap. The favicon and `plop-mark.svg` are the buddy alone.

**Why.** The buddy is the kit's mascot already, so the logo and the components share one character.

**How.** `apps/docs/app/_site/Wordmark.tsx` is the source. `plop-logo.png` (docs/assets and apps/docs/public) is a render of that component at size 280 on a transparent background; re-render it when the wordmark changes.
