//! The hand-drawn icon set, painted as sampled polylines.
//!
//! The browser kit draws these as SVG paths. The path data is transcribed
//! unchanged and `plopui_core::svg` samples it into contours, so the marker
//! line stays the same without an SVG runtime.

use gpui_kit::prelude::*;
use gpui_kit::{App, Bounds, IntoElement, Pixels, RenderOnce, Window, canvas, div, px};
use plopui_core::geometry::{Contour, Point};
use plopui_core::svg;
use plopui_core::theme::{Rgb, color};

use crate::color::to_rgba;
use crate::paint::{bounds_rect, fill_contour, stroke_contour};
use crate::theme::PlopTheme;

/// Every icon the kit ships. Names match the React exports.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum IconKind {
    Plus,
    Close,
    Pin,
    Phone,
    Bell,
    Check,
    Copy,
    Link,
    Search,
    ArrowDown,
    ArrowRight,
    External,
    Menu,
    Haptics,
    Sound,
    Paper,
    CuttingMat,
    Info,
    Warn,
    Error,
    Success,
    More,
    Edit,
    Trash,
}

impl IconKind {
    pub const ALL: [IconKind; 24] = [
        Self::Plus,
        Self::Close,
        Self::Pin,
        Self::Phone,
        Self::Bell,
        Self::Check,
        Self::Copy,
        Self::Link,
        Self::Search,
        Self::ArrowDown,
        Self::ArrowRight,
        Self::External,
        Self::Menu,
        Self::Haptics,
        Self::Sound,
        Self::Paper,
        Self::CuttingMat,
        Self::Info,
        Self::Warn,
        Self::Error,
        Self::Success,
        Self::More,
        Self::Edit,
        Self::Trash,
    ];

    /// The icon's name, for a label or a debugging read-out.
    pub fn label(self) -> &'static str {
        match self {
            Self::Plus => "plus",
            Self::Close => "close",
            Self::Pin => "pin",
            Self::Phone => "phone",
            Self::Bell => "bell",
            Self::Check => "check",
            Self::Copy => "copy",
            Self::Link => "link",
            Self::Search => "search",
            Self::ArrowDown => "arrow down",
            Self::ArrowRight => "arrow right",
            Self::External => "external",
            Self::Menu => "menu",
            Self::Haptics => "haptics",
            Self::Sound => "sound",
            Self::Paper => "paper",
            Self::CuttingMat => "cutting mat",
            Self::Info => "info",
            Self::Warn => "warning",
            Self::Error => "error",
            Self::Success => "success",
            Self::More => "more",
            Self::Edit => "edit",
            Self::Trash => "delete",
        }
    }
}

struct PathSpec {
    d: &'static str,
    width: f32,
}

struct IconSpec {
    view_box: f32,
    /// `(cx, cy, r, filled)`.
    circles: Vec<(f32, f32, f32, bool)>,
    paths: Vec<PathSpec>,
}

const fn path(d: &'static str, width: f32) -> PathSpec {
    PathSpec { d, width }
}

fn spec(view_box: f32, paths: Vec<PathSpec>, circles: Vec<(f32, f32, f32, bool)>) -> IconSpec {
    IconSpec {
        view_box,
        circles,
        paths,
    }
}

