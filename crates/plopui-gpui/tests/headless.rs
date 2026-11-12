//! Headless smoke tests for the GPUI layer: real paint output and keyboard activation.

use std::cell::Cell;
use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::platform::current_headless_renderer;
use gpui_kit::{
    AppContext as _, Context, FocusHandle, HeadlessAppContext, InteractiveElement as _,
    IntoElement, KeyDownEvent, KeyUpEvent, Keystroke, Modifiers, NoopTextSystem,
    ParentElement as _, Render, Styled, TestAppContext, VisualTestContext, Window, canvas, div,
    point, px, size,
};
use plopui_core::theme::SurfaceName;
use plopui_gpui::{
    AvatarStatus, PlopAvatar, PlopButton, PlopSpinner, PlopTheme, PlopToastHost, ToastQueue,
    ToastTone,
};

struct SmokeRoot {
    focus: FocusHandle,
    clicks: Rc<Cell<usize>>,
}

impl Render for SmokeRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let theme = PlopTheme {
            surface: SurfaceName::Poster,
            dark: false,
        };
        let background = plopui_gpui::color::to_hsla(theme.mode().bg);
        let clicks = self.clicks.clone();
        div().size(px(300.0)).tab_group().bg(background).child(
            PlopButton::new("smoke-save", "SAVE", theme, self.focus.clone())
                .on_click(move |_, _, _| clicks.set(clicks.get() + 1)),
        )
    }
}

struct BaseSmokeRoot {
    focus: FocusHandle,
    clicks: Rc<Cell<usize>>,
}

impl Render for BaseSmokeRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let clicks = self.clicks.clone();
        div().size(px(300.0)).tab_group().child(
            gpui_kit::base::Button::new("base-smoke")
                .track_focus(&self.focus)
                .size(px(140.0))
                .on_click(move |_, _, _| clicks.set(clicks.get() + 1)),
        )
    }
}

fn press(cx: &mut VisualTestContext, key: &str) {
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

fn focus_by_click(cx: &mut VisualTestContext, focus: &FocusHandle) {
    cx.update(|window, cx| {
        window.activate_window();
        window.draw(cx).clear(cx);
    });
    cx.simulate_click(point(px(10.0), px(10.0)), Modifiers::default());
    cx.update(|window, cx| {
        assert_eq!(
            window.focused(cx).as_ref(),
            Some(focus),
            "click should focus the button"
        );
        window.draw(cx).clear(cx);
    });
}

#[test]
fn sticker_paints_cobalt_off_screen() {
    let text_system = Arc::new(NoopTextSystem);
    let mut cx = HeadlessAppContext::with_platform(text_system, Arc::new(()), || {
        current_headless_renderer()
    });
    cx.update(gpui_kit::init);

    let clicks = Rc::new(Cell::new(0));
    let root = cx.new(|cx| SmokeRoot {
        focus: cx.focus_handle(),
        clicks: clicks.clone(),
    });
    let focus = cx.update(|cx| root.read(cx).focus.clone());
    let window = cx
        .open_window(size(px(360.0), px(180.0)), move |_, _| root.clone())
        .expect("open headless window");

    let any = window.into();
    cx.update_window(any, |_, window, cx| {
        window.activate_window();
        window.focus(&focus, cx);
    })
    .expect("focus the button");

    let image = cx.capture_screenshot(any).expect("render smoke root");
    assert!(image.width() >= 360 && image.height() >= 180);

    let ink = plopui_core::theme::color::INK.to_u32();
    let ink_pixels = image
        .pixels()
        .filter(|pixel| {
            (((pixel[0] as u32) << 16) | ((pixel[1] as u32) << 8) | pixel[2] as u32) == ink
        })
        .count();
    assert!(
        ink_pixels > 500,
        "the sticker face should paint cobalt ink, found {ink_pixels} ink pixels"
    );
}

#[gpui::test]
fn plop_button_activates_from_keyboard(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let clicks = Rc::new(Cell::new(0));
    let clicks_for_root = clicks.clone();
    let (root, cx) = cx.add_window_view(|_, cx| SmokeRoot {
        focus: cx.focus_handle(),
        clicks: clicks_for_root,
    });
    let focus = cx.update(|_, cx| root.read(cx).focus.clone());

    focus_by_click(cx, &focus);
    clicks.set(0);
    press(cx, "space");
    assert_eq!(clicks.get(), 1, "Space activates the focused button");

    press(cx, "enter");
    assert_eq!(clicks.get(), 2, "Enter activates the focused button");
}

#[gpui::test]
fn base_button_activates_from_keyboard(cx: &mut TestAppContext) {
    cx.update(gpui_kit::init);

    let clicks = Rc::new(Cell::new(0));
    let clicks_for_root = clicks.clone();
    let (root, cx) = cx.add_window_view(|_, cx| BaseSmokeRoot {
        focus: cx.focus_handle(),
        clicks: clicks_for_root,
    });
    let focus = cx.update(|_, cx| root.read(cx).focus.clone());

    focus_by_click(cx, &focus);
    clicks.set(0);
    press(cx, "space");
    assert_eq!(clicks.get(), 1, "base Space activates the focused button");
}

struct FaceRoot;

impl Render for FaceRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let theme = PlopTheme {
            surface: SurfaceName::Poster,
            dark: false,
        };
        let background = plopui_gpui::color::to_hsla(theme.mode().bg);
        div()
            .size(px(260.0))
            .bg(background)
            .flex()
            .gap(px(12.0))
            .child(
                PlopAvatar::new("Grace Hopper")
                    .size(88.0)
                    .status(AvatarStatus::Online),
            )
            .child(PlopAvatar::new("Ada Lovelace").size(88.0).initials())
    }
}

