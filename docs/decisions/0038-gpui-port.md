# The GPUI port reuses gpui-base for interaction and owns only the paint

The Rust spike in `crates/plopui-gpui` does not reimplement buttons, checkboxes, switches, radios or text fields. It wraps `gpui-base`, which already carries focus tracking, Tab order, Space/Enter activation, IME, selection, clipboard and undo. PlopUI supplies the visual layer: a canvas that paints the sticker, the wobbled outline and the seeded paper. This is the same split the React kit makes with native elements: the platform keeps the behaviour, PlopUI keeps the look.

A second crate, `plopui-core`, holds the tokens, the seeded randomness, the contrast helpers and the hand-drawn geometry in pure Rust. It has no GPUI dependency, so it can be unit-tested against the TypeScript vectors without a window. The seed implementation reproduces UTF-16 FNV-1a and mulberry32 exactly; the tests compare tilt values with the JavaScript output, not with a new Rust-only snapshot.

The wobble is geometry rather than a CSS displacement filter. GPUI has no SVG filter pipeline, so borders are rounded polylines pushed off true by a stable seed, and hatching is painted line by line. That is a deliberate loss of fidelity in exchange for identical output on every frame and every platform. Nothing in a render pass calls `random()`.

Versions are pinned together: `gpui-kit =0.9.0`, `gpui-pre =0.3.11` and Rust 1.99.1. The pinned GPUI release uses standard-library features that older toolchains reject, so `rust-toolchain.toml` is part of the port, not a local preference. Bumping any one of the three needs a full `cargo test --workspace` and a fresh capture.

Visual evidence comes from `examples/capture.rs`, which opens an off-screen window through `HeadlessAppContext` and `current_headless_renderer()` and saves a PNG. This works on a locked macOS session, where a screen capture is black. A real window is still the way to check focus rings and typing by hand.

Text color follows the paper, not the page. The React kit resets `--plop-on` and friends inside `.plop-paper`; the Rust components make the same move by painting cards, field labels, checkbox labels and radio labels with ink tokens, while text placed directly on the surface keeps the surface's `on` color. The first dark capture showed cream labels on a cream card; that was the missing paper scope, not a token bug.
