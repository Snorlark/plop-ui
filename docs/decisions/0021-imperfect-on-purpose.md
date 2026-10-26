# 0021: Imperfect on purpose

PlopUI started as a kit for real-time operations apps (dispatch, field service, ticketing). It is now a general hand-drawn kit with one idea behind it: UI doesn't have to be perfect, and breaking the design rulebook can be the point.

- Headline: "Hand-drawn UI, imperfect on purpose." On the cutting mat it reads "Die-cut UI, imperfect on purpose."
- The kit breaks the visual rules (grids, perfect radii, safe palettes, colors picked by strategy) on purpose. It never breaks the accessibility ones: WCAG AA contrast, real elements, keyboard and screen readers, reduced motion. The copy says so wherever it says the first part.
- The name is "PlopUI" in prose, titles and metadata. "Plop!" stays only as a sound effect (the footer pack's bubble, WordSticker examples, the lettering studio's starting word).
- Code names don't change: `PlopProvider`, `--plop-*` and the Tag statuses (`dispatched`, `en-route`) stay, since renaming them would break users' code.
- npm keywords drop `dispatch` and `operations`; every package's homepage is now https://plopui.com. This ships as a patch so the new descriptions reach npm.
- Docs examples that read as emergency ops move to everyday ones in a separate change.
