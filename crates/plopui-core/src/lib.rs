//! Deterministic visual core shared by PlopUI renderers.
//!
//! This crate is pure Rust and has no `gpui` dependency. It transcribes the
//! design tokens, seeded randomness, WCAG contrast helpers and hand-drawn
//! geometry from the TypeScript packages so a native renderer can produce the
//! same pixels without a browser.
//!
//! Everything here is deterministic: the same seed always yields the same
//! tilt, wobble, or hatch, on every frame and every platform build.

pub mod contrast;
pub mod geometry;
pub mod motion;
pub mod seed;
pub mod svg;
pub mod theme;
