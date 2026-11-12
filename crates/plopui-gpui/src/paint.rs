//! Deterministic hand-drawn painting for GPUI.
//!
//! Every contour is a polyline generated from a stable seed; no randomness is
//! read at paint time. This is a geometric approximation of PlopUI's CSS/SVG
//! look, not a port of the browser filters.

use gpui_kit::Rgba as GpuiRgba;
use gpui_kit::*;
use plopui_core::geometry::{
    Contour, Point as GPoint, Rect as GRect, hatch_lines, offset_contour, rotate_contour,
    wobbly_circle, wobbly_rect,
};
use plopui_core::theme::{
    self, Fill, RADIUS_BOX, RADIUS_CUT, RADIUS_FACE, RADIUS_STICKER, Rgb, Rgba, STROKE,
    SurfaceMode, SurfaceName,
};

use crate::color::{alpha_rgba, to_hsla, to_rgba};

pub fn bounds_rect(bounds: Bounds<Pixels>) -> GRect {
    GRect {
        x: f32::from(bounds.origin.x),
        y: f32::from(bounds.origin.y),
        w: f32::from(bounds.size.width),
        h: f32::from(bounds.size.height),
    }
}

pub fn scale_radii(radii: [f32; 4], factor: f32) -> [f32; 4] {
    radii.map(|r| r * factor)
}

fn build_contour(contour: &Contour, builder: PathBuilder) -> Option<Path<Pixels>> {
    let first = contour.points.first()?;
    let mut builder = builder;
    builder.move_to(point(px(first.x), px(first.y)));
    for p in &contour.points[1..] {
        builder.line_to(point(px(p.x), px(p.y)));
    }
    builder.close();
    builder.build().ok()
}

pub fn fill_contour(window: &mut Window, contour: &Contour, color: GpuiRgba) {
    if contour.points.len() < 3 {
        return;
    }
    if let Some(path) = build_contour(contour, PathBuilder::fill()) {
        window.paint_path(path, color);
    }
}

pub fn stroke_contour(
    window: &mut Window,
    contour: &Contour,
    width: f32,
    color: GpuiRgba,
    dash: Option<[f32; 2]>,
) {
    if contour.points.len() < 2 {
        return;
    }
    let mut builder = PathBuilder::stroke(px(width));
    if let Some([on, off]) = dash {
        builder = builder.dash_array(&[px(on), px(off)]);
    }
    if let Some(path) = build_contour(contour, builder) {
        window.paint_path(path, color);
    }
}

fn stroke_polyline(window: &mut Window, points: &[GPoint], width: f32, color: GpuiRgba) {
    if points.len() < 2 {
        return;
    }
    let mut builder = PathBuilder::stroke(px(width));
    builder.move_to(point(px(points[0].x), px(points[0].y)));
    for p in &points[1..] {
        builder.line_to(point(px(p.x), px(p.y)));
    }
    if let Ok(path) = builder.build() {
        window.paint_path(path, color);
    }
}

fn line(window: &mut Window, a: GPoint, b: GPoint, width: f32, color: GpuiRgba) {
    stroke_polyline(window, &[a, b], width, color);
}

fn rect_inset(rect: GRect, d: f32) -> GRect {
    GRect {
        x: rect.x + d,
        y: rect.y + d,
        w: (rect.w - d * 2.0).max(1.0),
        h: (rect.h - d * 2.0).max(1.0),
    }
}

fn rect_expand(rect: GRect, d: f32) -> GRect {
    rect_inset(rect, -d)
}

fn jittered(rect: GRect, radii: [f32; 4], seed: &str, jitter: f32, segments: usize) -> Contour {
    wobbly_rect(rect, radii, seed, jitter, segments)
}

/// Specification for the die-cut sticker behind buttons.
#[derive(Clone)]
pub struct StickerSpec {
    pub seed: SharedString,
    pub fill: Fill,
    pub focus_color: Rgb,
    pub focused: bool,
    pub disabled: bool,
    pub flat: bool,
}

pub fn paint_sticker(window: &mut Window, bounds: Bounds<Pixels>, spec: &StickerSpec) {
    let bounds = bounds_rect(bounds);
    if bounds.w < 24.0 || bounds.h < 18.0 {
        return;
    }
    let rect = rect_inset(bounds, 9.0);
    let seed = spec.seed.as_ref();
    let tilt = plopui_core::seed::seeded_tilt(seed, 2.5);
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };

    let outer = rotate_contour(
        &jittered(rect, scale_radii(RADIUS_STICKER, 0.72), seed, 1.1, 5),
        center,
        tilt,
    );

    if !spec.flat {
        let shadow = offset_contour(&outer, 5.0, 7.0);
        fill_contour(window, &shadow, alpha_rgba(theme::color::SHADOW_STRONG));
    }

    fill_contour(window, &outer, to_rgba(theme::color::PAPER));

    let face_rect = rect_inset(rect, 7.0);
    let face_seed = format!("{seed}-face");
    let face = offset_contour(
        &rotate_contour(
            &jittered(
                face_rect,
                scale_radii(RADIUS_FACE, 0.75),
                &face_seed,
                0.9,
                4,
            ),
            center,
            tilt,
        ),
        2.5,
        2.0,
    );

    let fill_color = if spec.disabled {
        alpha_rgba(Rgba::from_rgb(spec.fill.color(), 0.55))
    } else {
        to_rgba(spec.fill.color())
    };
    fill_contour(window, &face, fill_color);

    let ink = if spec.disabled {
        alpha_rgba(Rgba::from_rgb(theme::color::INK, 0.5))
    } else {
        to_rgba(theme::color::INK)
    };
    stroke_contour(window, &outer, STROKE + 0.4, ink, None);

    // The second, slightly rotated ink line that makes the border look printed twice.
    let ghost_seed = format!("{seed}-ghost");
    let ghost = rotate_contour(
        &jittered(
            rect_expand(rect, 3.0),
            scale_radii(RADIUS_CUT, 0.62),
            &ghost_seed,
            1.4,
            3,
        ),
        center,
        tilt + 0.8,
    );
    stroke_contour(
        window,
        &ghost,
        1.5,
        alpha_rgba(Rgba::from_rgb(theme::color::INK, 0.45)),
        None,
    );

    if spec.focused {
        let ring_seed = format!("{seed}-ring");
        let ring = rotate_contour(
            &jittered(
                rect_expand(rect, 9.0),
                scale_radii(RADIUS_CUT, 0.85),
                &ring_seed,
                0.7,
                3,
            ),
            center,
            tilt,
        );
        stroke_contour(
            window,
            &ring,
            2.5,
            to_rgba(spec.focus_color),
            Some([8.0, 6.0]),
        );
    }
}

/// A small torn-paper tag.
pub fn paint_tag(window: &mut Window, bounds: Bounds<Pixels>, seed: &str, fill: Fill, dark: bool) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 3.0);
    let tilt = plopui_core::seed::seeded_tilt(seed, 3.0);
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let radii = [7.0, 5.0, 8.0, 4.0];
    let contour = rotate_contour(&jittered(rect, radii, seed, 0.8, 3), center, tilt);
    fill_contour(window, &contour, to_rgba(fill.color()));
    stroke_contour(
        window,
        &contour,
        2.5,
        to_rgba(if dark {
            theme::color::PAPER
        } else {
            theme::color::INK
        }),
        None,
    );
}

