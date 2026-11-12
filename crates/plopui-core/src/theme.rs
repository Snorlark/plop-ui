//! PlopUI design tokens, transcribed 1:1 from `packages/tokens/src/tokens.ts`.
//!
//! Colors live here as concrete RGB values instead of CSS strings. Radii keep
//! the token order: top-left, top-right, bottom-right, bottom-left. The values
//! are the horizontal CSS radii; the geometry module treats every corner as a
//! circular arc, which is a deliberate approximation of the elliptical CSS
//! shorthand.

// Token colors are written as hex with the channels grouped by byte
// (`0x28_48_D8`), which is easier to read than a uniform grouping.
#![allow(clippy::unusual_byte_groupings)]

use std::fmt;

/// A color in the sRGB space, 8 bits per channel.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct Rgb {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Rgb {
    pub const fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }

    /// Builds a color from a packed `0xRRGGBB` value.
    pub const fn hex(value: u32) -> Self {
        Self {
            r: ((value >> 16) & 0xff) as u8,
            g: ((value >> 8) & 0xff) as u8,
            b: (value & 0xff) as u8,
        }
    }

    /// Formats as `#RRGGBB`.
    pub fn to_hex(self) -> String {
        format!("#{:02X}{:02X}{:02X}", self.r, self.g, self.b)
    }

    /// The same color as a `0xRRGGBB` integer.
    pub const fn to_u32(self) -> u32 {
        ((self.r as u32) << 16) | ((self.g as u32) << 8) | self.b as u32
    }
}

impl fmt::Display for Rgb {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_hex())
    }
}

/// A color with a straight (non-premultiplied) alpha channel.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Rgba {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: f32,
}

impl Rgba {
    /// Fully transparent black.
    pub const TRANSPARENT: Self = Self {
        r: 0,
        g: 0,
        b: 0,
        a: 0.0,
    };

    pub const fn new(r: u8, g: u8, b: u8, a: f32) -> Self {
        Self { r, g, b, a }
    }

    pub const fn from_rgb(color: Rgb, a: f32) -> Self {
        Self {
            r: color.r,
            g: color.g,
            b: color.b,
            a,
        }
    }
}

/// Token colors. One cobalt ink draws everything; spot colors only fill.
pub mod color {
    use super::{Rgb, Rgba};

    pub const INK: Rgb = Rgb::hex(0x2848_D8);
    pub const INK_TEXT: Rgb = Rgb::hex(0x1C2E_8C);
    pub const INK_SOFT: Rgb = Rgb::hex(0x3B4A_92);
    pub const ON_INK: Rgb = Rgb::hex(0xFFF8_E7);
    pub const PAPER: Rgb = Rgb::hex(0xFFFD_F7);
    pub const PAPER_BACK: Rgb = Rgb::hex(0xE6DC_C2);
    pub const SHEET: Rgb = Rgb::hex(0xFBF8_F0);
    pub const TRACK: Rgb = Rgb::hex(0xEDE4_CC);
    pub const TOMATO: Rgb = Rgb::hex(0xD238_1E);
    pub const MUSTARD: Rgb = Rgb::hex(0xF6C4_45);
    pub const BUBBLEGUM: Rgb = Rgb::hex(0xF6A9_B8);
    pub const PERIWINKLE: Rgb = Rgb::hex(0xA9B6_EE);
    pub const MINT: Rgb = Rgb::hex(0x9FD8_B8);
    /// Deep green for ticks and success marks drawn on paper.
    pub const LEAF: Rgb = Rgb::hex(0x2F8A_57);
    /// Tomato dark enough to carry error text on paper.
    pub const TOMATO_TEXT: Rgb = Rgb::hex(0xA130_1A);
    /// Deep stamp inks for marks pressed onto paper.
    pub const OCHRE: Rgb = Rgb::hex(0xB779_1F);
    pub const BERRY: Rgb = Rgb::hex(0xB83A_68);
    pub const PLACEHOLDER: Rgb = Rgb::hex(0x5D69_A6);

