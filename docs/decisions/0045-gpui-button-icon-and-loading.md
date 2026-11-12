# Buttons carry an icon and a loading state

React's `Button` accepts `iconLeft` and a `loading` flag; the first GPUI pass only had a text label. The port now has `icon`, `loading` and `loading_label`.

The icon sits in the same flex row as the label, 8 px before it, at 18 px. An icon-only button with a real icon draws the icon at 20 px and drops the label entirely: a bare `+` glyph stretched by the marker font read as a thin vertical line in the gallery, which is what sent us looking for the icon set.

While loading, the label keeps its space (`opacity(0)`) and a 18 px ink spinner sits on top in an absolute inset. The button keeps its width, so the row does not jump when a save starts or settles, and clicks are ignored until it finishes. The accessible name becomes `"{label} — {loading_label}"` (default "Loading") so a screen reader hears why nothing happens; a settled button exposes its plain label.

Loading does not disable the element. It stays focusable and keeps its focus ring, and a handler that fires late is dropped rather than queued: the guard checks `loading` at click time, not at build time. `tests/controls.rs::loading_button_ignores_keyboard` proves Space and Enter produce no click until the flag flips.
