//! Keyboard tests for the interactive controls: the rules require real keys,
//! not only pointer handlers.

use std::cell::Cell;
use std::rc::Rc;

use gpui_kit::base::input::{InputState, TextareaState};
use gpui_kit::base::slider::SliderState;
use gpui_kit::{
    App, AppContext as _, Context, Entity, FocusHandle, Focusable as _, InteractiveElement as _,
    IntoElement, KeyDownEvent, KeyUpEvent, Keystroke, Modifiers, ParentElement as _, Render,
    Styled, TestAppContext, Window, div, point, px,
};
use plopui_core::theme::SurfaceName;
use plopui_gpui::{
    IconKind, PlopButton, PlopButtonLink, PlopCheckbox, PlopCommandPalette, PlopIconButton,
    PlopMenu, PlopMultiSelect, PlopRadioGroup, PlopSelect, PlopSlider, PlopSwitch, PlopTabs,
    PlopTextArea, PlopTextField, PlopTheme, ToastQueue, ToastTone, dismiss_toast, init_toasts,
    show_toast,
};

fn theme() -> PlopTheme {
    PlopTheme {
        surface: SurfaceName::Poster,
        dark: false,
    }
}

fn press(cx: &mut gpui_kit::VisualTestContext, key: &str) {
    let keystroke =
        cx.update(|_, cx| Keystroke::parse_with_os(key, cx.platform_info().os).unwrap());
    cx.simulate_event(KeyDownEvent {
        keystroke: keystroke.clone(),
        is_held: false,
        prefer_character_input: false,
    });
    cx.simulate_event(KeyUpEvent { keystroke });
    cx.update(|window, cx| window.draw(cx).clear(cx));
}

fn focus(cx: &mut gpui_kit::VisualTestContext, handle: &FocusHandle) {
    cx.update(|window, cx| {
        window.activate_window();
        window.focus(handle, cx);
        window.draw(cx).clear(cx);
    });
}

struct ToggleRoot {
    checkbox: FocusHandle,
    switch: FocusHandle,
    checkbox_value: Rc<Cell<bool>>,
    switch_value: Rc<Cell<bool>>,
}

impl Render for ToggleRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let checkbox_value = self.checkbox_value.clone();
        let switch_value = self.switch_value.clone();
        div()
            .size(px(360.0))
            .tab_group()
            .child(
                PlopCheckbox::new("notify", "NOTIFY ME", false, theme(), self.checkbox.clone())
                    .on_change(move |next, _, _, _| checkbox_value.set(next)),
            )
            .child(
                PlopSwitch::new("auto", "AUTO-ASSIGN", false, theme(), self.switch.clone())
                    .on_change(move |next, _, _, _| switch_value.set(next)),
            )
    }
}

#[gpui::test]
fn checkbox_and_switch_toggle_from_space(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let checkbox_value = Rc::new(Cell::new(false));
    let switch_value = Rc::new(Cell::new(false));
    let checkbox_seed = checkbox_value.clone();
    let switch_seed = switch_value.clone();
    let (root, cx) = cx.add_window_view(|_, cx| ToggleRoot {
        checkbox: cx.focus_handle(),
        switch: cx.focus_handle(),
        checkbox_value: checkbox_seed,
        switch_value: switch_seed,
    });
    let (checkbox, switch) = cx.update(|_, cx| {
        let root = root.read(cx);
        (root.checkbox.clone(), root.switch.clone())
    });

    focus(cx, &checkbox);
    press(cx, "space");
    assert!(checkbox_value.get(), "Space checks the focused checkbox");

    focus(cx, &switch);
    press(cx, "space");
    assert!(switch_value.get(), "Space flips the focused switch");
}

struct TabsRoot {
    focuses: [FocusHandle; 3],
    selected: Rc<Cell<usize>>,
}

impl Render for TabsRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let selected = self.selected.clone();
        let current = self.selected.get();
        div().size(px(520.0)).tab_group().child(
            PlopTabs::new(
                "tabs-test",
                vec!["INBOX".into(), "ASSIGNED".into(), "LATE".into()],
                current,
                self.focuses.to_vec(),
                theme(),
            )
            .on_select(move |index, _, _| selected.set(index)),
        )
    }
}