    /// Flat "printed" drop shadow under stickers and sheets.
    pub const SHADOW: Rgba = Rgba::new(18, 36, 120, 0.20);
    pub const SHADOW_STRONG: Rgba = Rgba::new(18, 36, 120, 0.30);
}

/// Fills a component can be printed in, in token order.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Fill {
    Ink,
    Periwinkle,
    Mint,
    Tomato,
    Mustard,
    Bubblegum,
    Plain,
}

impl Fill {
    pub const ALL: [Fill; 7] = [
        Fill::Ink,
        Fill::Periwinkle,
        Fill::Mint,
        Fill::Tomato,
        Fill::Mustard,
        Fill::Bubblegum,
        Fill::Plain,
    ];

    /// The fill color printed behind content.
    pub const fn color(self) -> Rgb {
        match self {
            Fill::Ink => color::INK,
            Fill::Periwinkle => color::PERIWINKLE,
            Fill::Mint => color::MINT,
            Fill::Tomato => color::TOMATO,
            Fill::Mustard => color::MUSTARD,
            Fill::Bubblegum => color::BUBBLEGUM,
            Fill::Plain => color::PAPER,
        }
    }

    /// The text color that passes AA on [`Fill::color`], per the `onFill` table.
    pub const fn on_fill(self) -> Rgb {
        match self {
            Fill::Ink | Fill::Tomato => color::ON_INK,
            Fill::Periwinkle | Fill::Mint | Fill::Mustard | Fill::Bubblegum => color::INK_TEXT,
            Fill::Plain => color::INK,
        }
    }

    /// The measured ratio recorded in the `onFill` token table.
    pub const fn on_fill_ratio(self) -> f64 {
        match self {
            Fill::Ink => 6.6,
            Fill::Tomato => 4.6,
            Fill::Periwinkle => 5.8,
            Fill::Mint => 7.1,
            Fill::Mustard => 7.1,
            Fill::Bubblegum => 6.2,
            Fill::Plain => 6.9,
        }
    }
}

/// Ops status. Every status has a fill and a text label, never color alone.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Status {
    Critical,
    Dispatched,
    EnRoute,
    Resolved,
    Unassigned,
}

impl Status {
    pub const ALL: [Status; 5] = [
        Status::Critical,
        Status::Dispatched,
        Status::EnRoute,
        Status::Resolved,
        Status::Unassigned,
    ];

    pub const fn fill(self) -> Fill {
        match self {
            Status::Critical => Fill::Tomato,
            Status::Dispatched => Fill::Ink,
            Status::EnRoute => Fill::Mustard,
            Status::Resolved => Fill::Mint,
            Status::Unassigned => Fill::Periwinkle,
        }
    }

    pub const fn label(self) -> &'static str {
        match self {
            Status::Critical => "Critical",
            Status::Dispatched => "Dispatched",
            Status::EnRoute => "En route",
            Status::Resolved => "Resolved",
            Status::Unassigned => "Unassigned",
        }
    }
}

/// One mode (light or dark) of a paper surface.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct SurfaceMode {
    /// Page background.
    pub bg: Rgb,
    /// Primary line of the paper pattern.
    pub line_a: Rgba,
    /// Secondary line of the paper pattern.
    pub line_b: Rgba,
    /// Text drawn directly on the surface.
    pub on: Rgb,
    /// Soft text on the surface (captions); always solid.
    pub on_soft: Rgb,
    /// Focus ring ("cut here" line).
    pub focus: Rgb,
    /// Hatched shadow lines.
    pub hatch: Rgba,
    /// Soft light falling on the paper; transparent when unused.
    pub glow: Rgba,
}

/// A named paper surface with both modes.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Surface {
    pub label: &'static str,
    pub light: SurfaceMode,
    pub dark: SurfaceMode,
}

/// The five surfaces, in token order.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum SurfaceName {
    Poster,
    Mat,
    Notebook,
    Kraft,
    Riso,
}