/// A ruled paper card with optional tape.
pub fn paint_paper_card(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    seed: &str,
    mode: SurfaceMode,
    tape: bool,
) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 14.0);
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let tilt = plopui_core::seed::seeded_tilt(seed, 0.8);
    let shadow = offset_contour(
        &rotate_contour(
            &jittered(rect, [14.0, 18.0, 11.0, 20.0], seed, 1.2, 6),
            center,
            tilt,
        ),
        7.0,
        9.0,
    );
    fill_contour(window, &shadow, alpha_rgba(theme::color::SHADOW));

    let paper_seed = format!("{seed}-paper");
    let paper = rotate_contour(
        &jittered(rect, [14.0, 18.0, 11.0, 20.0], &paper_seed, 1.0, 6),
        center,
        tilt,
    );
    fill_contour(window, &paper, to_rgba(theme::color::SHEET));
    stroke_contour(window, &paper, 2.5, to_rgba(theme::color::INK), None);

    if tape {
        let tape_color = alpha_rgba(Rgba::from_rgb(theme::color::MUSTARD, 0.9));
        for (offset_x, angle, idx) in [(-0.31, -7.0, 0usize), (0.31, 6.0, 1)] {
            let tape_rect = GRect {
                x: center.x + rect.w * offset_x - 48.0,
                y: rect.y - 13.0,
                w: 96.0,
                h: 26.0,
            };
            let tape_seed = format!("{seed}-tape-{idx}");
            let tape_contour = rotate_contour(
                &jittered(tape_rect, [2.0; 4], &tape_seed, 0.7, 2),
                GPoint {
                    x: tape_rect.x + 48.0,
                    y: tape_rect.y + 13.0,
                },
                angle,
            );
            fill_contour(window, &tape_contour, tape_color);
            stroke_contour(
                window,
                &tape_contour,
                1.0,
                alpha_rgba(Rgba::from_rgb(theme::color::INK, 0.18)),
                None,
            );
        }
    }

    let _ = mode;
}

/// A callout block: flat fill, wobbly ink outline.
pub fn paint_callout(window: &mut Window, bounds: Bounds<Pixels>, seed: &str, fill: Fill) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 8.0);
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let tilt = -0.5 + plopui_core::seed::seeded_tilt(seed, 0.5);
    let contour = rotate_contour(
        &jittered(rect, [10.0, 8.0, 12.0, 9.0], seed, 1.0, 5),
        center,
        tilt,
    );
    fill_contour(window, &contour, to_rgba(fill.color()));
    stroke_contour(window, &contour, 3.0, to_rgba(theme::color::INK), None);
}

/// The progress track and its hatched fill.
pub fn paint_progress(window: &mut Window, bounds: Bounds<Pixels>, ratio: f32, fill: Fill) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 4.0);
    let track = jittered(rect, [15.0, 12.0, 14.0, 11.0], "progress-track", 0.7, 4);
    fill_contour(window, &track, to_rgba(theme::color::PAPER));
    stroke_contour(window, &track, 2.5, to_rgba(theme::color::INK), None);

    let ratio = ratio.clamp(0.0, 1.0);
    let fill_rect = GRect {
        x: rect.x + 4.0,
        y: rect.y + 4.0,
        w: ((rect.w - 8.0) * ratio).max(0.0),
        h: (rect.h - 8.0).max(0.0),
    };
    if fill_rect.w > 1.0 {
        let fill_contour_shape =
            jittered(fill_rect, [11.0, 9.0, 10.0, 8.0], "progress-fill", 0.6, 3);
        fill_contour(window, &fill_contour_shape, to_rgba(fill.color()));
        let hatch = hatch_lines(fill_rect, 8.0, (0.0, 0.0));
        for (a, b) in hatch {
            line(
                window,
                a,
                b,
                2.0,
                alpha_rgba(Rgba::from_rgb(theme::color::INK, 0.22)),
            );
        }
    }
}

pub fn paint_skeleton(window: &mut Window, bounds: Bounds<Pixels>, seed: &str, color: Rgb) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 3.0);
    let contour = jittered(rect, [6.0; 4], seed, 0.8, 3);
    fill_contour(window, &contour, alpha_rgba(Rgba::from_rgb(color, 0.11)));
    stroke_contour(
        window,
        &contour,
        1.0,
        alpha_rgba(Rgba::from_rgb(color, 0.12)),
        Some([5.0, 6.0]),
    );
}

pub fn paint_dot(window: &mut Window, bounds: Bounds<Pixels>, color: Rgb, seed: &str) {
    let bounds = bounds_rect(bounds);
    let radius = bounds.w.min(bounds.h) * 0.5 - 3.0;
    let center = GPoint {
        x: bounds.x + bounds.w * 0.5,
        y: bounds.y + bounds.h * 0.5,
    };
    let dot = wobbly_circle(center, radius, seed, 0.5, 18);
    fill_contour(window, &dot, to_rgba(color));
    stroke_contour(window, &dot, 2.5, to_rgba(theme::color::INK), None);
}

pub fn paint_avatar(window: &mut Window, bounds: Bounds<Pixels>, fill: Fill, seed: &str) {
    let bounds = bounds_rect(bounds);
    let radius = bounds.w.min(bounds.h) * 0.5 - 6.0;
    let center = GPoint {
        x: bounds.x + bounds.w * 0.5,
        y: bounds.y + bounds.h * 0.5,
    };
    let blob = wobbly_circle(center, radius, seed, 1.4, 26);
    fill_contour(
        window,
        &offset_contour(&blob, 2.0, 3.0),
        alpha_rgba(theme::color::SHADOW),
    );
    fill_contour(window, &blob, to_rgba(fill.color()));
    stroke_contour(window, &blob, 2.5, to_rgba(theme::color::INK), None);
}

fn ellipse_contour(cx: f32, cy: f32, rx: f32, ry: f32, segments: usize) -> Contour {
    let mut points = Vec::with_capacity(segments);
    for index in 0..segments {
        let angle = std::f32::consts::TAU * index as f32 / segments as f32;
        points.push(GPoint {
            x: cx + rx * angle.cos(),
            y: cy + ry * angle.sin(),
        });
    }
    Contour::new(points, true)
}

fn arc_contour(
    cx: f32,
    cy: f32,
    rx: f32,
    ry: f32,
    start: f32,
    end: f32,
    segments: usize,
) -> Contour {
    let mut points = Vec::with_capacity(segments + 1);
    for index in 0..=segments {
        let angle = start + (end - start) * index as f32 / segments as f32;
        points.push(GPoint {
            x: cx + rx * angle.cos(),
            y: cy + ry * angle.sin(),
        });
    }
    Contour::new(points, false)
}