fn icon_spec(kind: IconKind, off: bool) -> IconSpec {
    match kind {
        IconKind::Plus => spec(
            26.0,
            vec![path(
                "M13 4 C 12.5 10, 13.5 16, 13 22 M4 13.5 C 10 12.5, 16 13.5, 22 12.8",
                3.2,
            )],
            vec![],
        ),
        IconKind::Close => spec(
            24.0,
            vec![path(
                "M5 5 C 10 10, 14 14, 19 19 M19 5 C 14 10, 10 14, 5 19",
                3.0,
            )],
            vec![],
        ),
        IconKind::Pin => spec(
            24.0,
            vec![path(
                "M12 21 C 7 15, 5 12, 5 9 C 5 5, 8 3, 12 3 C 16 3, 19 5.5, 19 9 C 19 12, 17 15, 12 21 Z",
                2.8,
            )],
            vec![(12.0, 9.0, 2.4, true)],
        ),
        IconKind::Phone => spec(
            24.0,
            vec![path(
                "M6 3 L 9 3 L 10.5 7.5 L 8.5 9 C 9.5 11.5, 12.5 14.5, 15 15.5 L 16.5 13.5 L 21 15 L 21 18 C 21 19.5, 19.5 21, 18 21 C 10 20.5, 3.5 14, 3 6 C 3 4.5, 4.5 3, 6 3 Z",
                2.8,
            )],
            vec![],
        ),
        IconKind::Bell => spec(
            24.0,
            vec![path(
                "M6 17 C 6.5 14, 6 11, 6.5 9 C 7 5.5, 9.5 4, 12 4 C 14.5 4, 17 5.5, 17.5 9 C 18 11, 17.5 14, 18 17 Z M4 17.2 L 20 16.8 M10 20 C 11 21.2, 13 21.2, 14 20",
                2.8,
            )],
            vec![],
        ),
        IconKind::Check => spec(
            24.0,
            vec![path(
                "M4 13 C 6.5 14.5, 8 17, 9 19.5 C 12 12, 15.5 7, 21 3.5",
                3.2,
            )],
            vec![],
        ),
        IconKind::Copy => spec(
            24.0,
            vec![
                path(
                    "M9.2 8.6 C 12.8 8.2, 16.4 8.3, 20.2 8.9 C 20.7 12.6, 20.6 16.6, 20.1 20.4 C 16.4 20.9, 12.8 20.8, 9.1 20.3 C 8.7 16.4, 8.7 12.5, 9.2 8.6 Z",
                    2.6,
                ),
                path(
                    "M15.4 5.2 C 15.2 4.4, 14.8 3.9, 14 3.8 C 10.7 3.4, 7.3 3.5, 4.4 4 C 3.8 7.6, 3.7 11.3, 4.1 14.9 C 4.3 15.6, 4.9 15.9, 5.6 15.9",
                    2.6,
                ),
            ],
            vec![],
        ),
        IconKind::Link => spec(
            24.0,
            vec![
                path(
                    "M10.4 13.6 C 11.6 15, 13.6 15.1, 15 13.8 L 18.6 10.2 C 20 8.7, 19.9 6.5, 18.5 5.2 C 17.1 3.9, 15.1 3.9, 13.7 5.2 L 12.4 6.6",
                    2.8,
                ),
                path(
                    "M13.6 10.4 C 12.4 9, 10.4 8.9, 9 10.2 L 5.4 13.8 C 4 15.3, 4.1 17.5, 5.5 18.8 C 6.9 20.1, 8.9 20.1, 10.3 18.8 L 11.6 17.4",
                    2.8,
                ),
            ],
            vec![],
        ),
        IconKind::Search => spec(
            24.0,
            vec![
                path(
                    "M10.6 3.8 C 14.6 3.6, 17.4 6.4, 17.2 10.4 C 17 14.2, 14.2 16.9, 10.4 16.8 C 6.6 16.7, 3.9 14, 4 10.2 C 4.1 6.6, 6.8 3.9, 10.6 3.8 Z",
                    2.8,
                ),
                path("M15.4 15.6 C 17.2 17.2, 18.8 18.8, 20.6 20.8", 3.2),
            ],
            vec![],
        ),
        IconKind::ArrowDown => spec(
            24.0,
            vec![path(
                "M12 3.6 C 11.6 8.6, 12.4 13.6, 12 19.4 M6.2 13.8 C 8.4 15.6, 10.2 17.4, 12 19.6 C 13.8 17.4, 15.6 15.6, 17.8 13.6",
                2.8,
            )],
            vec![],
        ),
        IconKind::ArrowRight => spec(
            24.0,
            vec![path(
                "M3.6 12.2 C 8.6 11.6, 13.6 12.4, 19.4 12 M13.8 6.2 C 15.6 8.4, 17.4 10.2, 19.6 12 C 17.4 13.8, 15.6 15.6, 13.6 17.8",
                2.8,
            )],
            vec![],
        ),
        IconKind::External => spec(
            24.0,
            vec![
                path(
                    "M11 4.6 C 8.6 4.4, 6.4 4.5, 4.6 4.8 C 4.2 9.4, 4.3 14.6, 4.8 19.4 C 9.4 19.8, 14.6 19.7, 19.2 19.3 C 19.6 17.4, 19.6 15.2, 19.4 13",
                    2.8,
                ),
                path(
                    "M11.4 12.6 C 14.2 9.8, 17 7, 19.8 4.2 M14.4 4 C 16.2 4.2, 18.2 4.1, 20 4 C 20.1 5.8, 20 7.8, 19.8 9.6",
                    2.8,
                ),
            ],
            vec![],
        ),
        IconKind::Menu => spec(
            24.0,
            vec![path(
                "M4 6.4 C 9.4 5.8, 14.6 6.6, 20 6 M4.2 12.2 C 9.6 11.8, 14.4 12.6, 19.6 12 M4 18 C 8.6 17.6, 12.4 18.4, 16.8 17.8",
                2.8,
            )],
            vec![],
        ),
        IconKind::Haptics => spec(
            24.0,
            vec![
                path(
                    "M8.5 4.2 C 11 3.8, 13.5 3.9, 15.6 4.3 C 16.1 9, 16 15, 15.6 19.8 C 13.2 20.2, 10.8 20.1, 8.4 19.8 C 8 15, 8 9, 8.5 4.2 Z",
                    2.6,
                ),
                path("M11 17 L 13 17", 2.2),
                if off {
                    path("M4 4 C 9.4 9.2, 14.6 14.6, 20 20", 2.6)
                } else {
                    path(
                        "M4.6 8.5 C 3.6 10.5, 3.6 13.5, 4.6 15.5 M19.4 8.5 C 20.4 10.5, 20.4 13.5, 19.4 15.5",
                        2.2,
                    )
                },
            ],
            vec![],
        ),
        IconKind::Sound => spec(
            24.0,
            vec![
                path(
                    "M3.8 9.6 C 5 9.4, 6.4 9.4, 7.6 9.5 L 12.2 5.4 C 12.6 9.8, 12.6 14.4, 12.2 18.6 L 7.6 14.6 C 6.3 14.7, 5 14.6, 3.8 14.4 C 3.6 12.8, 3.6 11.2, 3.8 9.6 Z",
                    2.6,
                ),
                if off {
                    path("M15.5 9.5 L 20.5 14.5 M20.5 9.5 L 15.5 14.5", 2.6)
                } else {
                    path(
                        "M15.6 9.4 C 16.6 10.9, 16.6 13.1, 15.6 14.6 M18.4 7 C 20.4 9.8, 20.4 14.2, 18.4 17",
                        2.2,
                    )
                },
            ],
            vec![],
        ),
        IconKind::Paper => spec(
            24.0,
            vec![
                path(
                    "M6 3.6 C 9 3.3, 11.8 3.4, 14.4 3.6 L 18.6 7.8 C 18.9 11.8, 18.8 16.4, 18.4 20.4 C 14.4 20.8, 10 20.7, 6 20.4 C 5.6 14.8, 5.6 9.2, 6 3.6 Z",
                    2.6,
                ),
                path(
                    "M14.2 3.8 C 14 5.4, 14.2 7, 14.4 8.2 C 15.8 8.2, 17.2 8.1, 18.4 7.9",
                    2.2,
                ),
                path(
                    "M8.8 12.2 C 10.8 12, 13 12.3, 15.4 12 M8.8 16 C 10.4 15.8, 11.8 16.1, 13.2 15.9",
                    2.0,
                ),
            ],
            vec![],
        ),
        IconKind::CuttingMat => spec(
            24.0,
            vec![
                path(
                    "M3.6 5.4 C 9.2 5, 14.8 5.1, 20.4 5.4 C 20.8 9.6, 20.7 14.2, 20.4 18.6 C 14.8 19, 9.2 18.9, 3.6 18.6 C 3.2 14.2, 3.3 9.6, 3.6 5.4 Z",
                    2.6,
                ),
                path(
                    "M8.4 5.6 L 8.4 18.4 M13.2 5.6 L 13.2 18.4 M3.8 10.2 L 20.2 10.2 M3.8 14.4 L 20.2 14.4",
                    1.4,
                ),
                path(
                    "M9.6 21.4 C 12.6 17.6, 15.8 13.8, 19 10.2 L 21.2 8.4 C 21.4 9.4, 21 10.6, 20.2 11.4",
                    2.4,
                ),
            ],
            vec![],
        ),
        // Status icons are painted with their own fills below.
        IconKind::Info | IconKind::Warn | IconKind::Error | IconKind::Success => {
            spec(32.0, vec![], vec![])
        }
        IconKind::More => spec(
            24.0,
            vec![],
            vec![
                (5.0, 12.0, 2.4, true),
                (12.0, 12.5, 2.4, true),
                (19.0, 11.5, 2.4, true),
            ],
        ),
        IconKind::Edit => spec(
            24.0,
            vec![path(
                "M4 20 L 5 15.5 L 16 4.5 L 19.5 8 L 8.5 19 Z M14 6.5 L 17.5 10",
                2.4,
            )],
            vec![],
        ),
        IconKind::Trash => spec(
            24.0,
            vec![path(
                "M4 7 L 20 7 M9 7 L 9.5 4 L 14.5 4 L 15 7 M6 7 L 7 20 L 17 20 L 18 7 M10 11 L 10.3 16.5 M14 11 L 13.7 16.5",
                2.4,
            )],
            vec![],
        ),
    }
}

