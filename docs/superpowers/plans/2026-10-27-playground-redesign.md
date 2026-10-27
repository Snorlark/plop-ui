# Playground Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Playground easy and fun to play with: a big board you can use without scrolling, undo for everything, an editor next to the sticker, every component on the shelves, and a library-wide roundness setting.

**Architecture:** The board's state moves into a small history hook (`useBoardHistory`) so every change is undoable. The layout is rebuilt around the board (toolbar on top, tray at the bottom, editor floating beside the selection or as a phone bottom sheet). Roundness is one CSS variable, `--plop-roundness`, that scales every radius in tokens and components; `PlopProvider` gets a `roundness` prop.

**Tech Stack:** Next.js 15 App Router (apps/docs), React 19, CSS Modules, `@plop-ui/react` + `@plop-ui/tokens`, Playwright e2e (apps/docs/e2e), Vitest (packages/react).

**Spec:** `docs/superpowers/specs/2026-10-27-playground-redesign-design.md` · Mockup: `.superpowers/mockups/playground.html` (local)

## Global Constraints

- CLAUDE.md: colors, fonts, motion only from `packages/tokens` CSS variables; no hex in components; respect `prefers-reduced-motion` in every animation; no `Math.random()` in render (tilts from `seed()` / `seededTilt`).
- `packages/react` never imports `next/*`.
- No new dependency (no drag-and-drop or state library).
- The board keeps `role="application"`, one Tab stop, arrows / N / Delete / Escape, and gains ⌘Z / Ctrl+Z and ⇧⌘Z / Ctrl+Y.
- `roundness` default `1` renders exactly as today.
- History cap: 50 steps.
- Phone breakpoint: ≤ 640px.
- Done-when sizes: 1280×720 and 375×740.
- Docs have no unit-test runner: Playground behavior is proven with Playwright in a new `apps/docs/e2e/playground.spec.ts`; library behavior with Vitest.
- Don't push until Actions minutes are back (repo public or after Nov 1); commit locally.

## Review Focus

1. A board saved by the old version (`localStorage` key `plop-board-v1`, no `roundness`) must still load: missing fields fall back to defaults. Test in Task 2.
2. Undo after a drag must undo the whole drag in one step, not every pointer move. Test in Task 2.
3. Typing in the editor's text field must not trigger board shortcuts (⌘Z inside an input undoes the text, not the board; Delete deletes characters). Test in Task 4.
4. The floating editor must stay on screen for a sticker near the board's right or bottom edge. Test in Task 4.
5. `roundness={0}` must not break circles (avatars, radio dots, switch knobs stay round). Test in Task 1.

---

### Task 1: Roundness, library-wide

**Files:**
- Modify: `packages/tokens/scripts/emit-css.mjs` (radius output), `packages/tokens/src/tokens.ts` (export `roundness = 1` default and doc comment)
- Modify: `packages/react/src/PlopProvider/PlopProvider.tsx` (prop)
- Modify: the 17 CSS modules with literal radii (`grep -rlE 'border-radius: [0-9]' packages/react/src --include='*.css'`)
- Test: `packages/react/src/kit.test.tsx` (or a new `roundness.test.tsx` beside it)
- Create: `.changeset/roundness.md` (`@plop-ui/tokens` minor, `@plop-ui/react` minor)

**Interfaces:**
- Produces: CSS variable `--plop-roundness` (unitless number, default `1`); `PlopProviderProps.roundness?: number`.

- [ ] **Step 1: Write the failing tests**
  - `PlopProvider roundness sets --plop-roundness`: render `<PlopProvider roundness={1.5}>` and expect the root's `style.getPropertyValue("--plop-roundness")` to be `"1.5"`; without the prop, expect no inline value.
  - `tokens.css scales every radius by --plop-roundness`: read `packages/tokens/dist/tokens.css`; expect `--plop-roundness: 1;` and every `--plop-radius-*` line to contain `var(--plop-roundness)`.
  - `circles stay circles`: in every component CSS module, no `border-radius: 50%` is wrapped in `--plop-roundness`.