impl SurfaceName {
    pub const ALL: [SurfaceName; 5] = [
        SurfaceName::Poster,
        SurfaceName::Mat,
        SurfaceName::Notebook,
        SurfaceName::Kraft,
        SurfaceName::Riso,
    ];

    pub const fn label(self) -> &'static str {
        match self {
            SurfaceName::Poster => "Poster",
            SurfaceName::Mat => "Cutting mat",
            SurfaceName::Notebook => "Notebook",
            SurfaceName::Kraft => "Kraft",
            SurfaceName::Riso => "Riso",
        }
    }

    /// Returns the named surface, with both light and dark modes complete.
    ///
    /// The whole surface is returned, so `dark` does not discard data; it is
    /// accepted to mirror the React provider's theme flag. Use [`Self::mode`]
    /// to read the selected mode.
    pub const fn surface(self, dark: bool) -> Surface {
        let _ = dark;
        Surface {
            label: self.label(),
            light: self.light_mode(),
            dark: self.dark_mode(),
        }
    }

    /// Returns just the mode requested.
    pub const fn mode(self, dark: bool) -> SurfaceMode {
        if dark {
            self.dark_mode()
        } else {
            self.light_mode()
        }
    }

    const fn light_mode(self) -> SurfaceMode {
        match self {
            SurfaceName::Poster => POSTER_LIGHT,
            SurfaceName::Mat => MAT_LIGHT,
            SurfaceName::Notebook => NOTEBOOK_LIGHT,
            SurfaceName::Kraft => KRAFT_LIGHT,
            SurfaceName::Riso => RISO_LIGHT,
        }
    }

    const fn dark_mode(self) -> SurfaceMode {
        match self {
            SurfaceName::Poster => POSTER_DARK,
            SurfaceName::Mat => MAT_DARK,
            SurfaceName::Notebook => NOTEBOOK_DARK,
            SurfaceName::Kraft => KRAFT_DARK,
            SurfaceName::Riso => RISO_DARK,
        }
    }
}

const POSTER_LIGHT: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0xEEE7_D6),
    line_a: Rgba::new(40, 72, 216, 0.08),
    line_b: Rgba::TRANSPARENT,
    on: color::INK,
    on_soft: color::INK_SOFT,
    focus: color::TOMATO,
    hatch: Rgba::from_rgb(color::INK, 1.0),
    glow: Rgba::new(255, 255, 255, 0.45),
};

const POSTER_DARK: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0x131A_35),
    line_a: Rgba::new(255, 248, 231, 0.05),
    line_b: Rgba::TRANSPARENT,
    on: color::ON_INK,
    on_soft: Rgb::hex(0xCFC8_B6),
    focus: color::MUSTARD,
    hatch: Rgba::new(255, 248, 231, 0.5),
    glow: Rgba::new(255, 255, 255, 0.04),
};

const MAT_LIGHT: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0x2E6B_55),
    line_a: Rgba::new(255, 248, 231, 0.22),
    line_b: Rgba::new(255, 248, 231, 0.10),
    on: color::ON_INK,
    on_soft: Rgb::hex(0xEFE8_D5),
    focus: Rgb::hex(0xF3B4_3A),
    hatch: Rgba::new(8, 30, 22, 0.75),
    glow: Rgba::TRANSPARENT,
};

const MAT_DARK: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0x173A_2E),
    line_a: Rgba::new(255, 248, 231, 0.15),
    line_b: Rgba::new(255, 248, 231, 0.06),
    on: color::ON_INK,
    on_soft: Rgb::hex(0xCFC8_B6),
    focus: Rgb::hex(0xF3B4_3A),
    hatch: Rgba::new(0, 0, 0, 0.75),
    glow: Rgba::TRANSPARENT,
};

const NOTEBOOK_LIGHT: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0xF8F4_E9),
    line_a: Rgba::from_rgb(Rgb::hex(0xE79C_9C), 1.0),
    line_b: Rgba::from_rgb(Rgb::hex(0xBFCD_F0), 1.0),
    on: color::INK,
    on_soft: color::INK_SOFT,
    focus: color::INK,
    hatch: Rgba::from_rgb(color::INK, 1.0),
    glow: Rgba::TRANSPARENT,
};

