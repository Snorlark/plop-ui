---
"@plop-ui/react": patch
---

Real-app fixes from a stress test:

- Button, ButtonLink and IconButton keep their own size inside a stretching grid or flex parent (a `display: grid; min-height: 100vh` page made them giant). Give one a width to make it wider.
- Buttons, the Select and Menu triggers and tabs no longer shake when the pointer rests near their edge while they lift on hover.
- A focused Select, SearchField or TextField label stays readable in dark mode: the highlight now sits behind the whole word, with matching ink.
