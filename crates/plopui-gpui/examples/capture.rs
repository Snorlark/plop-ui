//! Renders the gallery off-screen and saves a PNG.
//!
//! Run with: cargo run -p plopui-gpui --example capture
//! Uses the cross-platform headless renderer (Metal on macOS), so it does not
//! need a visible window or an unlocked desktop session.

#[path = "gallery.rs"]
mod gallery;

use gpui_kit::platform::{current_headless_renderer, current_platform};
use gpui_kit::*;

fn main() {
    let height = std::env::var("PLOP_CAPTURE_HEIGHT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(920.0);
    let text_system = current_platform(false).text_system();
    let mut cx = HeadlessAppContext::with_platform(text_system, std::sync::Arc::new(()), || {
        current_headless_renderer()
    });
    cx.update(|cx| {
        gallery::load_fonts(cx);
        gpui_kit::init(cx);
        plopui_gpui::PlopTheme::init(cx);
    });

    let window = cx
        .open_window(size(px(1240.0), px(height)), |window, cx| {
            cx.new(|cx| gallery::Gallery::new(window, cx))
        })
        .expect("open headless window");

    cx.run_until_parked();
    let image = cx
        .capture_screenshot(window.into())
        .expect("capture gallery");
    let out =
        std::env::var("PLOP_CAPTURE_OUT").unwrap_or_else(|_| "/tmp/plopui-gallery.png".to_string());
    image.save(&out).expect("write capture output");
    println!("saved {out} ({}x{})", image.width(), image.height());
}