/// A doodle face generated from the name, with an optional status dot.
///
/// The browser kit hashes the name into six hair shapes, three eye sets and
/// three mouths. This keeps the same idea with the shared seed: the same name
/// draws the same face on every frame and every platform.
pub fn paint_face(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    name: &str,
    fill: Fill,
    status: Option<Rgb>,
) {
    let rect = bounds_rect(bounds);
    let size = rect.w.min(rect.h);
    if size < 12.0 {
        return;
    }
    let cx = rect.x + rect.w * 0.5;
    let cy = rect.y + rect.h * 0.5;
    let mut rng = plopui_core::seed::seed(name);

    let disc = wobbly_circle(
        GPoint { x: cx, y: cy },
        size * 0.48,
        &format!("{name}-disc"),
        1.0,
        24,
    );
    fill_contour(window, &disc, to_rgba(fill.color()));

    let head_r = size * 0.33;
    let head_center = GPoint {
        x: cx,
        y: cy + size * 0.02,
    };
    let head = wobbly_circle(head_center, head_r, &format!("{name}-head"), 0.9, 30);
    let line = (size * 0.045).clamp(1.1, 3.2);
    fill_contour(
        window,
        &offset_contour(&head, line * 0.8, line),
        alpha_rgba(theme::color::SHADOW),
    );
    fill_contour(window, &head, to_rgba(theme::color::PAPER));
    stroke_contour(window, &head, line, to_rgba(theme::color::INK), None);

    // An ear pokes out on the left, like the React face.
    let ear = ellipse_contour(
        cx - head_r * 0.94,
        head_center.y + head_r * 0.08,
        head_r * 0.17,
        head_r * 0.21,
        18,
    );
    fill_contour(window, &ear, to_rgba(theme::color::PAPER));
    stroke_contour(window, &ear, line * 0.9, to_rgba(theme::color::INK), None);

    let variant = (rng.next_f64() * 6.0) as usize;
    let eyes = (rng.next_f64() * 3.0) as usize;
    let mouth = (rng.next_f64() * 3.0) as usize;
    let glasses = rng.next_f64() < 0.2;
    let blush = rng.next_f64() < 0.34;
    let fringe = (rng.next_f64() as f32 - 0.5) * head_r * 0.12;

    let hair_bottom = head_center.y
        - head_r
            * match variant {
                0 => 0.22,
                1 => 0.30,
                2 => 0.27,
                3 => 0.50,
                4 => 0.24,
                _ => 0.32,
            }
        + fringe;
    let right_side = if variant == 5 {
        head_r * 0.55
    } else {
        head_r * 0.12
    };
    let left_side = if variant == 5 {
        head_r * 0.55
    } else if variant == 1 {
        head_r * 0.38
    } else {
        head_r * 0.12
    };
    let mut hair_points = Vec::with_capacity(24);
    let start = std::f32::consts::PI * 1.04;
    let end = std::f32::consts::PI * 1.96;
    for index in 0..=16 {
        let angle = start + (end - start) * index as f32 / 16.0;
        hair_points.push(GPoint {
            x: cx + head_r * 1.02 * angle.cos(),
            y: head_center.y + head_r * 1.02 * angle.sin(),
        });
    }
    hair_points.push(GPoint {
        x: cx + head_r * 0.98,
        y: hair_bottom + right_side,
    });
    hair_points.push(GPoint {
        x: cx + head_r * 0.45,
        y: hair_bottom + head_r * 0.02,
    });
    hair_points.push(GPoint {
        x: cx,
        y: hair_bottom - head_r * 0.06,
    });
    hair_points.push(GPoint {
        x: cx - head_r * 0.45,
        y: hair_bottom + head_r * 0.02,
    });
    hair_points.push(GPoint {
        x: cx - head_r * 0.98,
        y: hair_bottom + left_side,
    });
    let hair = Contour::new(hair_points, true);
    let hair_color = if variant == 0 {
        fill.color()
    } else {
        theme::color::INK
    };
    fill_contour(window, &hair, to_rgba(hair_color));
    stroke_contour(window, &hair, line * 0.85, to_rgba(theme::color::INK), None);

    if variant == 2 || variant == 4 {
        let bun = ellipse_contour(
            cx + head_r * 0.12,
            head_center.y - head_r * 1.04,
            head_r * 0.26,
            head_r * 0.26,
            18,
        );
        fill_contour(window, &bun, to_rgba(hair_color));
        stroke_contour(window, &bun, line * 0.85, to_rgba(theme::color::INK), None);
    }

    let eye_y = head_center.y - head_r * 0.02;
    let eye_dx = head_r * 0.34;
    match eyes {
        0 => {
            for sign in [-1.0_f32, 1.0] {
                let eye =
                    ellipse_contour(cx + sign * eye_dx, eye_y, head_r * 0.075, head_r * 0.11, 14);
                fill_contour(window, &eye, to_rgba(theme::color::INK));
            }
        }
        1 => {
            for sign in [-1.0_f32, 1.0] {
                let eye = arc_contour(
                    cx + sign * eye_dx,
                    eye_y,
                    head_r * 0.11,
                    head_r * 0.08,
                    std::f32::consts::PI * 1.15,
                    std::f32::consts::PI * 1.85,
                    10,
                );
                stroke_contour(window, &eye, line * 0.9, to_rgba(theme::color::INK), None);
            }
        }
        _ => {
            for sign in [-1.0_f32, 1.0] {
                let eye =
                    ellipse_contour(cx + sign * eye_dx, eye_y, head_r * 0.07, head_r * 0.07, 12);
                fill_contour(window, &eye, to_rgba(theme::color::INK));
            }
        }
    }

    let mouth_y = head_center.y + head_r * 0.42;
    match mouth {
        0 => {
            let smile = arc_contour(
                cx,
                mouth_y - head_r * 0.08,
                head_r * 0.20,
                head_r * 0.16,
                std::f32::consts::PI * 0.18,
                std::f32::consts::PI * 0.82,
                10,
            );
            stroke_contour(
                window,
                &smile,
                line * 0.95,
                to_rgba(theme::color::INK),
                None,
            );
        }
        1 => {
            let open = ellipse_contour(cx, mouth_y, head_r * 0.14, head_r * 0.10, 16);
            fill_contour(window, &open, to_rgba(theme::color::TOMATO));
            stroke_contour(window, &open, line * 0.8, to_rgba(theme::color::INK), None);
        }
        _ => {
            let dot = ellipse_contour(cx, mouth_y, head_r * 0.055, head_r * 0.075, 12);
            fill_contour(window, &dot, to_rgba(theme::color::INK));
        }
    }

    if glasses {
        for sign in [-1.0_f32, 1.0] {
            let lens = ellipse_contour(cx + sign * eye_dx, eye_y, head_r * 0.18, head_r * 0.16, 18);
            stroke_contour(window, &lens, line * 0.8, to_rgba(theme::color::INK), None);
        }
        let bridge = Contour::new(
            vec![
                GPoint {
                    x: cx - head_r * 0.16,
                    y: eye_y,
                },
                GPoint {
                    x: cx + head_r * 0.16,
                    y: eye_y,
                },
            ],
            false,
        );
        stroke_contour(
            window,
            &bridge,
            line * 0.8,
            to_rgba(theme::color::INK),
            None,
        );
    }

    if blush {
        for sign in [-1.0_f32, 1.0] {
            let cheek = ellipse_contour(
                cx + sign * head_r * 0.56,
                head_center.y + head_r * 0.22,
                head_r * 0.11,
                head_r * 0.065,
                14,
            );
            fill_contour(window, &cheek, to_rgba(theme::color::BUBBLEGUM));
        }
    }

    if let Some(color) = status {
        let dot_center = GPoint {
            x: cx + size * 0.33,
            y: cy + size * 0.33,
        };
        let radius = size * 0.10;
        let ring = ellipse_contour(dot_center.x, dot_center.y, radius * 1.45, radius * 1.45, 20);
        fill_contour(window, &ring, to_rgba(theme::color::PAPER));
        stroke_contour(window, &ring, line * 0.8, to_rgba(theme::color::INK), None);
        let dot = ellipse_contour(dot_center.x, dot_center.y, radius, radius, 16);
        fill_contour(window, &dot, to_rgba(color));
    }
}