#[test]
fn avatar_paints_a_face_and_a_status_dot() {
    let text_system = Arc::new(NoopTextSystem);
    let mut cx = HeadlessAppContext::with_platform(text_system, Arc::new(()), || {
        current_headless_renderer()
    });
    cx.update(gpui_kit::init);

    let root = cx.new(|_| FaceRoot);
    let window = cx
        .open_window(size(px(280.0), px(120.0)), move |_, _| root.clone())
        .expect("open headless window");
    let any = window.into();
    cx.update_window(any, |_, window, cx| {
        window.activate_window();
        window.draw(cx).clear(cx);
    })
    .expect("draw the avatars");

    let image = cx.capture_screenshot(any).expect("render avatars");
    let count = |hex: u32| {
        image
            .pixels()
            .filter(|pixel| {
                (((pixel[0] as u32) << 16) | ((pixel[1] as u32) << 8) | pixel[2] as u32) == hex
            })
            .count()
    };
    assert!(
        count(plopui_core::theme::color::INK.to_u32()) > 400,
        "the face outline and hair should paint ink"
    );
    assert!(
        count(plopui_core::theme::color::LEAF.to_u32()) > 10,
        "the online status dot should paint leaf green"
    );
}

struct ToastRoot {
    host: gpui_kit::Entity<PlopToastHost>,
}

impl Render for ToastRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .relative()
            .w(px(420.0))
            .h(px(200.0))
            .child(self.host.clone())
    }
}

#[test]
fn live_toast_paints_its_card() {
    let text_system = Arc::new(NoopTextSystem);
    let mut cx = HeadlessAppContext::with_platform(text_system, Arc::new(()), || {
        current_headless_renderer()
    });
    cx.update(gpui_kit::init);

    let queue = cx.new(|_| ToastQueue::new());
    cx.update(|cx| {
        queue.update(cx, |queue, cx| {
            queue.show_for(
                ToastTone::Success,
                "SKETCH POSTED",
                std::time::Duration::from_secs(60),
                cx,
            );
        });
    });
    let host = cx.new(|_| PlopToastHost::new(queue.clone()));
    let root = cx.new(|_| ToastRoot { host });
    let window = cx
        .open_window(size(px(440.0), px(220.0)), move |_, _| root.clone())
        .expect("open headless window");
    let any = window.into();
    cx.update_window(any, |_, window, cx| {
        window.activate_window();
        window.draw(cx).clear(cx);
    })
    .expect("draw the toast host");

    let image = cx.capture_screenshot(any).expect("render the toast");
    let ink = plopui_core::theme::color::INK.to_u32();
    let ink_pixels = image
        .pixels()
        .filter(|pixel| {
            (((pixel[0] as u32) << 16) | ((pixel[1] as u32) << 8) | pixel[2] as u32) == ink
        })
        .count();
    assert!(
        ink_pixels > 120,
        "the live toast card and its lettering should paint ink, found {ink_pixels}"
    );
}

