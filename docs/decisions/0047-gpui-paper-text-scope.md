# Paper text stays ink on dark pages

The React kit scopes text inside `.plop-paper` to the ink tokens, so a cream card on a dark notebook page still has cobalt lettering. The GPUI port has no CSS inheritance: each component picks a color from the `PlopTheme` it was given.

`PlopTicketCard` and `PlopUnitCard` were passing their page theme to `PlopStatus`. On a dark surface that painted cream status labels on the cream card — the pill's fill showed, its words vanished. The dispatch demo hit the same thing with `PlopStatusTimeline` and the meta line inside a `PlopSheet`.

`PlopTheme::on_paper()` now returns the same surface with `dark: false`, which is the port's equivalent of moving into `.plop-paper`. The two cards use it for their status pills, and the demo uses it for the timeline, the status and the report field inside its sheets. Plain `meta_text` on paper uses the ink tokens directly, because it takes a color rather than a theme.

The rule, written down so the next component follows it: page text uses `mode.on`, paper text uses ink, and a component that draws text on paper but takes a theme should be handed `theme.on_paper()`. The `on_paper` unit test checks all five surfaces: same surface, light mode, light `on`.

This does not change the page: the gallery's light surfaces look the same. It does fix every dark ticket and unit card, which is what `gpui-gallery-dark.png` and `gpui-dispatch-dark.png` now show.