#[gpui::test]
fn tabs_move_selection_with_arrows(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let selected = Rc::new(Cell::new(0));
    let selected_seed = selected.clone();
    let (root, cx) = cx.add_window_view(|_, cx| TabsRoot {
        focuses: std::array::from_fn(|_| cx.focus_handle()),
        selected: selected_seed,
    });
    let focuses = cx.update(|_, cx| root.read(cx).focuses.clone());

    focus(cx, &focuses[0]);
    press(cx, "right");
    assert_eq!(selected.get(), 1, "Right selects the next tab");
    cx.update(|window, cx| {
        assert_eq!(
            window.focused(cx).as_ref(),
            Some(&focuses[1]),
            "focus follows selection"
        );
    });

    press(cx, "right");
    assert_eq!(selected.get(), 2);
    press(cx, "right");
    assert_eq!(selected.get(), 0, "Right wraps to the first tab");

    press(cx, "left");
    assert_eq!(selected.get(), 2, "Left wraps to the last tab");

    press(cx, "home");
    assert_eq!(selected.get(), 0);
    press(cx, "end");
    assert_eq!(selected.get(), 2);
}

struct SliderRoot {
    state: gpui_kit::Entity<SliderState>,
    focus: FocusHandle,
}

impl Render for SliderRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div().size(px(520.0)).tab_group().child(PlopSlider::new(
            self.state.clone(),
            "URGENCY",
            self.focus.clone(),
            theme(),
        ))
    }
}

#[gpui::test]
fn slider_steps_from_arrow_keys(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let (root, cx) = cx.add_window_view(|_, cx| SliderRoot {
        state: cx.new(|_| {
            SliderState::new()
                .min(0.0)
                .max(100.0)
                .step(5.0)
                .default_value(40.0)
        }),
        focus: cx.focus_handle(),
    });
    let (state, handle) = cx.update(|_, cx| {
        let root = root.read(cx);
        (root.state.clone(), root.focus.clone())
    });

    focus(cx, &handle);
    press(cx, "right");
    assert_eq!(cx.update(|_, cx| state.read(cx).value().end()), 45.0);
    press(cx, "left");
    assert_eq!(cx.update(|_, cx| state.read(cx).value().end()), 40.0);
    press(cx, "home");
    assert_eq!(cx.update(|_, cx| state.read(cx).value().end()), 0.0);
    press(cx, "end");
    assert_eq!(cx.update(|_, cx| state.read(cx).value().end()), 100.0);
}

struct NoteRoot {
    state: gpui_kit::Entity<TextareaState>,
}

impl Render for NoteRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div().size(px(520.0)).tab_group().child(PlopTextArea::new(
            self.state.clone(),
            "DISPATCH NOTE",
            theme(),
        ))
    }
}

#[gpui::test]
fn textarea_accepts_typing(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let (root, cx) = cx.add_window_view(|window, cx| NoteRoot {
        state: cx.new(|cx| TextareaState::new(window, cx).rows(3)),
    });
    let (state, handle) = cx.update(|_, cx| {
        let root = root.read(cx);
        (
            root.state.clone(),
            root.state.read(cx).focus_handle(cx).clone(),
        )
    });

    focus(cx, &handle);
    cx.simulate_input("abc");
    cx.update(|window, cx| window.draw(cx).clear(cx));
    let value = cx.update(|_, cx| state.read(cx).value().to_string());
    assert_eq!(
        value, "abc",
        "typing reaches the base textarea through PlopTextArea"
    );
}

#[gpui::test]
fn theme_global_round_trips(cx: &mut TestAppContext) {
    cx.update(|cx| {
        gpui_kit::init(cx);
        PlopTheme::init(cx);
        assert_eq!(PlopTheme::current(cx), PlopTheme::default());

        let notebook = PlopTheme::default()
            .with_surface(SurfaceName::Notebook)
            .with_dark(true);
        PlopTheme::set(cx, notebook);
        assert_eq!(PlopTheme::current(cx), notebook);
    });
}

struct SelectRoot {
    open: bool,
    selected: usize,
    focus: FocusHandle,
    changed: Rc<Cell<usize>>,
}