- [ ] **Step 2:** Run `pnpm --filter @plop-ui/react test -- roundness`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `emit-css.mjs` writes `--plop-roundness: 1;` and each radius with every px length `N px` turned into `calc(Npx * var(--plop-roundness))`. Percent values (blob) stay as they are.
  - In component CSS, wrap each literal px radius the same way. Leave `50%` and `999px` pill/circle radii alone.
  - `PlopProvider` merges `--plop-roundness` into the root `style` when `roundness` is set.
  - Add the JSDoc: "How round every corner is. `1` is the default look, `0` is square, `2` is very round."
- [ ] **Step 4:** Run `pnpm --filter @plop-ui/tokens build && pnpm --filter @plop-ui/react test`. Expected: all pass.
- [ ] **Step 5: Visual check that default is unchanged.** Screenshot `/docs/components/button`, `/docs/components/select` and `/` at 1280×720 on `main` vs this branch with Playwright. Compare pixel diff = 0 (or note any 1px anti-alias diff).
- [ ] **Step 6:** Commit `feat(tokens,react): a roundness setting that scales every corner`.

### Task 2: Board history (undo / redo, undoable clear, saved roundness)

**Files:**
- Create: `apps/docs/app/playground/history.ts`
- Modify: `apps/docs/app/playground/StickerBoard.tsx` (use the hook; drag commits once on pointer up)
- Create: `apps/docs/e2e/playground.spec.ts`

**Interfaces:**
- Produces: `type Board = { paper: SurfaceName; items: Item[]; roundness: number }`.
- Produces: `useBoardHistory(initial: Board): { board: Board; set(next: Board | ((b: Board) => Board), opts?: { commit?: boolean }): void; commit(): void; undo(): void; redo(): void; canUndo: boolean; canRedo: boolean; reset(b: Board): void }`.
  - `set(..., { commit: false })` updates live (drag moves) without a history step.
  - `commit()` records the current board as one step.
  - Cap 50.
- Storage stays `plop-board-v1`, now saving `{ paper, items, roundness }`. Missing `roundness` loads as `1`.

- [ ] **Step 1: Write failing e2e tests** in `playground.spec.ts` (desktop project; clear `localStorage` first):
  - `undo and redo an added sticker`: add "Button" from the tray, then `Control+z` on the board → 0 stickers (`aria-label` says "0 stickers"). Then `Control+Shift+z` → 1.
  - `one drag is one undo step`: add a sticker, drag it 120px, `Control+z` → back at its start position (compare `style.left`).
  - `clear is undoable`: add 2 stickers, click "Clear", expect 0 and a toast "Board cleared. Undo brings it back." Click the toolbar's "Undo" → 2.
  - `an old saved board still loads`: seed `localStorage["plop-board-v1"] = {"paper":"kraft","items":[<one button item>]}`, reload, expect 1 sticker and paper Kraft.
- [ ] **Step 2:** Run `pnpm --filter @plop-ui/docs exec playwright test e2e/playground.spec.ts --project=desktop`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `history.ts` keeps `past`, `present` and `future` arrays in a `useReducer`.
  - In `StickerBoard`, every add, edit, peel-off, paper change and clear commits. Drag moves use `{ commit: false }` and commit on pointer up.
  - Keyboard: `(e.metaKey || e.ctrlKey) && e.key === "z"` (shift → redo); also `Ctrl+Y`.
  - Clear calls `toast.info("Board cleared. Undo brings it back.")`. The kit's toast has no action buttons, so the toolbar's Undo is the way back.
- [ ] **Step 4:** Rerun. Expected: PASS.
- [ ] **Step 5:** Commit `feat(playground): undo and redo on the sticker board`.

### Task 3: Board-first layout (top line, toolbar, big board, bottom tray, inert stickers)

**Files:**
- Modify: `apps/docs/app/playground/page.tsx` (slim heading, short lede), `PlaygroundTools.tsx` (tab labels "Board" / "Lettering" / "Tweak" on phones via a visually hidden long label), `StickerBoard.tsx` (structure), `tools.module.css`
- Modify: `apps/docs/app/_site/RideAlong.tsx` (hidden on `/playground` until opened)

**Interfaces:**
- Consumes: Task 1 `roundness` and Task 2 `useBoardHistory`.
- Produces: toolbar buttons with accessible names "Undo", "Redo", "Copy board code", "Clear". A "Paper" choice and a "Radius" slider (0–2, step 0.1) that sets the board `PlopProvider`'s `roundness`. `boardCode()` emits `roundness={n}` when ≠ 1.

