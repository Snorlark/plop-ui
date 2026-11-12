//! PlopUI for GPUI — a hand-drawn, accessible component layer.
//!
//! The visual language comes from PlopUI's MIT-licensed tokens and assets.
//! Interaction, focus and text editing come from `gpui-base`. Painting is
//! deterministic and seed-driven; nothing here calls `random()` in render.

pub mod color;
pub mod components;
pub mod icons;
pub mod ink;
pub mod paint;
pub mod theme;

pub use components::*;
pub use icons::*;
pub use ink::*;
pub use theme::PlopTheme;
