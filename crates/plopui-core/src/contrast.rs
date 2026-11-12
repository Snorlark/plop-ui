//! WCAG contrast helpers, ported from `packages/react/src/contrast.ts`.
//!
//! `on_color` answers the runtime question: a client's brand color or a
//! custom tag needs text, and deep ink or cream is chosen by measurement.

pub use crate::theme::Rgb;

/// Deep text ink: `--plop-ink-text`.
pub const DEEP_INK: Rgb = crate::theme::color::INK_TEXT;
/// Cream: `--plop-on-ink`.
pub const CREAM: Rgb = crate::theme::color::ON_INK;

/// Parses `#rgb`, `#rrggbb` or `#rrggbbaa`.
///
/// The alpha byte is accepted and discarded, exactly like the TypeScript
/// helper: contrast is measured on the opaque channels.
pub fn parse_hex_color(input: &str) -> Option<Rgb> {
    let hex = input.trim().strip_prefix('#')?;
    match hex.len() {
        3 => {
            let mut channels = [0u8; 3];
            for (index, channel) in channels.iter_mut().enumerate() {
                let digit = hex.as_bytes().get(index)?;
                let value = (*digit as char).to_digit(16)? as u8;
                *channel = value * 17;
            }
            Some(Rgb::new(channels[0], channels[1], channels[2]))
        }
        6 | 8 => {
            let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
            let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
            let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
            Some(Rgb::new(r, g, b))
        }
        _ => None,
    }
}

/// Relative luminance (WCAG 2.x).
pub fn luminance(color: Rgb) -> f64 {
    fn channel(value: u8) -> f64 {
        let c = f64::from(value) / 255.0;
        if c <= 0.039_28 {
            c / 12.92
        } else {
            ((c + 0.055) / 1.055).powf(2.4)
        }
    }

    0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}

/// Contrast ratio between two colors, from 1 to 21.
pub fn contrast_ratio(a: Rgb, b: Rgb) -> f64 {
    let la = luminance(a);
    let lb = luminance(b);
    (la.max(lb) + 0.05) / (la.min(lb) + 0.05)
}

/// The result of choosing a text color for an arbitrary background.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct OnColor {
    /// The text color to use on the background.
    pub color: Rgb,
    /// Its contrast ratio against that background.
    pub ratio: f64,
    /// Whether the ratio passes WCAG AA for normal text (4.5:1).
    pub passes_aa: bool,
}

/// Chooses deep ink or cream, whichever contrasts more with `bg`.
///
/// Ties go to deep ink, matching the TypeScript `darkRatio >= lightRatio`
/// comparison.
pub fn on_color(bg: Rgb) -> OnColor {
    let dark_ratio = contrast_ratio(DEEP_INK, bg);
    let light_ratio = contrast_ratio(CREAM, bg);
    let (color, ratio) = if dark_ratio >= light_ratio {
        (DEEP_INK, dark_ratio)
    } else {
        (CREAM, light_ratio)
    };
    OnColor {
        color,
        ratio,
        passes_aa: ratio >= 4.5,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::theme::{color, Fill};

    #[test]
    fn parses_three_six_and_eight_digit_hex() {
        assert_eq!(parse_hex_color("#fff"), Some(Rgb::new(255, 255, 255)));
        assert_eq!(parse_hex_color("#2848d8"), Some(color::INK));
        assert_eq!(parse_hex_color("#2848D8FF"), Some(color::INK));
        assert_eq!(
            parse_hex_color("  #FFFFFF  "),
            Some(Rgb::new(255, 255, 255))
        );
        assert_eq!(parse_hex_color("#123"), Some(Rgb::new(17, 34, 51)));
    }

    #[test]
    fn rejects_malformed_hex() {
        assert_eq!(parse_hex_color("2848d8"), None);
        assert_eq!(parse_hex_color("#12"), None);
        assert_eq!(parse_hex_color("#12345"), None);
        assert_eq!(parse_hex_color("#gggggg"), None);
        assert_eq!(parse_hex_color("#1234567"), None);
        assert_eq!(parse_hex_color(""), None);
    }

    #[test]
    fn luminance_matches_wcag_endpoints() {
        assert_eq!(luminance(Rgb::new(0, 0, 0)), 0.0);
        assert!((luminance(Rgb::new(255, 255, 255)) - 1.0).abs() < 1e-12);
    }

    #[test]
    fn black_on_white_is_twenty_one_to_one() {
        let ratio = contrast_ratio(Rgb::new(0, 0, 0), Rgb::new(255, 255, 255));
        assert!((ratio - 21.0).abs() < 1e-12);
        assert!((contrast_ratio(color::INK, color::INK) - 1.0).abs() < 1e-12);
    }

    #[test]
    fn token_on_fill_ratios_are_measured_correctly() {
        for fill in Fill::ALL {
            let measured = contrast_ratio(fill.color(), fill.on_fill());
            assert!(
                (measured - fill.on_fill_ratio()).abs() <= 0.15,
                "{fill:?}: token {}, measured {measured}",
                fill.on_fill_ratio()
            );
        }
    }

    #[test]
    fn tomato_gets_cream_and_passes_aa() {
        let result = on_color(color::TOMATO);
        assert_eq!(result.color, CREAM);
        assert!(result.ratio > 4.5);
        assert!(result.passes_aa);
    }

    #[test]
    fn light_backgrounds_get_deep_ink() {
        let result = on_color(color::PAPER);
        assert_eq!(result.color, DEEP_INK);
        assert!(result.passes_aa);
    }

    #[test]
    fn brand_color_picks_the_higher_ratio() {
        let mustard = on_color(color::MUSTARD);
        assert_eq!(mustard.color, DEEP_INK);
        assert!(mustard.passes_aa);
    }
}