- [ ] **Step 1: Write failing e2e tests**:
  - `board fits without scrolling`: at 1280×720 and at 375×740, after `goto("/playground")`, the board's bounding box bottom ≤ viewport height. At least one tray tile is visible without scrolling.
  - `stickers on the board are not tab stops`: add 3 stickers; press Tab from the board. Focus leaves the board, not into a sticker. `page.locator('[role=application] button:not([inert] *)')` count is 0.
  - `clicking a sticker selects it, not the component`: add a Switch, click it. The board's label says "Switch … selected" and the switch's `aria-checked` didn't change.
  - `radius slider rounds the board`: set Radius to 0. A board button's computed `border-top-left-radius` is `0px`. "Copy board code" text contains `roundness={0}`.
  - `no Ride-along badge on the Playground`: the "New here?" button isn't visible on `/playground`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement**, following the mockup:
  - one top line (title + tools);
  - the toolbar;
  - a board filling the remaining height (`min(70vh, …)` on desktop, about 45vh on phones);
  - a tray at the bottom with shelf chips and a horizontally scrolling row of full-size tiles;
  - each placed sticker wrapper gets `inert` and the wrapper handles pointer selection.

  Keep the tray tiles' "Add X" buttons and drag-from-tray.
- [ ] **Step 4:** Rerun the new tests and `e2e/a11y.spec.ts` + `e2e/hydration.spec.ts` for `/playground`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(playground): a board-first layout with a toolbar and a bottom tray`.

### Task 4: The editor beside the sticker (and a phone bottom sheet)

**Files:**
- Create: `apps/docs/app/playground/Inspector.tsx` (the fields, actions and code toggle moved out of `StickerBoard.tsx`)
- Modify: `StickerBoard.tsx`, `tools.module.css`

**Interfaces:**
- Produces: `<Inspector item={Item} anchor={DOMRect | null} board={DOMRect} onChange(patch) onFront() onDuplicate() onPeel() />`.
- On desktop, positioned beside `anchor`, flipped to the other side or clamped to stay inside `board`.
- On ≤ 640px, a bottom sheet (`role="dialog"`, not modal, labelled by the kind's name).
- Field order: words first, then color, then size and tilt, then actions, then a collapsed "Code".

- [ ] **Step 1: Write failing e2e tests**:
  - `editor opens next to the selected sticker`: on desktop, select a sticker. The editor's box overlaps neither the sticker's box nor the viewport edge, and its left is within 40px of the sticker's right or its right within 40px of the sticker's left.
  - `editor stays on screen near the edge`: drag a sticker to x=96%, y=94%, select it. The editor box is fully inside the board.
  - `phone uses a bottom sheet`: at 375×740, select a sticker. A dialog named after the sticker kind is visible, and its top is below the sticker's center.
  - `typing in the editor doesn't drive the board`: select a Button, type into "Words", press Backspace and `Control+z`. The sticker is still there (count unchanged) and the word changed.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Board shortcuts only fire when `e.target === board` (already true for arrows); apply the same guard to undo/redo.
  - Measure with `getBoundingClientRect` on selection and on `resize`.
- [ ] **Step 4:** Rerun. Expected: PASS.
- [ ] **Step 5:** Commit `feat(playground): edit a sticker right where it is`.

### Task 5: Fan-out placement

**Files:** Modify `StickerBoard.tsx` (the `add` placement), possibly extract `placeNew(items: Item[], boxes: Map<string, DOMRect>, board: DOMRect): { x: number; y: number }` into `apps/docs/app/playground/place.ts`.