struct SpinnerProbeRoot;

impl Render for SpinnerProbeRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div().size(px(160.0)).child(
            div()
                .relative()
                .size(px(80.0))
                .flex()
                .items_center()
                .justify_center()
                .child(
                    div()
                        .absolute()
                        .inset_0()
                        .flex()
                        .items_center()
                        .justify_center()
                        .child(
                            PlopSpinner::new("probe-spinner")
                                .size(18.0)
                                .color(plopui_core::theme::color::TOMATO),
                        ),
                ),
        )
    }
}

#[test]
fn spinner_paints_inside_an_absolute_overlay() {
    let text_system = Arc::new(NoopTextSystem);
    let mut cx = HeadlessAppContext::with_platform(text_system, Arc::new(()), || {
        current_headless_renderer()
    });
    cx.update(gpui_kit::init);

    let root = cx.new(|_| SpinnerProbeRoot);
    let window = cx
        .open_window(size(px(180.0), px(180.0)), move |_, _| root.clone())
        .expect("open headless window");
    let any = window.into();
    cx.update_window(any, |_, window, cx| {
        window.activate_window();
        window.draw(cx).clear(cx);
    })
    .expect("draw the spinner");

    let image = cx.capture_screenshot(any).expect("render the spinner");
    let tomato = plopui_core::theme::color::TOMATO.to_u32();
    let tomato_pixels = image
        .pixels()
        .filter(|pixel| {
            (((pixel[0] as u32) << 16) | ((pixel[1] as u32) << 8) | pixel[2] as u32) == tomato
        })
        .count();
    assert!(
        tomato_pixels > 20,
        "an 18 px spinner should paint inside an absolute overlay, found {tomato_pixels}"
    );
}

struct BurstProbeRoot;

impl Render for BurstProbeRoot {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div().size(px(180.0)).bg(gpui_kit::black()).child(
            canvas(
                |bounds, _, _| bounds,
                |bounds, _, window, _| {
                    plopui_gpui::paint::paint_ink_burst(
                        window,
                        bounds,
                        0.2,
                        plopui_core::theme::color::TOMATO,
                    )
                },
            )
            .absolute()
            .inset_0(),
        )
    }
}

#[test]
fn ink_burst_paints_warm_marks() {
    let text_system = Arc::new(NoopTextSystem);
    let mut cx = HeadlessAppContext::with_platform(text_system, Arc::new(()), || {
        current_headless_renderer()
    });
    cx.update(gpui_kit::init);

    let root = cx.new(|_| BurstProbeRoot);
    let window = cx
        .open_window(size(px(180.0), px(180.0)), move |_, _| root.clone())
        .expect("open headless window");
    let any = window.into();
    cx.update_window(any, |_, window, cx| {
        window.activate_window();
        window.draw(cx).clear(cx);
    })
    .expect("draw the burst");

    let image = cx.capture_screenshot(any).expect("render the burst");
    let warm = image
        .pixels()
        .filter(|pixel| {
            pixel[0] > 120 && (pixel[0] as u32) > (pixel[1] as u32) * 2 && pixel[1] < 90
        })
        .count();
    assert!(
        warm > 30,
        "the ink burst should leave tomato marks on black, found {warm} warm pixels"
    );
}