impl Render for SelectRoot {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let weak = cx.entity().downgrade();
        let changed = self.changed.clone();
        let open_handler = {
            let weak = weak.clone();
            move |open: bool, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.open = open;
                    cx.notify();
                });
            }
        };
        let select_handler = {
            let weak = weak.clone();
            move |index: usize, _: &mut Window, cx: &mut App| {
                changed.set(index);
                let _ = weak.update(cx, |this, cx| {
                    this.selected = index;
                    cx.notify();
                });
            }
        };
        div().size(px(420.0)).tab_group().child(
            PlopSelect::new(
                "test-select",
                "PLAN",
                vec!["ONE".into(), "TWO".into(), "THREE".into()],
                self.selected,
                self.open,
                self.focus.clone(),
                theme(),
            )
            .on_select(select_handler)
            .on_open_change(open_handler),
        )
    }
}

#[gpui::test]
fn select_opens_and_steps_from_keyboard(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let changed = Rc::new(Cell::new(usize::MAX));
    let changed_seed = changed.clone();
    let (root, cx) = cx.add_window_view(|_, cx| SelectRoot {
        open: false,
        selected: 0,
        focus: cx.focus_handle(),
        changed: changed_seed,
    });
    let handle = cx.update(|_, cx| root.read(cx).focus.clone());

    focus(cx, &handle);
    press(cx, "space");
    assert!(
        cx.update(|_, cx| root.read(cx).open),
        "Space opens the select"
    );
    press(cx, "down");
    assert_eq!(changed.get(), 1, "Down selects the next option");
    assert!(
        cx.update(|_, cx| root.read(cx).open),
        "moving keeps the panel open"
    );
    press(cx, "escape");
    assert!(
        !cx.update(|_, cx| root.read(cx).open),
        "Escape closes the select"
    );
}

struct MultiRoot {
    focus: FocusHandle,
    option_focus: FocusHandle,
    values: Rc<Cell<u32>>,
}

impl Render for MultiRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let values = self.values.clone();
        div().size(px(420.0)).tab_group().child(
            PlopMultiSelect::new(
                "test-multi",
                "CHANNELS",
                vec!["SMS".into(), "EMAIL".into()],
                vec![false, false],
                true,
                self.focus.clone(),
                vec![self.option_focus.clone()],
                theme(),
            )
            .on_toggle(move |index, _, _| values.set(values.get() | (1 << index))),
        )
    }
}

#[gpui::test]
fn multiselect_option_toggles_from_space(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let values = Rc::new(Cell::new(0u32));
    let values_seed = values.clone();
    let (root, cx) = cx.add_window_view(|_, cx| MultiRoot {
        focus: cx.focus_handle(),
        option_focus: cx.focus_handle(),
        values: values_seed,
    });
    let option = cx.update(|_, cx| root.read(cx).option_focus.clone());

    focus(cx, &option);
    press(cx, "space");
    assert_eq!(values.get(), 1, "Space toggles the focused option");
}

struct LinkRoot {
    focus: FocusHandle,
    clicks: Rc<Cell<usize>>,
}

impl Render for LinkRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let clicks = self.clicks.clone();
        div().size(px(420.0)).tab_group().child(
            PlopButtonLink::new("OPEN BOARD", self.focus.clone(), theme())
                .on_click(move |_, _| clicks.set(clicks.get() + 1)),
        )
    }
}

#[gpui::test]
fn link_activates_from_enter_only(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let clicks = Rc::new(Cell::new(0));
    let clicks_seed = clicks.clone();
    let (root, cx) = cx.add_window_view(|_, cx| LinkRoot {
        focus: cx.focus_handle(),
        clicks: clicks_seed,
    });
    let handle = cx.update(|_, cx| root.read(cx).focus.clone());

    focus(cx, &handle);
    press(cx, "space");
    assert_eq!(clicks.get(), 0, "Space does not activate a link");
    press(cx, "enter");
    assert_eq!(clicks.get(), 1, "Enter activates the link");
}

struct MenuRoot {
    open: bool,
    trigger: FocusHandle,
    item: FocusHandle,
    actions: Rc<Cell<usize>>,
}