const NOTEBOOK_DARK: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0x2223_2C),
    line_a: Rgba::new(231, 156, 156, 0.35),
    line_b: Rgba::new(169, 182, 238, 0.16),
    on: color::ON_INK,
    on_soft: Rgb::hex(0xCFC8_B6),
    focus: Rgb::hex(0xF3B4_3A),
    hatch: Rgba::new(255, 248, 231, 0.45),
    glow: Rgba::TRANSPARENT,
};

const KRAFT_LIGHT: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0xC69C_6D),
    line_a: Rgba::new(90, 60, 30, 0.18),
    line_b: Rgba::new(255, 240, 210, 0.14),
    on: Rgb::hex(0x1727_77),
    on_soft: color::INK_TEXT,
    focus: Rgb::hex(0x1727_77),
    hatch: Rgba::new(60, 35, 15, 0.75),
    glow: Rgba::TRANSPARENT,
};

const KRAFT_DARK: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0x4E3A_28),
    line_a: Rgba::new(18, 36, 120, 0.25),
    line_b: Rgba::new(255, 240, 210, 0.05),
    on: color::ON_INK,
    on_soft: Rgb::hex(0xCFC8_B6),
    focus: Rgb::hex(0xF3B4_3A),
    hatch: Rgba::new(0, 0, 0, 0.6),
    glow: Rgba::TRANSPARENT,
};

const RISO_LIGHT: SurfaceMode = SurfaceMode {
    bg: color::BUBBLEGUM,
    line_a: Rgba::new(210, 56, 30, 0.22),
    line_b: Rgba::TRANSPARENT,
    on: Rgb::hex(0x1727_77),
    on_soft: color::INK_TEXT,
    focus: Rgb::hex(0x1727_77),
    hatch: Rgba::from_rgb(color::INK, 1.0),
    glow: Rgba::TRANSPARENT,
};

const RISO_DARK: SurfaceMode = SurfaceMode {
    bg: Rgb::hex(0x4320_3B),
    line_a: Rgba::new(246, 169, 184, 0.16),
    line_b: Rgba::TRANSPARENT,
    on: color::ON_INK,
    on_soft: Rgb::hex(0xCFC8_B6),
    focus: Rgb::hex(0xF3B4_3A),
    hatch: Rgba::new(255, 248, 231, 0.45),
    glow: Rgba::TRANSPARENT,
};

/// Type scale in pixels. Body defaults to 19.
pub const XS: f32 = 13.0;
pub const SM: f32 = 15.0;
pub const MD: f32 = 17.0;
pub const BODY: f32 = 19.0;
pub const LG: f32 = 24.0;
pub const XL: f32 = 32.0;
pub const XXL: f32 = 44.0;
pub const XXXL: f32 = 72.0;

pub const WEIGHT_LOGO: u16 = 900;
pub const WEIGHT_LETTER: u16 = 700;
pub const WEIGHT_HEADING: u16 = 900;
pub const WEIGHT_BODY: u16 = 400;

/// Corner radii: top-left, top-right, bottom-right, bottom-left.
pub const RADIUS_STICKER: [f32; 4] = [26.0, 20.0, 28.0, 18.0];
pub const RADIUS_FACE: [f32; 4] = [20.0, 14.0, 22.0, 13.0];
pub const RADIUS_BOX: [f32; 4] = [14.0, 10.0, 16.0, 11.0];
pub const RADIUS_CUT: [f32; 4] = [34.0, 26.0, 36.0, 24.0];

/// The CSS `--plop-roundness` multiplier. `1` is the default look.
pub const ROUNDNESS: f32 = 1.0;

pub const STROKE: f32 = 3.0;
pub const STROKE_SM: f32 = 2.5;
pub const STROKE_BOLD: f32 = 3.4;
pub const STROKE_ILLUSTRATION: f32 = 7.0;

