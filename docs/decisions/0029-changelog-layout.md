# 0029: The changelog is a short timeline and a few quiet cards

The old changelog was one long column: each package's releases as separate entries (28 of them), "Updated dependencies" lines included, and no way to reach a release except scrolling. On a phone it ran over 14,000 px. A first redesign (a card per version, a list of all 16 versions on the side) was still too busy: tags, tape and a mascot on every card.

- **One card per minor version** (0.7 to 0.1), with its patches inside as small dated headings. Seven cards instead of sixteen. The packages are linked, so a note that went out in several shows once, with the packages named in small text under it.
- **The newest two are open; older ones show one line and a sticker `Button`** ("Show 8 changes"). The folded changes stay in the HTML, so search engines still see every word.
- **A timeline on the side:** one dot per minor on a dashed line, the one being read filled in. Taps give a haptic tap. On phones it's the kit's `Select`, "Jump to a release".
- **Links open what they name:** `#v0-3` or `#v0-3-5`, on arrival or when the hash changes.
- **The package filter is the kit's `RadioGroup`.** Its radios are real inputs, so a `:has()` rule does the filtering and it works before JavaScript loads.
- **Kept quiet on purpose:** tape and a mascot only on the newest card (Confetti) and on "Coming next" (Specs). The only tag left is a tomato "Breaking" on a change that breaks something.
- **Release dates come from the npm registry** at build time (5 s timeout). Offline, the page leaves them out instead of failing the build.
- The main column doesn't use the docs `content` styles. They color text by the site surface (light on the cutting mat), which would put light text on the paper cards.