impl Render for MenuRoot {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let weak = cx.entity().downgrade();
        let actions = self.actions.clone();
        let open_handler = {
            let weak = weak.clone();
            move |open: bool, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.open = open;
                    cx.notify();
                });
            }
        };
        div().size(px(420.0)).tab_group().child(
            PlopMenu::new(
                "test-menu",
                "ACTIONS",
                self.open,
                self.trigger.clone(),
                vec![self.item.clone()],
                theme(),
            )
            .item("ASSIGN", move |_, _| actions.set(actions.get() + 1))
            .on_open_change(open_handler),
        )
    }
}

#[gpui::test]
fn menu_item_runs_from_keyboard(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let actions = Rc::new(Cell::new(0));
    let actions_seed = actions.clone();
    let (root, cx) = cx.add_window_view(|_, cx| MenuRoot {
        open: true,
        trigger: cx.focus_handle(),
        item: cx.focus_handle(),
        actions: actions_seed,
    });
    let item = cx.update(|_, cx| root.read(cx).item.clone());

    focus(cx, &item);
    press(cx, "enter");
    assert_eq!(actions.get(), 1, "Enter runs the focused menu item");
    assert!(
        !cx.update(|_, cx| root.read(cx).open),
        "running an item closes the menu"
    );
}

#[gpui::test]
fn toast_queue_replaces_and_dismisses(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let queue = cx.new(|_| ToastQueue::new());
    let first = queue.update(cx, |queue, cx| queue.show(ToastTone::Info, "one", cx));
    assert_eq!(
        cx.update(|cx| queue.read(cx).current().map(|entry| entry.id)),
        Some(first)
    );

    let second = queue.update(cx, |queue, cx| queue.show(ToastTone::Success, "two", cx));
    assert_ne!(first, second);
    let message = cx.update(|cx| queue.read(cx).current().map(|entry| entry.message.clone()));
    assert_eq!(
        message.as_deref(),
        Some("two"),
        "a new toast replaces the last one"
    );

    queue.update(cx, |queue, cx| queue.dismiss(first, cx));
    assert_eq!(
        cx.update(|cx| queue.read(cx).current().map(|entry| entry.id)),
        Some(second),
        "an old timer must not dismiss the newer toast"
    );

    queue.update(cx, |queue, cx| queue.dismiss(second, cx));
    assert!(
        cx.update(|cx| queue.read(cx).current().is_none()),
        "the current toast can be dismissed"
    );
}

#[gpui::test]
fn toast_global_helpers_show_and_dismiss(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);
    let queue = cx.update(init_toasts);
    let id = cx
        .update(|cx| show_toast(cx, ToastTone::Info, "HELLO"))
        .expect("init_toasts installs the queue");
    assert_eq!(
        cx.update(|cx| queue.read(cx).current().map(|entry| entry.id)),
        Some(id)
    );

    cx.update(|cx| dismiss_toast(cx, id));
    assert!(
        cx.update(|cx| queue.read(cx).current().is_none()),
        "the global dismiss helper clears the current toast"
    );
}

struct RadioGroupRoot {
    focuses: [FocusHandle; 3],
    selected: Rc<Cell<usize>>,
    changes: Rc<Cell<usize>>,
}

impl Render for RadioGroupRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let selected = self.selected.clone();
        let changes = self.changes.clone();
        let current = self.selected.get();
        div().size(px(420.0)).tab_group().child(
            PlopRadioGroup::new(
                "plan-test",
                "PRIORITY",
                vec!["STANDARD".into(), "EXPRESS".into(), "OH NO".into()],
                current,
                self.focuses.to_vec(),
                theme(),
            )
            .on_change(move |index, _, _| {
                changes.set(index);
                selected.set(index);
            }),
        )
    }
}