- [ ] **Step 1: Failing e2e** `new stickers don't land on each other`: add 5 different stickers by clicking tray tiles. No two sticker boxes intersect by more than 20% of the smaller one's area.
- [ ] **Step 2:** Run. Expected: FAIL (today's spiral is too tight for big stickers).
- [ ] **Step 3: Implement.** Walk a golden-angle spiral outward from the center in steps of about 6% of the board. Take the first point whose estimated box (the tray tile's size) overlaps nothing by more than 20%. Fall back to the last point.
- [ ] **Step 4:** Rerun. Expected: PASS.
- [ ] **Step 5:** Commit `feat(playground): new stickers fan out instead of stacking`.

### Task 6: Every component on the shelves, every word editable

**Files:** Modify `apps/docs/app/playground/stickers.tsx` (`Kind`, `KINDS`, `SHELVES`, `describe`, `boardCode` imports).

**Interfaces:**
- Produces: new kinds `tooltip`, `radio`, `tabs`, `ticket`, `unit`, `note`, `select`, `multiselect`, `menu`, `textfield`, `textarea`, `search`, `dot`, `heading`.
- Shelves become: Actions, Status, Cards, Forms, Pickers, People, Characters, Words & doodles.
- New text fields: `icon.label` (accessible name), `timeline.steps` (comma list), `ticket.title`/`meta`/`body`, `unit.name`/`subtitle`, `note.text`, `select.options`/`placeholder`, `menu.items`, `tabs.labels`, `radio.options`/`legend`, `tooltip.label`/`content`, `heading.text`.

- [ ] **Step 1: Failing e2e** `every component can go on the board`: for each name in `["Tooltip","RadioGroup","Tabs","TicketCard","UnitCard","StickyNote","Select","MultiSelect","Menu","TextField","TextArea","SearchField","StatusDot","Heading"]`, click "Add <name>" (switching shelf if needed). The board count goes up by one, and the copied board code contains `<name`.
- [ ] **Step 2: Failing e2e** `every visible word is editable`: for IconButton, StatusTimeline, TicketCard, Select and Menu, select the sticker. The editor has a text field whose change shows up in the sticker's text (or, for IconButton, its accessible name).
- [ ] **Step 3:** Run both. Expected: FAIL.
- [ ] **Step 4: Implement** each `KindSpec` (`render`, `code`, `fields`) like the existing ones, with sketchbook-voice defaults (e.g. Select "Pick a brush" with Ink pen / Watercolor / Charcoal).
- [ ] **Step 5:** Rerun, plus `e2e/hydration.spec.ts` for `/playground`. Expected: PASS.
- [ ] **Step 6:** Commit `feat(playground): every component on the shelves, every word editable`.

### Task 7: Tweak a component

**Files:** Modify `apps/docs/app/playground/Playground.tsx` (`ENTRIES`, `IMPORTS`, `ControlField`), `tools.module.css` (or its module).

- [ ] **Step 1: Failing e2e**:
  - `Tweak lists every component`: the component list contains the 14 names from Task 6 plus today's 11.
  - `preview stays in view while editing`: on Button, scroll the props panel to "Burst"; the preview's box stays within the viewport.
  - `Burst uses the kit Select`: the Burst control is a `combobox` from `@plop-ui/react` (no native `<select>` in the props panel).
  - `Tweak radius`: set Radius 0 → preview button radius `0px`, code shows `roundness={0}` on the `PlopProvider` line.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Add `ENTRIES` for the new components.
  - Make the preview `position: sticky; top: <header offset>`.
  - `select` controls with more than 4 options render `<Select>`.
  - Add a Radius number control to the surface row.
- [ ] **Step 4:** Rerun. Expected: PASS.
- [ ] **Step 5:** Commit `feat(playground): every component in Tweak, a sticky preview and a radius control`.

### Task 8: Whole-Playground checks and docs

**Files:** Modify `apps/docs/e2e/pages.ts` if needed; docs page for `PlopProvider` / tokens (mention `roundness`); `.changeset` already from Task 1.

- [ ] **Step 1:** Run the full e2e suite on all 5 projects locally, with Linux WebKit through the Docker browser server (`PW_TEST_CONNECT_WS_ENDPOINT`, see `docs/ci-cd.md`). Expected: all pass. That covers axe on all 5 surfaces in light and dark, hydration, keyboard and the new playground spec.
- [ ] **Step 2:** Run `pnpm lint && pnpm typecheck && pnpm test && pnpm size`. Expected: pass; react size budget still met.
- [ ] **Step 3:** Add one paragraph for `roundness` to the tokens / PlopProvider docs page (where `surface` and `theme` are documented).
- [ ] **Step 4:** Commit `docs: the roundness setting`.
