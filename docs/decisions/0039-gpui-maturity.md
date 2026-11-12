# The GPUI port owns interaction only where gpui-base leaves a gap

`gpui-base` covers focus, Tab order, Space/Enter, IME, selection, clipboard and undo, so the port wraps it for buttons, checkboxes, switches, radios, text fields and the slider's drag maths. Three gaps remain, and the port fills them rather than pretending they are done:

- **Tabs.** `gpui-base`'s `Tab` is pointer-only; upstream marks roving focus as a TODO. `PlopTabs` keeps the visual tab but owns four `FocusHandle`s, moves focus with Left/Right/Home/End, selects as focus moves, and exposes `Role::TabList` / `Role::Tab` plus `aria_selected`.
- **Slider keyboard.** The base slider exposes pointer drag and accessibility increment/decrement, but no key bindings. `PlopSlider` puts `track_focus` and the arrow/Home/End handler on a wrapper around the base slider; the base still owns the geometry mapping and drag state.
- **Multi-line text.** The base textarea exists but has no PlopUI sheet. `PlopTextArea` takes the same `Entity<TextareaState>` the base renders, so editing stays in `gpui-base` and only the paper, label and hint are ours.

The surface is also a global now. `PlopTheme::init`, `current` and `set` use GPUI's global store, but every component still takes a `PlopTheme` value. That is deliberate: previews, story-like sections and the gallery's surface switcher need more than one surface in one app, which a single global cannot express.

Animation is limited to what the pinned stack can do honestly. `PlopSpinner` uses `gpui-pre`'s `Animation` element, which already pins reduced-motion animations to a resting frame and stops requesting frames. There is no scale or rotate transition in `gpui-base`, so press feedback remains a paint change rather than a transform. A spinner was chosen as the first animation because a rotating arc is geometry the port already knows how to draw.

The maturity pass is tested at the keyboard, not by screenshot: `tests/controls.rs` drives Space through checkbox and switch, arrows/Home/End through tabs and slider, and checks that tab focus follows selection. Screenshots still catch what tests cannot, which is why the dark capture is part of the loop — it is what caught the missing paper text scope earlier.