#[gpui::test]
fn radio_group_moves_with_arrows_and_space(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let selected = Rc::new(Cell::new(0));
    let changes = Rc::new(Cell::new(0));
    let (root, cx) = cx.add_window_view(|_, cx| RadioGroupRoot {
        focuses: std::array::from_fn(|_| cx.focus_handle()),
        selected: selected.clone(),
        changes: changes.clone(),
    });
    let focuses = cx.update(|_, cx| root.read(cx).focuses.clone());

    focus(cx, &focuses[0]);
    press(cx, "down");
    assert_eq!(changes.get(), 1, "Down selects the next radio");
    cx.update(|window, cx| {
        assert_eq!(
            window.focused(cx).as_ref(),
            Some(&focuses[1]),
            "focus follows selection"
        );
    });

    press(cx, "down");
    assert_eq!(changes.get(), 2);
    press(cx, "down");
    assert_eq!(changes.get(), 0, "Down wraps to the first radio");
    press(cx, "up");
    assert_eq!(changes.get(), 2, "Up wraps to the last radio");

    press(cx, "home");
    assert_eq!(changes.get(), 0);
    press(cx, "end");
    assert_eq!(changes.get(), 2);

    // Space is the radio's own activation, not the arrow handler.
    selected.set(2);
    changes.set(2);
    focus(cx, &focuses[0]);
    press(cx, "space");
    assert_eq!(changes.get(), 0, "Space selects the focused radio");
}

struct LoadingButtonRoot {
    focus: FocusHandle,
    clicks: Rc<Cell<usize>>,
}

impl Render for LoadingButtonRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let clicks = self.clicks.clone();
        div().size(px(300.0)).tab_group().child(
            PlopButton::new("loading-save", "SAVE", theme(), self.focus.clone())
                .loading(true)
                .on_click(move |_, _, _| clicks.set(clicks.get() + 1)),
        )
    }
}

#[gpui::test]
fn loading_button_ignores_keyboard(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let clicks = Rc::new(Cell::new(0));
    let clicks_for_root = clicks.clone();
    let (root, cx) = cx.add_window_view(|_, cx| LoadingButtonRoot {
        focus: cx.focus_handle(),
        clicks: clicks_for_root,
    });
    let handle = cx.update(|_, cx| root.read(cx).focus.clone());

    focus(cx, &handle);
    press(cx, "space");
    press(cx, "enter");
    assert_eq!(
        clicks.get(),
        0,
        "a loading button ignores Space and Enter until it settles"
    );
}

struct IconButtonRoot {
    focus: FocusHandle,
    clicks: Rc<Cell<usize>>,
}

impl Render for IconButtonRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let clicks = self.clicks.clone();
        div().size(px(240.0)).tab_group().child(
            PlopIconButton::with_icon(
                "assign-icon",
                "Assign a unit",
                IconKind::Check,
                self.focus.clone(),
                theme(),
            )
            .on_click(move |_, _, _| clicks.set(clicks.get() + 1)),
        )
    }
}

#[gpui::test]
fn icon_button_activates_from_space_and_enter(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let clicks = Rc::new(Cell::new(0));
    let clicks_for_root = clicks.clone();
    let (root, cx) = cx.add_window_view(|_, cx| IconButtonRoot {
        focus: cx.focus_handle(),
        clicks: clicks_for_root,
    });
    let handle = cx.update(|_, cx| root.read(cx).focus.clone());

    focus(cx, &handle);
    press(cx, "space");
    assert_eq!(clicks.get(), 1, "Space activates the icon button");
    press(cx, "enter");
    assert_eq!(clicks.get(), 2, "Enter activates the icon button");
}

struct PaletteRoot {
    open: Rc<Cell<bool>>,
    selected: Rc<Cell<usize>>,
    confirmed: Rc<Cell<usize>>,
    closed: Rc<Cell<usize>>,
    query: Entity<InputState>,
}

impl Render for PaletteRoot {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let weak = cx.entity().downgrade();
        let selected = self.selected.clone();
        let confirmed = self.confirmed.clone();
        let closed = self.closed.clone();
        let open = self.open.clone();

        let move_weak = weak.clone();
        let on_move = move |index: usize, _: &mut Window, cx: &mut App| {
            selected.set(index);
            let _ = move_weak.update(cx, |_, cx| cx.notify());
        };
        let on_confirm = move |index: usize, _: &mut Window, _: &mut App| {
            confirmed.set(index);
        };
        let close_weak = weak.clone();
        let on_close = move |_: &mut Window, cx: &mut App| {
            closed.set(closed.get() + 1);
            open.set(false);
            let _ = close_weak.update(cx, |_, cx| cx.notify());
        };