/// One of the five waiting marks from the React kit.
pub fn paint_spinner_kind(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    kind: crate::components::SpinnerKind,
    color: Rgb,
    seed: &str,
    phase: f32,
) {
    use crate::components::{BuddyMood, DoodleKind, SpinnerKind};

    match kind {
        SpinnerKind::Ink => paint_spinner(window, bounds, color, seed, phase),
        SpinnerKind::Dots => {
            let rect = bounds_rect(bounds);
            let size = rect.w.min(rect.h);
            let cx = rect.x + rect.w * 0.5;
            let cy = rect.y + rect.h * 0.5;
            let radius = size * 0.075;
            for index in 0..3 {
                let wave = (phase.to_radians() + index as f32 * 2.1).sin();
                let x = cx + (index as f32 - 1.0) * size * 0.27;
                let y = cy - wave * size * 0.10;
                let squash = 0.62 + 0.38 * wave.abs();
                let dot = ellipse_contour(x, y, radius, radius * squash, 16);
                fill_contour(window, &dot, to_rgba(color));
            }
        }
        SpinnerKind::Scribble => {
            let rect = bounds_rect(bounds);
            let size = rect.w.min(rect.h);
            let mut rng = plopui_core::seed::seed(seed);
            let loops = 3.0_f32;
            let steps = 54;
            let mut raw = Vec::with_capacity(steps + 1);
            for index in 0..=steps {
                let t = index as f32 / steps as f32 * loops * std::f32::consts::TAU;
                raw.push(GPoint {
                    x: 12.0 + 2.6 * t - 9.0 * t.sin() + (rng.next_f64() as f32 - 0.5) * 1.2,
                    y: 26.0 - 12.0 * t.cos() + (rng.next_f64() as f32 - 0.5) * 1.2,
                });
            }
            let (mut min_x, mut max_x) = (f32::MAX, f32::MIN);
            let (mut min_y, mut max_y) = (f32::MAX, f32::MIN);
            for point in &raw {
                min_x = min_x.min(point.x);
                max_x = max_x.max(point.x);
                min_y = min_y.min(point.y);
                max_y = max_y.max(point.y);
            }
            let width = (max_x - min_x).max(1.0);
            let height = (max_y - min_y).max(1.0);
            let scale = (size * 0.86 / width).min(size * 0.72 / height);
            let offset_x = rect.x + (rect.w - width * scale) * 0.5;
            let offset_y = rect.y + (rect.h - height * scale) * 0.5;
            let points: Vec<GPoint> = raw
                .into_iter()
                .map(|point| GPoint {
                    x: offset_x + (point.x - min_x) * scale,
                    y: offset_y + (point.y - min_y) * scale,
                })
                .collect();
            let line = Contour::new(points, false);
            stroke_contour(
                window,
                &line,
                (size * 0.06).clamp(1.4, 3.2),
                to_rgba(color),
                None,
            );
            if !line.points.is_empty() {
                // The pen tip travels along the line as the animation runs.
                let progress = (phase / 360.0).rem_euclid(1.0);
                let index = ((progress * (line.points.len() - 1) as f32) as usize)
                    .min(line.points.len() - 1);
                let tip = line.points[index];
                let dot = ellipse_contour(tip.x, tip.y, size * 0.055, size * 0.055, 12);
                fill_contour(window, &dot, to_rgba(color));
            }
        }
        SpinnerKind::Sticker => {
            let lift = phase.to_radians().sin() * f32::from(bounds.size.height) * 0.07;
            let shifted = Bounds::new(bounds.origin + point(px(0.0), px(lift)), bounds.size);
            paint_doodle(window, shifted, DoodleKind::Star, color);
        }
        SpinnerKind::Buddy => {
            let lift = phase.to_radians().sin() * f32::from(bounds.size.height) * 0.05;
            let shifted = Bounds::new(bounds.origin + point(px(0.0), px(lift)), bounds.size);
            paint_buddy(window, shifted, BuddyMood::Thinking, seed);
        }
    }
}

pub fn paint_underline(window: &mut Window, bounds: Bounds<Pixels>, color: Rgb) {
    let bounds = bounds_rect(bounds);
    let y = bounds.y + bounds.h * 0.5;
    let points = [
        GPoint {
            x: bounds.x + 2.0,
            y,
        },
        GPoint {
            x: bounds.x + bounds.w * 0.33,
            y: y - 2.5,
        },
        GPoint {
            x: bounds.x + bounds.w * 0.66,
            y: y + 2.0,
        },
        GPoint {
            x: bounds.x + bounds.w - 2.0,
            y: y - 1.0,
        },
    ];
    stroke_polyline(window, &points, 5.0, to_rgba(color));
}

pub fn paint_divider(window: &mut Window, bounds: Bounds<Pixels>, color: Rgb) {
    let bounds = bounds_rect(bounds);
    let y = bounds.y + bounds.h * 0.5;
    let contour = Contour {
        points: vec![
            GPoint {
                x: bounds.x + 4.0,
                y: y + 1.0,
            },
            GPoint {
                x: bounds.x + bounds.w * 0.3,
                y: y - 1.0,
            },
            GPoint {
                x: bounds.x + bounds.w * 0.7,
                y: y + 1.2,
            },
            GPoint {
                x: bounds.x + bounds.w - 4.0,
                y: y - 0.8,
            },
        ],
        closed: false,
    };
    stroke_contour(
        window,
        &contour,
        2.0,
        alpha_rgba(Rgba::from_rgb(color, 0.55)),
        Some([6.0, 5.0]),
    );
}

/// A form field frame: paper, ink border, offset shadow.
pub fn paint_field(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    seed: &str,
    focus_color: Rgb,
    focused: bool,
    error: bool,
) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 8.0);
    let contour = jittered(rect, scale_radii(RADIUS_BOX, 0.85), seed, 0.9, 5);
    fill_contour(
        window,
        &offset_contour(&contour, 3.0, 4.0),
        alpha_rgba(theme::color::SHADOW),
    );
    fill_contour(window, &contour, to_rgba(theme::color::PAPER));
    let border = if error {
        theme::color::TOMATO
    } else if focused {
        focus_color
    } else {
        theme::color::INK
    };
    stroke_contour(
        window,
        &contour,
        if focused { 3.5 } else { 2.5 },
        to_rgba(border),
        None,
    );
}