/// A hand-drawn icon from the kit, painted at `size` square.
#[derive(IntoElement)]
pub struct PlopIcon {
    kind: IconKind,
    size: f32,
    theme: PlopTheme,
    color: Option<Rgb>,
    off: bool,
}

impl PlopIcon {
    pub fn new(kind: IconKind, theme: PlopTheme) -> Self {
        Self {
            kind,
            size: 20.0,
            theme,
            color: None,
            off: false,
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    /// Override the ink. Defaults to the surface's text color.
    pub fn color(mut self, color: Rgb) -> Self {
        self.color = Some(color);
        self
    }

    /// The muted variant of `Haptics` and `Sound`.
    pub fn off(mut self, off: bool) -> Self {
        self.off = off;
        self
    }
}

impl RenderOnce for PlopIcon {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let color = self.color.unwrap_or(self.theme.mode().on);
        let kind = self.kind;
        let off = self.off;
        div().relative().size(px(self.size)).flex_shrink_0().child(
            canvas(
                |bounds, _, _| bounds,
                move |bounds, _, window, _| {
                    paint_icon(window, bounds, kind, off, color);
                },
            )
            .absolute()
            .inset_0(),
        )
    }
}

fn paint_icon(window: &mut Window, bounds: Bounds<Pixels>, kind: IconKind, off: bool, color: Rgb) {
    let rect = bounds_rect(bounds);
    let icon = icon_spec(kind, off);
    let scale = rect.w.min(rect.h) / icon.view_box;
    let origin_x = rect.x + (rect.w - icon.view_box * scale) * 0.5;
    let origin_y = rect.y + (rect.h - icon.view_box * scale) * 0.5;
    let map = |contour: Contour| {
        Contour::new(
            contour
                .points
                .iter()
                .map(|point| Point::new(origin_x + point.x * scale, origin_y + point.y * scale))
                .collect(),
            contour.closed,
        )
    };

    if matches!(
        kind,
        IconKind::Info | IconKind::Warn | IconKind::Error | IconKind::Success
    ) {
        paint_status_icon(window, kind, &map, scale, origin_x, origin_y);
        return;
    }

    for path in icon.paths {
        for contour in svg::parse_path(path.d) {
            stroke_contour(
                window,
                &map(contour),
                path.width * scale,
                to_rgba(color),
                None,
            );
        }
    }
    for &(cx, cy, r, filled) in &icon.circles {
        let contour = svg::circle_contour(origin_x + cx * scale, origin_y + cy * scale, r * scale);
        if filled {
            fill_contour(window, &contour, to_rgba(color));
        } else {
            stroke_contour(window, &contour, 2.4 * scale, to_rgba(color), None);
        }
    }
}

fn paint_status_icon(
    window: &mut Window,
    kind: IconKind,
    map: &impl Fn(Contour) -> Contour,
    scale: f32,
    origin_x: f32,
    origin_y: f32,
) {
    const BLOB: &str =
        "M16 3 C 24 3, 29 8, 29 16 C 29 24, 24 29, 16 29 C 8 29, 3 24, 3 16 C 3 8.5, 8 3, 16 3 Z";
    const WARN: &str =
        "M16 3.5 C 17 3.5, 29 26, 28.5 27.5 C 28 28.5, 4 28.5, 3.5 27.5 C 3 26, 15 3.5, 16 3.5 Z";

    let ink = to_rgba(color::INK);
    let paper = to_rgba(color::PAPER);
    let stroke = |window: &mut Window, d: &str, width: f32, color| {
        for contour in svg::parse_path(d) {
            stroke_contour(window, &map(contour), width * scale, color, None);
        }
    };
    let circle = |window: &mut Window, cx: f32, cy: f32, r: f32, color| {
        let contour = svg::circle_contour(origin_x + cx * scale, origin_y + cy * scale, r * scale);
        fill_contour(window, &contour, color);
    };

    match kind {
        IconKind::Info => {
            for contour in svg::parse_path(BLOB) {
                fill_contour(window, &map(contour.clone()), paper);
                stroke_contour(window, &map(contour), 2.6 * scale, ink, None);
            }
            circle(window, 16.0, 10.0, 2.2, ink);
            stroke(
                window,
                "M14 15 L 16.5 14.5 L 16 23 M13.5 23.2 L 19 22.8",
                2.6,
                ink,
            );
        }
        IconKind::Warn => {
            for contour in svg::parse_path(WARN) {
                fill_contour(window, &map(contour.clone()), paper);
                stroke_contour(window, &map(contour), 2.6 * scale, ink, None);
            }
            stroke(window, "M16 11 C 15.6 15, 16.3 17.5, 16 20", 3.0, ink);
            circle(window, 16.0, 24.0, 1.9, ink);
        }
        IconKind::Error => {
            for contour in svg::parse_path(BLOB) {
                fill_contour(window, &map(contour.clone()), to_rgba(color::TOMATO));
                stroke_contour(window, &map(contour), 2.6 * scale, ink, None);
            }
            stroke(window, "M16 8.5 C 15.6 13, 16.3 16, 16 19", 3.2, paper);
            circle(window, 16.0, 23.5, 2.0, paper);
        }
        IconKind::Success => {
            for contour in svg::parse_path(BLOB) {
                fill_contour(window, &map(contour.clone()), paper);
                stroke_contour(window, &map(contour), 2.6 * scale, ink, None);
            }
            stroke(
                window,
                "M9 17 C 11 18.5, 12.5 20.5, 13.5 22.5 C 16 16, 19.5 11, 25 7",
                3.4,
                to_rgba(color::LEAF),
            );
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_icon_has_drawable_geometry() {
        for kind in IconKind::ALL {
            let icon = icon_spec(kind, false);
            let has_path = icon
                .paths
                .iter()
                .any(|path| !svg::parse_path(path.d).is_empty());
            let has_circle = !icon.circles.is_empty();
            let is_status = matches!(
                kind,
                IconKind::Info | IconKind::Warn | IconKind::Error | IconKind::Success
            );
            assert!(
                has_path || has_circle || is_status,
                "{} has nothing to draw",
                kind.label()
            );
        }
    }

    #[test]
    fn every_path_parses_inside_its_view_box() {
        for kind in IconKind::ALL {
            let icon = icon_spec(kind, false);
            for path in icon.paths {
                for contour in svg::parse_path(path.d) {
                    for point in &contour.points {
                        assert!(
                            (-2.0..=icon.view_box + 2.0).contains(&point.x)
                                && (-2.0..=icon.view_box + 2.0).contains(&point.y),
                            "{} escapes its view box at {:?}",
                            kind.label(),
                            point
                        );
                    }
                }
            }
        }
    }
}
