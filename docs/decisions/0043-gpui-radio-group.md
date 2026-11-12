# Radio groups own roving focus, not the radios

React gets radio-group behaviour from the browser: one tab stop, arrows move focus and check the next radio, and a `<fieldset>`/`<legend>` names the question. GPUI has no native radio group, and `gpui-base`'s `RadioGroup` only supplies the `Role::RadioGroup` container and its orientation.

The port adds `PlopRadioGroup` as a controlled component. The app passes the options, the selected index and one `FocusHandle` per option; the group renders the legend, wraps the radios in `base::RadioGroup`, and gives only the selected radio a tab stop. Arrow keys and Home/End move focus **and** call `on_change`, wrapping at both ends. Space is left alone so the focused radio's own activation handles it. A click also reports through the same callback.

Keeping the selected index in the app matches every other controlled control in the kit and avoids a second source of truth. The group is deliberately a thin coordinator: it does not own the values, and `PlopRadio` remains usable on its own when a screen has a single choice. `PlopRadio` gained `tab_stop` and `position_in_set` builders so the group can configure the roving stop and the "option N of M" announcement without duplicating the base radio.

The test focuses the first radio, drives Down/Up/Home/End, asserts both the reported index and the focused handle after each key, and checks that Space selects the focused radio without the arrow handler.
