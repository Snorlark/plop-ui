//! Conversions from PlopUI's plain RGB tokens to GPUI colors.

use gpui_kit::{Hsla, Rgba as GpuiRgba, rgb};
use plopui_core::theme::{Rgb, Rgba};

pub fn to_rgba(color: Rgb) -> GpuiRgba {
    rgb(color.to_u32())
}

pub fn to_hsla(color: Rgb) -> Hsla {
    to_rgba(color).into()
}

pub fn alpha_rgba(color: Rgba) -> GpuiRgba {
    GpuiRgba {
        r: color.r as f32 / 255.0,
        g: color.g as f32 / 255.0,
        b: color.b as f32 / 255.0,
        a: color.a,
    }
}

pub fn alpha_hsla(color: Rgba) -> Hsla {
    alpha_rgba(color).into()
}