pub fn paint_checkbox(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    checked: bool,
    focus_color: Rgb,
    focused: bool,
    seed: &str,
) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 5.0);
    let box_shape = jittered(rect, [8.0; 4], seed, 0.7, 3);
    fill_contour(window, &box_shape, to_rgba(theme::color::PAPER));
    stroke_contour(window, &box_shape, 2.6, to_rgba(theme::color::INK), None);
    if checked {
        let check = [
            GPoint {
                x: rect.x + rect.w * 0.22,
                y: rect.y + rect.h * 0.52,
            },
            GPoint {
                x: rect.x + rect.w * 0.43,
                y: rect.y + rect.h * 0.73,
            },
            GPoint {
                x: rect.x + rect.w * 0.8,
                y: rect.y + rect.h * 0.27,
            },
        ];
        stroke_polyline(window, &check, 4.0, to_rgba(theme::color::INK));
    }
    if focused {
        let ring = jittered(
            rect_expand(rect, 4.0),
            [10.0; 4],
            &format!("{seed}-ring"),
            0.5,
            2,
        );
        stroke_contour(window, &ring, 2.5, to_rgba(focus_color), Some([6.0, 5.0]));
    }
}

pub fn paint_switch(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    checked: bool,
    focus_color: Rgb,
    focused: bool,
    seed: &str,
) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 6.0);
    let track = jittered(rect, [21.0, 18.0, 20.0, 19.0], seed, 0.8, 4);
    let track_color = if checked {
        theme::color::MINT
    } else {
        theme::color::TRACK
    };
    fill_contour(window, &track, to_rgba(track_color));
    stroke_contour(window, &track, 2.5, to_rgba(theme::color::INK), None);

    let thumb_radius = (rect.h * 0.5 - 4.0).max(6.0);
    let thumb_x = if checked {
        rect.x + rect.w - thumb_radius - 5.0
    } else {
        rect.x + thumb_radius + 5.0
    };
    let thumb = wobbly_circle(
        GPoint {
            x: thumb_x,
            y: rect.y + rect.h * 0.5,
        },
        thumb_radius,
        &format!("{seed}-thumb"),
        0.8,
        16,
    );
    fill_contour(window, &thumb, to_rgba(theme::color::PAPER));
    stroke_contour(window, &thumb, 2.5, to_rgba(theme::color::INK), None);

    if focused {
        let ring = jittered(
            rect_expand(rect, 5.0),
            [24.0; 4],
            &format!("{seed}-ring"),
            0.5,
            2,
        );
        stroke_contour(window, &ring, 2.5, to_rgba(focus_color), Some([6.0, 5.0]));
    }
}

pub fn paint_radio(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    checked: bool,
    focus_color: Rgb,
    focused: bool,
    seed: &str,
) {
    let bounds = bounds_rect(bounds);
    let rect = rect_inset(bounds, 5.0);
    let circle = wobbly_circle(
        GPoint {
            x: rect.x + rect.w * 0.5,
            y: rect.y + rect.h * 0.5,
        },
        rect.w.min(rect.h) * 0.5,
        seed,
        0.7,
        20,
    );
    fill_contour(window, &circle, to_rgba(theme::color::PAPER));
    stroke_contour(window, &circle, 2.6, to_rgba(theme::color::INK), None);
    if checked {
        let dot = wobbly_circle(
            GPoint {
                x: rect.x + rect.w * 0.5,
                y: rect.y + rect.h * 0.5,
            },
            rect.w.min(rect.h) * 0.24,
            &format!("{seed}-dot"),
            0.5,
            14,
        );
        fill_contour(window, &dot, to_rgba(theme::color::INK));
    }
    if focused {
        let ring = wobbly_circle(
            GPoint {
                x: rect.x + rect.w * 0.5,
                y: rect.y + rect.h * 0.5,
            },
            rect.w.min(rect.h) * 0.5 + 4.0,
            &format!("{seed}-ring"),
            0.5,
            22,
        );
        stroke_contour(window, &ring, 2.5, to_rgba(focus_color), Some([6.0, 5.0]));
    }
}

/// The paper pattern printed behind a surface.
pub fn paint_surface_pattern(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    surface: SurfaceName,
    mode: SurfaceMode,
) {
    let rect = bounds_rect(bounds);
    let line_a = alpha_rgba(mode.line_a);
    let line_b = alpha_rgba(mode.line_b);

    match surface {
        SurfaceName::Mat => {
            let step = 24.0;
            let mut x = rect.x - rect.x % step;
            while x < rect.x + rect.w {
                line(
                    window,
                    GPoint { x, y: rect.y },
                    GPoint {
                        x,
                        y: rect.y + rect.h,
                    },
                    if ((x - rect.x) / step) as i32 % 5 == 0 {
                        1.6
                    } else {
                        1.0
                    },
                    if ((x - rect.x) / step) as i32 % 5 == 0 {
                        line_a
                    } else {
                        line_b
                    },
                );
                x += step;
            }
            let mut y = rect.y - rect.y % step;
            while y < rect.y + rect.h {
                line(
                    window,
                    GPoint { x: rect.x, y },
                    GPoint {
                        x: rect.x + rect.w,
                        y,
                    },
                    if ((y - rect.y) / step) as i32 % 5 == 0 {
                        1.6
                    } else {
                        1.0
                    },
                    if ((y - rect.y) / step) as i32 % 5 == 0 {
                        line_a
                    } else {
                        line_b
                    },
                );
                y += step;
            }
        }
        SurfaceName::Notebook => {
            let mut y = rect.y + 32.0;
            while y < rect.y + rect.h {
                line(
                    window,
                    GPoint { x: rect.x, y },
                    GPoint {
                        x: rect.x + rect.w,
                        y,
                    },
                    1.0,
                    line_b,
                );
                y += 32.0;
            }
            line(
                window,
                GPoint {
                    x: rect.x + 62.0,
                    y: rect.y,
                },
                GPoint {
                    x: rect.x + 62.0,
                    y: rect.y + rect.h,
                },
                2.0,
                line_a,
            );
        }
        SurfaceName::Kraft => {
            let step = 22.0;
            for (i, x) in ((rect.x as i32)..((rect.x + rect.w) as i32))
                .step_by(step as usize)
                .enumerate()
            {
                for (j, y) in ((rect.y as i32)..((rect.y + rect.h) as i32))
                    .step_by(step as usize)
                    .enumerate()
                {
                    if (i + j) % 2 == 0 {
                        let dot = wobbly_circle(
                            GPoint {
                                x: x as f32 + 4.0,
                                y: y as f32 + 4.0,
                            },
                            0.9,
                            &format!("kraft-{i}-{j}"),
                            0.2,
                            6,
                        );
                        fill_contour(window, &dot, line_a);
                    }
                }
            }
        }
        SurfaceName::Riso => {
            let step = 12.0;
            for (i, x) in ((rect.x as i32)..((rect.x + rect.w) as i32))
                .step_by(step as usize)
                .enumerate()
            {
                for (j, y) in ((rect.y as i32)..((rect.y + rect.h) as i32))
                    .step_by(step as usize)
                    .enumerate()
                {
                    let dot = wobbly_circle(
                        GPoint {
                            x: x as f32 + 2.0,
                            y: y as f32 + 2.0,
                        },
                        1.5,
                        &format!("riso-{i}-{j}"),
                        0.3,
                        8,
                    );
                    fill_contour(window, &dot, line_a);
                }
            }
        }
        SurfaceName::Poster => {
            let step = 64.0;
            let mut x = rect.x + 12.0;
            while x < rect.x + rect.w {
                let mut y = rect.y + 18.0;
                while y < rect.y + rect.h {
                    let dot = wobbly_circle(
                        GPoint { x, y },
                        1.0,
                        &format!("poster-{x:.0}-{y:.0}"),
                        0.4,
                        6,
                    );
                    fill_contour(window, &dot, line_a);
                    y += step;
                }
                x += step;
            }
        }
    }
}

