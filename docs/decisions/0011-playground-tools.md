# 0011 — The playground is three tools, one at a time

**Decision.** `/playground` offers three tabs: **Sticker board** (default), **Lettering** and **Tweak a component** (the original props playground). One tool on screen at a time, a short shelf of stickers at a time, and an inspector that only shows the settings of the selected sticker: fewer choices per step, faster first steps (Hick's law).

**Sticker board.** Every sticker is a real `@plop-ui/react` component on a real surface (`PlopProvider`), so what you see is what the code gives you. Tap or drag to add; drag to move; the board is one tab stop with arrow keys, N (next) and Delete. Copy one sticker's code or the whole board as a component.

**Lettering.** Type anything in Sketchpop as a `WordSticker`, add a `BuddyPeek` character and `Doodle` accents, and take it away as React, HTML, SVG or PNG. The image exports are drawn from the live preview: each letter's position, every resolved token color, and the Sketchpop font embedded (served from `/fonts`, OFL), so files look the same anywhere.

**Left out.** The prototype's tear-open pack intro (an extra step before the first useful one) and its café card, which became the site-wide Plop Pass (0012).