        div().size(px(720.0)).tab_group().child(
            PlopCommandPalette::new(
                self.open.get(),
                self.query.clone(),
                vec!["ASSIGN".into(), "RESOLVE".into(), "CALL".into()],
                self.selected.get(),
                theme(),
            )
            .on_move(on_move)
            .on_confirm(on_confirm)
            .on_close(on_close),
        )
    }
}

#[gpui::test]
fn command_palette_moves_and_confirms_from_keyboard(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let open = Rc::new(Cell::new(true));
    let selected = Rc::new(Cell::new(0));
    let confirmed = Rc::new(Cell::new(usize::MAX));
    let closed = Rc::new(Cell::new(0));
    let (root, cx) = cx.add_window_view(|window, cx| PaletteRoot {
        open: open.clone(),
        selected: selected.clone(),
        confirmed: confirmed.clone(),
        closed: closed.clone(),
        query: cx.new(|cx| InputState::new(window, cx).placeholder("Type a command")),
    });
    let handle = cx.update(|_, cx| root.read(cx).query.read(cx).focus_handle(cx).clone());

    focus(cx, &handle);
    press(cx, "down");
    assert_eq!(selected.get(), 1, "Down selects the next command");
    press(cx, "down");
    assert_eq!(selected.get(), 2);
    press(cx, "down");
    assert_eq!(selected.get(), 0, "Down wraps to the first command");
    press(cx, "up");
    assert_eq!(selected.get(), 2, "Up wraps to the last command");

    press(cx, "enter");
    assert_eq!(confirmed.get(), 2, "Enter confirms the selected command");
    assert!(open.get(), "confirming leaves closing to the host");

    press(cx, "escape");
    assert_eq!(closed.get(), 1, "Escape asks the host to close");
    assert!(!open.get(), "the host closes the palette");
}

struct FieldRoot {
    state: Entity<InputState>,
}

impl Render for FieldRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div().size(px(420.0)).tab_group().child(PlopTextField::new(
            self.state.clone(),
            "NAME",
            theme(),
        ))
    }
}

#[gpui::test]
fn text_field_accepts_typing(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let (root, cx) = cx.add_window_view(|window, cx| FieldRoot {
        state: cx.new(|cx| InputState::new(window, cx).placeholder("Ada Lovelace")),
    });
    let (state, handle) = cx.update(|_, cx| {
        let root = root.read(cx);
        (
            root.state.clone(),
            root.state.read(cx).focus_handle(cx).clone(),
        )
    });

    focus(cx, &handle);
    cx.simulate_input("ada");
    cx.update(|window, cx| window.draw(cx).clear(cx));
    let value = cx.update(|_, cx| state.read(cx).value().to_string());
    assert_eq!(
        value, "ada",
        "typing reaches the base input through PlopTextField"
    );
}

struct BurstButtonRoot {
    focus: FocusHandle,
}

impl Render for BurstButtonRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div().size(px(240.0)).tab_group().child(
            PlopButton::new("burst-button", "PRESS", theme(), self.focus.clone())
                .on_click(|_, _, _| {}),
        )
    }
}

#[gpui::test]
fn pressing_a_button_throws_an_ink_burst(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);
    let queue = cx.update(plopui_gpui::init_ink_bursts);

    let (root, cx) = cx.add_window_view(|_, cx| BurstButtonRoot {
        focus: cx.focus_handle(),
    });
    let handle = cx.update(|_, cx| root.read(cx).focus.clone());

    focus(cx, &handle);
    press(cx, "space");
    assert_eq!(
        cx.update(|_, cx| queue.read(cx).len()),
        1,
        "Space throws one burst"
    );
    press(cx, "enter");
    assert_eq!(
        cx.update(|_, cx| queue.read(cx).len()),
        2,
        "Enter throws another burst"
    );

    cx.simulate_click(point(px(12.0), px(12.0)), Modifiers::default());
    assert_eq!(
        cx.update(|_, cx| queue.read(cx).len()),
        3,
        "a pointer click throws a burst too"
    );
}
