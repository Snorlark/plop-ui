# Playground redesign

Date: 2026-10-27 · Branch: `feat/playground` · Mockup: `.superpowers/mockups/playground.html` (local, layout only)

## Why

Lark: "the usability of playground, its UX sucks, it's hard to play with it on the user side." A 2026-10-27 walkthrough (desktop 1440 and phone 375, Chromium) found the board too small and pushed below the fold, a cramped tray that clips its previews, stickers that land on top of each other, an editor you scroll to on phones, no undo, a destructive "Clear board", hidden board code, and half the components missing. The Playground is where people decide whether the kit is fun; today it isn't.

## Goals

- Playing comes first: the board is visible and usable without scrolling at 1280×720 and 375×740.
- Every action is reversible: undo/redo for add, move, edit, peel off, clear.
- Edit a sticker where it is: an editor beside the selected sticker (desktop), a bottom sheet over the board (phone).
- Every component the kit ships is playable on the board and in Tweak (adds Tooltip, RadioGroup, Tabs, TicketCard / UnitCard / StickyNote, Select, MultiSelect, Menu, TextField / TextArea, SearchField, Count / StatusDot, Heading).
- Every visible word on every sticker is editable (IconButton's label, timeline steps, card titles, menu items, options).
- A library-wide **radius** setting with a slider in the Playground.

## Non-goals

- No new export formats; Lettering stays as it is (only the shared fixes apply).
- No saving boards to a server or sharing links to boards (localStorage stays).
- No multi-select or grouping on the board.

## Anti-goals

- It must not stop being a toy: no form-like inspector walls, no settings pages.
- No new heavy dependency (no drag-and-drop or state library).
- Never break keyboard and screen-reader use of the board (the `application` role and its keys stay and get better).

## Decisions made

1. **Layout** (mockup): one slim line with the title and the three tools; a board toolbar (Undo, Redo, Paper, Radius, Copy board code, Clear); a large board; a bottom tray with shelf chips and full-size tiles, new components marked.
2. **Editor placement:** a floating panel next to the selected sticker, flipping sides to stay on the board; on phones (≤ 640px) a bottom sheet that covers the lower part of the board, with a compact first row and "swipe up for every field and the code".
3. **Radius** is a global token, not a per-component prop (Lark). Implementation: a `--plop-roundness` number (default `1`) in `packages/tokens`; every `--plop-radius-*` token becomes its current irregular value with each length multiplied by `var(--plop-roundness)`. `0` is square, `2` is very round. `PlopProvider` gets a `roundness` prop that sets the variable; plain CSS works too. Patch-level for consumers: default output is unchanged.
4. **Undo:** a history stack of board snapshots (items + paper), capped at 50; ⌘Z / Ctrl+Z, ⇧⌘Z / Ctrl+Y, plus toolbar buttons. "Clear" is one undoable step, with a toast "Board cleared · Undo".
5. **Placement:** a new sticker goes to the first free spot on a loose spiral around the board's centre, so stickers fan out.
6. **Stickers on the board are not live:** they render inert (`inert` attribute), so they're no extra Tab stops and clicking one selects it instead of toggling it. Tweak stays the place for live components.
7. **Tweak:** the preview is sticky while you scroll the props; `Burst` and every long option list use the kit's `Select`.
8. **Ride-along badge** is hidden on `/playground` until the tour is opened from the header.
9. **Tool tabs** fit one row on phones (short labels: Board · Lettering · Tweak).

## Left to the builder

- Shelf grouping for the new components (suggested: Actions, Status, Cards, Forms, Pickers, People, Characters, Words & doodles).
- Exact editor fields per component, following "every visible word is editable".
- Default props for each new tray tile (sketchbook voice, like the existing ones).
- Animation details, within the motion tokens and off under reduced motion.

## Done when

- At 1280×720 and 375×740 the board is fully visible with the tray, with no page scroll to start playing.
- Undo/redo covers add, move, edit, peel off and clear; a Vitest or e2e test proves each.
- Every component in `apps/docs/scripts/gen-props.mjs`'s list can be put on the board and tweaked.
- The radius slider changes every component on the board and in Tweak live; `roundness={1}` renders exactly as today (visual check against `main`).
- e2e: keyboard on the board (arrows, N, Delete, ⌘Z), the phone bottom sheet, zero serious axe violations on all 5 surfaces in light and dark, no hydration warnings; all 5 browser projects green.
- A changeset for `@plop-ui/tokens` and `@plop-ui/react` (minor: new `roundness`).
