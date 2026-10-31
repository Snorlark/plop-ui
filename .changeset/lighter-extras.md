---
"@plop-ui/react": minor
---

Lighter imports, no API changes:
- A Button's click particles load the first time a burst fires, and are preloaded while idle on stickers that use `burst`.
- `buddyMood` characters other than Pip load only when asked for.
- Spinner's `buddy` kind ships only Hum, and Select and SearchField no longer import the whole Spinner for their busy dots.
- A plain Button drops from 7.7 kB to 5.6 kB gzipped; Select and MultiSelect from 10.2 kB to 7.6 kB.

New: `AvatarSymbol` and `Avatar faceHref`, which draw a repeated face once as an SVG symbol and reuse it, for crowds of avatars.