/// Focus ring for surfaces that want the "cut here" line around a plain box.
pub fn paint_focus_ring(window: &mut Window, bounds: Bounds<Pixels>, color: Rgb, seed: &str) {
    let rect = bounds_rect(bounds);
    let ring = jittered(
        rect_inset(rect, 2.0),
        scale_radii(RADIUS_CUT, 0.8),
        seed,
        0.7,
        4,
    );
    stroke_contour(window, &ring, 2.5, to_rgba(color), Some([8.0, 6.0]));
}

/// A tiny helper for text colors so callers do not import the color module.
pub fn ink_text_color(color: Rgb) -> Hsla {
    to_hsla(color)
}

/// A dashed connector between two points, used by the timeline.
fn dashed_line(
    window: &mut Window,
    a: GPoint,
    b: GPoint,
    width: f32,
    color: GpuiRgba,
    dash: f32,
    gap: f32,
) {
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let length = (dx * dx + dy * dy).sqrt();
    if length <= 0.0 || dash <= 0.0 {
        return;
    }
    let (ux, uy) = (dx / length, dy / length);
    let mut cursor = 0.0;
    while cursor < length {
        let end = (cursor + dash).min(length);
        line(
            window,
            GPoint {
                x: a.x + ux * cursor,
                y: a.y + uy * cursor,
            },
            GPoint {
                x: a.x + ux * end,
                y: a.y + uy * end,
            },
            width,
            color,
        );
        cursor += dash + gap;
    }
}

/// The rotating arc of `PlopSpinner`. `phase` is in degrees.
pub fn paint_spinner(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    color: Rgb,
    seed: &str,
    phase: f32,
) {
    let rect = bounds_rect(bounds);
    let size = rect.w.min(rect.h);
    let stroke = (size * 0.12).clamp(1.5, 4.0);
    let head = (size * 0.11).clamp(1.2, 3.6);
    let radius = size * 0.5 - stroke * 0.9;
    if radius <= 2.0 {
        return;
    }
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let mut rng = plopui_core::seed::seed(seed);
    let start = phase.to_radians();
    let sweep = 250.0_f32.to_radians();
    let segments = 26usize;
    let mut points = Vec::with_capacity(segments + 1);
    for index in 0..=segments {
        let t = index as f32 / segments as f32;
        let angle = start + sweep * t;
        let offset = (rng.next_f64() as f32 - 0.5) * 1.5 * (size / 34.0).max(0.5);
        let r = radius + offset;
        points.push(GPoint {
            x: center.x + angle.cos() * r,
            y: center.y + angle.sin() * r,
        });
    }
    stroke_polyline(window, &points, stroke, to_rgba(color));
    let head_point = points[segments];
    let dot = wobbly_circle(head_point, head, &format!("{seed}-head"), 0.4, 10);
    fill_contour(window, &dot, to_rgba(color));
}

/// A dashed face for `PlopEmptyState`: never says "nothing" with silence.
pub fn paint_empty_doodle(window: &mut Window, bounds: Bounds<Pixels>, color: Rgb) {
    let rect = bounds_rect(bounds);
    let radius = rect.w.min(rect.h) * 0.5 - 6.0;
    if radius <= 6.0 {
        return;
    }
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let head = wobbly_circle(center, radius, "empty-doodle", 1.3, 30);
    stroke_contour(window, &head, 2.5, to_rgba(color), Some([9.0, 7.0]));

    for sign in [-1.0_f32, 1.0] {
        let eye = wobbly_circle(
            GPoint {
                x: center.x + sign * radius * 0.34,
                y: center.y - radius * 0.14,
            },
            2.3,
            if sign < 0.0 {
                "empty-eye-l"
            } else {
                "empty-eye-r"
            },
            0.4,
            10,
        );
        fill_contour(window, &eye, to_rgba(color));
    }

    let mouth = [
        GPoint {
            x: center.x - radius * 0.28,
            y: center.y + radius * 0.32,
        },
        GPoint {
            x: center.x,
            y: center.y + radius * 0.44,
        },
        GPoint {
            x: center.x + radius * 0.3,
            y: center.y + radius * 0.3,
        },
    ];
    stroke_polyline(window, &mouth, 2.5, to_rgba(color));
}

/// Connector line and step dots for `PlopStatusTimeline`. Labels are rendered
/// by the component; this only owns the geometry, so the two stay aligned.
pub fn paint_timeline(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    steps: usize,
    current: usize,
    done: Rgb,
    pending: Rgb,
    ink: Rgb,
) {
    if steps == 0 {
        return;
    }
    let rect = bounds_rect(bounds);
    let y = rect.y + rect.h * 0.5;
    let center_of = |index: usize| rect.x + rect.w * (index as f32 + 0.5) / steps as f32;
    for index in 0..steps.saturating_sub(1) {
        let a = GPoint {
            x: center_of(index) + 13.0,
            y,
        };
        let b = GPoint {
            x: center_of(index + 1) - 13.0,
            y,
        };
        let color = if index < current { done } else { pending };
        dashed_line(window, a, b, 2.0, to_rgba(color), 6.0, 5.0);
    }
    for index in 0..steps {
        let center = GPoint {
            x: center_of(index),
            y,
        };
        let dot = wobbly_circle(center, 7.0, &format!("timeline-{index}"), 0.6, 14);
        if index <= current {
            fill_contour(window, &dot, to_rgba(done));
        } else {
            fill_contour(window, &dot, to_rgba(theme::color::PAPER));
        }
        stroke_contour(window, &dot, 2.0, to_rgba(ink), None);
    }
}