/// Dash lengths of the crayon hatch, and the offset of its printed shadow.
pub const HATCH_ON: f32 = 2.2;
pub const HATCH_OFF: f32 = 3.4;
pub const HATCH_OFFSET: (f32, f32) = (5.0, 7.0);

/// Sticker layout, from `internal/Sticker.module.css`.
pub const STICKER_PAD: f32 = 7.0;
pub const FACE_PAD_X: f32 = 30.0;
pub const FACE_PAD_Y_TOP: f32 = 15.0;
pub const FACE_PAD_Y_BOTTOM: f32 = 17.0;

// The motion preference lives in its own module but is part of the token
// surface, so it is reachable as `theme::MotionPreference` too.
pub use crate::motion::{duration_ms, motion_reduced, MotionPreference};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::contrast::contrast_ratio;

    #[test]
    fn rgb_hex_round_trip() {
        let ink = Rgb::hex(0x2848_D8);
        assert_eq!(ink, Rgb::new(0x28, 0x48, 0xD8));
        assert_eq!(ink.r, 0x28);
        assert_eq!(ink.g, 0x48);
        assert_eq!(ink.b, 0xD8);
        assert_eq!(ink.to_hex(), "#2848D8");
        assert_eq!(Rgb::new(0, 0, 0).to_hex(), "#000000");
    }

    #[test]
    fn rgba_from_rgb_keeps_channels_and_alpha() {
        let shadow = Rgba::from_rgb(color::INK, 0.2);
        assert_eq!((shadow.r, shadow.g, shadow.b), (40, 72, 216));
        assert_eq!(shadow.a, 0.2);
        assert_eq!(Rgba::TRANSPARENT.a, 0.0);
    }

    #[test]
    fn fill_table_is_complete_and_matches_measured_contrast() {
        assert_eq!(Fill::ALL.len(), 7);
        for fill in Fill::ALL {
            let measured = contrast_ratio(fill.color(), fill.on_fill());
            assert!(
                (measured - fill.on_fill_ratio()).abs() <= 0.15,
                "{fill:?}: token says {}, measured {measured}",
                fill.on_fill_ratio()
            );
            assert!(measured >= 4.5, "{fill:?} does not pass AA");
        }
    }

    #[test]
    fn fill_text_colors_match_the_token_table() {
        assert_eq!(Fill::Ink.on_fill(), color::ON_INK);
        assert_eq!(Fill::Tomato.on_fill(), color::ON_INK);
        assert_eq!(Fill::Periwinkle.on_fill(), color::INK_TEXT);
        assert_eq!(Fill::Mint.on_fill(), color::INK_TEXT);
        assert_eq!(Fill::Mustard.on_fill(), color::INK_TEXT);
        assert_eq!(Fill::Bubblegum.on_fill(), color::INK_TEXT);
        assert_eq!(Fill::Plain.on_fill(), color::INK);
        assert_eq!(Fill::Plain.color(), color::PAPER);
    }

    #[test]
    fn statuses_map_to_the_documented_fills_and_labels() {
        assert_eq!(Status::Critical.fill(), Fill::Tomato);
        assert_eq!(Status::Dispatched.fill(), Fill::Ink);
        assert_eq!(Status::EnRoute.fill(), Fill::Mustard);
        assert_eq!(Status::Resolved.fill(), Fill::Mint);
        assert_eq!(Status::Unassigned.fill(), Fill::Periwinkle);

        assert_eq!(Status::Critical.label(), "Critical");
        assert_eq!(Status::EnRoute.label(), "En route");
        assert_eq!(Status::Unassigned.label(), "Unassigned");
    }

    #[test]
    fn surface_names_and_labels_match_tokens() {
        let labels: Vec<&str> = SurfaceName::ALL.iter().map(|s| s.label()).collect();
        assert_eq!(
            labels,
            ["Poster", "Cutting mat", "Notebook", "Kraft", "Riso"]
        );
    }

    #[test]
    fn every_surface_has_both_modes() {
        for name in SurfaceName::ALL {
            let surface = name.surface(false);
            assert_eq!(surface.label, name.label());
            assert_eq!(surface.light.bg, name.mode(false).bg);
            assert_eq!(surface.dark.bg, name.mode(true).bg);
            assert_ne!(surface.light.bg, surface.dark.bg);
        }
    }

    #[test]
    fn surface_values_are_transcribed_exactly() {
        let poster = SurfaceName::Poster.mode(false);
        assert_eq!(poster.bg, Rgb::hex(0xEEE7_D6));
        assert_eq!(poster.line_a, Rgba::new(40, 72, 216, 0.08));
        assert_eq!(poster.line_b, Rgba::TRANSPARENT);
        assert_eq!(poster.on, color::INK);
        assert_eq!(poster.on_soft, color::INK_SOFT);
        assert_eq!(poster.focus, color::TOMATO);
        assert_eq!(poster.glow, Rgba::new(255, 255, 255, 0.45));

        let mat = SurfaceName::Mat.mode(true);
        assert_eq!(mat.bg, Rgb::hex(0x173A_2E));
        assert_eq!(mat.line_a, Rgba::new(255, 248, 231, 0.15));
        assert_eq!(mat.line_b, Rgba::new(255, 248, 231, 0.06));
        assert_eq!(mat.on, color::ON_INK);
        assert_eq!(mat.hatch, Rgba::new(0, 0, 0, 0.75));

        let notebook = SurfaceName::Notebook.mode(false);
        assert_eq!(notebook.line_a, Rgba::new(231, 156, 156, 1.0));
        assert_eq!(notebook.line_b, Rgba::new(191, 205, 240, 1.0));
        assert_eq!(notebook.glow, Rgba::TRANSPARENT);

        let kraft = SurfaceName::Kraft.mode(false);
        assert_eq!(kraft.on, Rgb::hex(0x1727_77));
        assert_eq!(kraft.on_soft, color::INK_TEXT);
        assert_eq!(kraft.hatch, Rgba::new(60, 35, 15, 0.75));

        let riso = SurfaceName::Riso.mode(true);
        assert_eq!(riso.bg, Rgb::hex(0x4320_3B));
        assert_eq!(riso.on, color::ON_INK);
        assert_eq!(riso.focus, Rgb::hex(0xF3B4_3A));
    }

    #[test]
    fn type_and_stroke_constants_match_tokens() {
        assert_eq!(
            [XS, SM, MD, BODY, LG, XL, XXL, XXXL],
            [13.0, 15.0, 17.0, 19.0, 24.0, 32.0, 44.0, 72.0]
        );
        assert_eq!(
            [WEIGHT_LOGO, WEIGHT_LETTER, WEIGHT_HEADING, WEIGHT_BODY],
            [900, 700, 900, 400]
        );
        assert_eq!(RADIUS_STICKER, [26.0, 20.0, 28.0, 18.0]);
        assert_eq!(RADIUS_FACE, [20.0, 14.0, 22.0, 13.0]);
        assert_eq!(RADIUS_BOX, [14.0, 10.0, 16.0, 11.0]);
        assert_eq!(RADIUS_CUT, [34.0, 26.0, 36.0, 24.0]);
        assert_eq!((STROKE, STROKE_SM, STROKE_BOLD), (3.0, 2.5, 3.4));
        assert_eq!((HATCH_ON, HATCH_OFF, HATCH_OFFSET), (2.2, 3.4, (5.0, 7.0)));
        assert_eq!(
            (STICKER_PAD, FACE_PAD_X, FACE_PAD_Y_TOP, FACE_PAD_Y_BOTTOM),
            (7.0, 30.0, 15.0, 17.0)
        );
    }

    #[test]
    fn theme_reexports_motion_preference() {
        assert!(motion_reduced(MotionPreference::Always, false));
        assert!(!motion_reduced(MotionPreference::Never, true));
        assert_eq!(duration_ms(MotionPreference::Always, false, 500), 0);
    }
}
