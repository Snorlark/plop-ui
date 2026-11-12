# Pointer and keyboard activation are separate in the GPUI port

GPUI synthesises a `ClickEvent` when Space or Enter is pressed on any element with an `on_click` listener. That is the right default for a button, but it broke two controls in the kit:

- A link must follow on Enter and leave Space to scroll. With `on_click`, Space followed the link too.
- A combobox trigger opened on key-down, then the synthetic click on key-up ran against the freshly rendered `open = true` handler and called `handler(!open)`, closing it again.

The port therefore splits activation. `PlopButtonLink`, `PlopSelect` and `PlopMultiSelect` attach pointer activation with `on_mouse_up(MouseButton::Left, ...)` and handle keys explicitly in `on_key_down`. Buttons, checkboxes, switches, radios and menu items keep `on_click`, because native Space/Enter activation is exactly what they want.

The tests drive the paths separately: Enter activates a link while Space does not, Space opens a select, arrows move it, Escape closes it, Space toggles a multi-select option, and Enter runs a menu item. The pointer path is not simulated in those tests; `on_mouse_up` checks a hovered hitbox, so it is a deliberate pointer-only signal.

The icon set follows the same "transcribe the drawing, not the runtime" rule as the rest of the port. The React SVG path data is copied unchanged and `plopui_core::svg` samples it into polylines; the four status icons keep their token fills. No SVG parser or renderer is added to the dependency graph.