/// One of the six buddy faces. Mood is carried by the eyes and mouth, and the
/// component also exposes it as an accessibility label.
pub fn paint_buddy(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    mood: crate::components::BuddyMood,
    seed: &str,
) {
    let rect = bounds_rect(bounds);
    let radius = rect.w.min(rect.h) * 0.5 - 7.0;
    if radius <= 8.0 {
        return;
    }
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let fill = mood.fill();
    let blob = wobbly_circle(center, radius, seed, 1.3, 28);
    fill_contour(
        window,
        &offset_contour(&blob, 2.5, 3.5),
        alpha_rgba(theme::color::SHADOW),
    );
    fill_contour(window, &blob, to_rgba(fill.color()));
    stroke_contour(window, &blob, 2.5, to_rgba(theme::color::INK), None);

    let ink = to_rgba(theme::color::INK);
    let eye_y = center.y - radius * 0.16;
    let eye_dx = radius * 0.34;
    let eye = |window: &mut Window, x: f32, y: f32, name: &str| {
        fill_contour(
            window,
            &wobbly_circle(GPoint { x, y }, 2.6, name, 0.3, 10),
            ink,
        );
    };
    let smile = |window: &mut Window, lift: f32| {
        stroke_polyline(
            window,
            &[
                GPoint {
                    x: center.x - radius * 0.26,
                    y: center.y + radius * 0.28 + lift,
                },
                GPoint {
                    x: center.x,
                    y: center.y + radius * 0.42 + lift,
                },
                GPoint {
                    x: center.x + radius * 0.27,
                    y: center.y + radius * 0.26 + lift,
                },
            ],
            2.6,
            ink,
        );
    };
    let cross = |window: &mut Window, x: f32, y: f32, name: &str| {
        let arm = radius * 0.12;
        stroke_polyline(
            window,
            &[
                GPoint {
                    x: x - arm,
                    y: y - arm,
                },
                GPoint {
                    x: x + arm,
                    y: y + arm,
                },
            ],
            2.4,
            ink,
        );
        stroke_polyline(
            window,
            &[
                GPoint {
                    x: x - arm,
                    y: y + arm,
                },
                GPoint {
                    x: x + arm,
                    y: y - arm,
                },
            ],
            2.4,
            ink,
        );
        let _ = name;
    };

    match mood {
        crate::components::BuddyMood::Success => {
            eye(window, center.x - eye_dx, eye_y, "buddy-eye-l");
            eye(window, center.x + eye_dx, eye_y, "buddy-eye-r");
            smile(window, 0.0);
        }
        crate::components::BuddyMood::Error => {
            cross(window, center.x - eye_dx, eye_y, "buddy-x-l");
            cross(window, center.x + eye_dx, eye_y, "buddy-x-r");
            stroke_polyline(
                window,
                &[
                    GPoint {
                        x: center.x - radius * 0.24,
                        y: center.y + radius * 0.42,
                    },
                    GPoint {
                        x: center.x,
                        y: center.y + radius * 0.25,
                    },
                    GPoint {
                        x: center.x + radius * 0.24,
                        y: center.y + radius * 0.42,
                    },
                ],
                2.6,
                ink,
            );
        }
        crate::components::BuddyMood::Stale => {
            for sign in [-1.0_f32, 1.0] {
                let x = center.x + sign * eye_dx;
                stroke_polyline(
                    window,
                    &[
                        GPoint {
                            x: x - 4.0,
                            y: eye_y,
                        },
                        GPoint {
                            x: x + 4.0,
                            y: eye_y,
                        },
                    ],
                    2.4,
                    ink,
                );
            }
            stroke_polyline(
                window,
                &[
                    GPoint {
                        x: center.x - radius * 0.24,
                        y: center.y + radius * 0.34,
                    },
                    GPoint {
                        x: center.x + radius * 0.24,
                        y: center.y + radius * 0.34,
                    },
                ],
                2.4,
                ink,
            );
        }
        crate::components::BuddyMood::Congrats => {
            for sign in [-1.0_f32, 1.0] {
                let x = center.x + sign * eye_dx;
                stroke_polyline(
                    window,
                    &[
                        GPoint {
                            x: x - 4.0,
                            y: eye_y + 1.5,
                        },
                        GPoint { x, y: eye_y - 2.5 },
                        GPoint {
                            x: x + 4.0,
                            y: eye_y + 1.5,
                        },
                    ],
                    2.4,
                    ink,
                );
            }
            smile(window, 0.0);
            for (dx, dy, name) in [
                (-0.82, -0.82, "confetti-1"),
                (0.84, -0.66, "confetti-2"),
                (0.9, 0.36, "confetti-3"),
                (-0.9, 0.52, "confetti-4"),
            ] {
                let dot = wobbly_circle(
                    GPoint {
                        x: center.x + radius * dx,
                        y: center.y + radius * dy,
                    },
                    2.0,
                    name,
                    0.4,
                    8,
                );
                fill_contour(window, &dot, to_rgba(theme::color::MUSTARD));
                stroke_contour(window, &dot, 1.2, ink, None);
            }
        }
        crate::components::BuddyMood::Preview => {
            eye(window, center.x - eye_dx, eye_y, "buddy-eye-l");
            stroke_polyline(
                window,
                &[
                    GPoint {
                        x: center.x + eye_dx - 4.0,
                        y: eye_y,
                    },
                    GPoint {
                        x: center.x + eye_dx + 4.0,
                        y: eye_y,
                    },
                ],
                2.4,
                ink,
            );
            smile(window, 0.0);
        }
        crate::components::BuddyMood::Thinking => {
            eye(window, center.x - eye_dx, eye_y, "buddy-eye-l");
            eye(window, center.x + eye_dx, eye_y, "buddy-eye-r");
            stroke_polyline(
                window,
                &[
                    GPoint {
                        x: center.x - radius * 0.12,
                        y: center.y + radius * 0.34,
                    },
                    GPoint {
                        x: center.x + radius * 0.12,
                        y: center.y + radius * 0.34,
                    },
                ],
                2.4,
                ink,
            );
            for (index, scale) in [1.0_f32, 0.8, 0.6].iter().enumerate() {
                let dot = wobbly_circle(
                    GPoint {
                        x: center.x + radius * (0.72 + index as f32 * 0.16),
                        y: center.y - radius * 0.82,
                    },
                    3.0 * scale,
                    &format!("thought-{index}"),
                    0.3,
                    8,
                );
                fill_contour(window, &dot, ink);
            }
        }
    }
}

/// A ring progress meter: wobbly track, inked arc, sticker end cap.
pub fn paint_progress_ring(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    ratio: f32,
    fill: Fill,
    seed: &str,
) {
    let rect = bounds_rect(bounds);
    let radius = rect.w.min(rect.h) * 0.5 - 8.0;
    if radius <= 8.0 {
        return;
    }
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let track = wobbly_circle(center, radius, seed, 0.7, 32);
    stroke_contour(
        window,
        &track,
        5.0,
        alpha_rgba(Rgba::from_rgb(theme::color::INK, 0.16)),
        None,
    );

    let ratio = ratio.clamp(0.0, 1.0);
    if ratio <= 0.001 {
        return;
    }
    let mut rng = plopui_core::seed::seed(&format!("{seed}-arc"));
    let sweep = ratio * std::f32::consts::TAU;
    let start = -std::f32::consts::FRAC_PI_2;
    let segments = 48usize;
    let mut points = Vec::with_capacity(segments + 1);
    for index in 0..=segments {
        let angle = start + sweep * index as f32 / segments as f32;
        let wobble = (rng.next_f64() as f32 - 0.5) * 1.2;
        let r = radius + wobble;
        points.push(GPoint {
            x: center.x + angle.cos() * r,
            y: center.y + angle.sin() * r,
        });
    }
    stroke_polyline(window, &points, 6.0, to_rgba(fill.color()));
    let head = points[segments];
    let cap = wobbly_circle(head, 4.5, &format!("{seed}-cap"), 0.4, 10);
    fill_contour(window, &cap, to_rgba(fill.color()));
    stroke_contour(window, &cap, 2.0, to_rgba(theme::color::INK), None);
}

/// The small margin doodles: star, arrow, squiggle, heart and sparkle.
pub fn paint_doodle(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    kind: crate::components::DoodleKind,
    color: Rgb,
) {
    use crate::components::DoodleKind;
    let rect = bounds_rect(bounds);
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let radius = rect.w.min(rect.h) * 0.5 - 4.0;
    if radius <= 3.0 {
        return;
    }
    let ink = to_rgba(color);
    match kind {
        DoodleKind::Star => {
            let mut points = Vec::with_capacity(10);
            for index in 0..10 {
                let angle =
                    -std::f32::consts::FRAC_PI_2 + std::f32::consts::TAU * index as f32 / 10.0;
                let r = if index % 2 == 0 {
                    radius
                } else {
                    radius * 0.45
                };
                points.push(GPoint {
                    x: center.x + angle.cos() * r,
                    y: center.y + angle.sin() * r,
                });
            }
            points.push(points[0]);
            stroke_polyline(window, &points, 2.6, ink);
        }
        DoodleKind::Arrow => {
            stroke_polyline(
                window,
                &[
                    GPoint {
                        x: rect.x + rect.w * 0.16,
                        y: rect.y + rect.h * 0.84,
                    },
                    GPoint {
                        x: rect.x + rect.w * 0.8,
                        y: rect.y + rect.h * 0.2,
                    },
                ],
                2.6,
                ink,
            );
            stroke_polyline(
                window,
                &[
                    GPoint {
                        x: rect.x + rect.w * 0.52,
                        y: rect.y + rect.h * 0.2,
                    },
                    GPoint {
                        x: rect.x + rect.w * 0.8,
                        y: rect.y + rect.h * 0.2,
                    },
                    GPoint {
                        x: rect.x + rect.w * 0.8,
                        y: rect.y + rect.h * 0.48,
                    },
                ],
                2.6,
                ink,
            );
        }
        DoodleKind::Squiggle => {
            let mut points = Vec::with_capacity(18);
            for index in 0..=16 {
                let t = index as f32 / 16.0;
                points.push(GPoint {
                    x: rect.x + rect.w * (0.1 + 0.8 * t),
                    y: center.y + (t * std::f32::consts::TAU * 3.0).sin() * rect.h * 0.18,
                });
            }
            stroke_polyline(window, &points, 2.6, ink);
        }
        DoodleKind::Heart => {
            let mut points = Vec::with_capacity(28);
            for index in 0..=24 {
                let t = std::f32::consts::TAU * index as f32 / 24.0;
                let x = t.sin().powi(3) * radius;
                let y = -(13.0 * t.cos()
                    - 5.0 * (2.0 * t).cos()
                    - 2.0 * (3.0 * t).cos()
                    - (4.0 * t).cos())
                    / 16.0
                    * radius;
                points.push(GPoint {
                    x: center.x + x,
                    y: center.y + y,
                });
            }
            stroke_polyline(window, &points, 2.6, ink);
        }
        DoodleKind::Sparkle => {
            for (dx, dy) in [(1.0_f32, 0.0), (-1.0, 0.0), (0.0, 1.0), (0.0, -1.0)] {
                stroke_polyline(
                    window,
                    &[
                        GPoint {
                            x: center.x + dx * radius * 0.25,
                            y: center.y + dy * radius * 0.25,
                        },
                        GPoint {
                            x: center.x + dx * radius,
                            y: center.y + dy * radius,
                        },
                    ],
                    2.6,
                    ink,
                );
            }
            for (dx, dy) in [
                (0.55_f32, 0.55),
                (-0.55, 0.55),
                (0.55, -0.55),
                (-0.55, -0.55),
            ] {
                stroke_polyline(
                    window,
                    &[
                        GPoint {
                            x: center.x + dx * radius * 0.35,
                            y: center.y + dy * radius * 0.35,
                        },
                        GPoint {
                            x: center.x + dx * radius * 0.7,
                            y: center.y + dy * radius * 0.7,
                        },
                    ],
                    2.0,
                    ink,
                );
            }
        }
    }
}

/// A dashed perforation for ticket stubs.
pub fn paint_perforation(window: &mut Window, bounds: Bounds<Pixels>, seed: &str) {
    let rect = bounds_rect(bounds);
    let y = rect.y + rect.h * 0.5;
    let mut x = rect.x + 8.0;
    let mut rng = plopui_core::seed::seed(seed);
    while x < rect.x + rect.w - 8.0 {
        let end = (x + 9.0).min(rect.x + rect.w - 8.0);
        let wobble = (rng.next_f64() as f32 - 0.5) * 1.2;
        line(
            window,
            GPoint { x, y: y + wobble },
            GPoint {
                x: end,
                y: y + wobble,
            },
            1.8,
            alpha_rgba(Rgba::from_rgb(theme::color::INK, 0.45)),
        );
        x += 16.0;
    }
}

/// A buddy peeking over the bottom edge: same face, clipped by the canvas.
pub fn paint_buddy_peek(
    window: &mut Window,
    bounds: Bounds<Pixels>,
    mood: crate::components::BuddyMood,
    seed: &str,
) {
    let tall = Bounds::new(
        bounds.origin,
        gpui_kit::size(bounds.size.width, bounds.size.height * 2.0),
    );
    paint_buddy(window, tall, mood, seed);
}

/// A short ink burst for press feedback. `progress` runs 0..1: the marks fly
/// out and fade. Angles and droplets come from a fixed seed, so the same
/// button bursts the same way every time.
pub fn paint_ink_burst(window: &mut Window, bounds: Bounds<Pixels>, progress: f32, color: Rgb) {
    let rect = bounds_rect(bounds);
    if rect.w <= 4.0 || rect.h <= 4.0 {
        return;
    }
    let p = progress.clamp(0.0, 1.0);
    let fade = (1.0 - p).powf(0.8);
    if fade <= 0.03 {
        return;
    }
    let center = GPoint {
        x: rect.x + rect.w * 0.5,
        y: rect.y + rect.h * 0.5,
    };
    let reach = rect.w.min(rect.h) * 0.5 * (0.35 + 0.65 * (1.0 - (1.0 - p).powi(2)));
    let ink = alpha_rgba(Rgba::from_rgb(color, 0.9 * fade));
    let mut rng = plopui_core::seed::seed("ink-burst");

    // The wet center holds the strokes together.
    let core = wobbly_circle(
        center,
        reach * (0.14 + 0.08 * fade) + 1.0,
        "ink-burst-core",
        0.4,
        14,
    );
    fill_contour(window, &core, ink);

    for index in 0..9 {
        let angle =
            index as f32 * std::f32::consts::TAU / 9.0 + (rng.next_f64() as f32 - 0.5) * 0.45;
        let inner = reach * (0.28 + rng.next_f64() as f32 * 0.18);
        let outer = reach * (0.82 + rng.next_f64() as f32 * 0.3);
        let bend = (rng.next_f64() as f32 - 0.5) * 0.5;
        let start = GPoint {
            x: center.x + angle.cos() * inner,
            y: center.y + angle.sin() * inner,
        };
        let middle = GPoint {
            x: center.x + (angle + bend).cos() * (inner + outer) * 0.5,
            y: center.y + (angle + bend).sin() * (inner + outer) * 0.5,
        };
        let end = GPoint {
            x: center.x + (angle + bend * 0.4).cos() * outer,
            y: center.y + (angle + bend * 0.4).sin() * outer,
        };
        let width = 1.2 + 2.2 * fade;
        stroke_polyline(window, &[start, middle, end], width, ink);
    }

    for index in 0..5 {
        let angle = rng.next_f64() as f32 * std::f32::consts::TAU;
        let distance = reach * (0.75 + rng.next_f64() as f32 * 0.35);
        let dot_center = GPoint {
            x: center.x + angle.cos() * distance,
            y: center.y + angle.sin() * distance,
        };
        let radius = 0.8 + rng.next_f64() as f32 * 1.6 * fade;
        let dot = wobbly_circle(dot_center, radius, &format!("ink-burst-{index}"), 0.4, 10);
        fill_contour(window, &dot, ink);
    }
}
