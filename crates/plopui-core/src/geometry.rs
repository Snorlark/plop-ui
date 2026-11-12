//! Hand-drawn geometry.
//!
//! These contours are geometric approximations of PlopUI's hand-drawn look,
//! not a port of a browser filter. Corner arcs are sampled and every sample is
//! displaced along its outward normal by a seeded, bounded amount. The same
//! geometry can therefore be drawn by any native renderer, and the same seed
//! always produces the same shape.

use crate::seed::Rng;

const TAU: f32 = std::f32::consts::TAU;

/// A point in surface coordinates.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

impl Point {
    pub const fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }

    /// Euclidean distance to another point.
    pub fn distance(self, other: Point) -> f32 {
        let dx = other.x - self.x;
        let dy = other.y - self.y;
        dx.hypot(dy)
    }

    /// Linear interpolation; `t` is not clamped.
    pub fn lerp(self, other: Point, t: f32) -> Point {
        Point::new(
            self.x + (other.x - self.x) * t,
            self.y + (other.y - self.y) * t,
        )
    }
}

/// An axis-aligned rectangle, in `x`, `y`, `width`, `height` form.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Rect {
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
}

impl Rect {
    pub const fn new(x: f32, y: f32, w: f32, h: f32) -> Self {
        Self { x, y, w, h }
    }

    pub fn right(self) -> f32 {
        self.x + self.w
    }

    pub fn bottom(self) -> f32 {
        self.y + self.h
    }

    /// Shrinks every side by `amount`; a negative amount grows the rectangle.
    pub fn inset(self, amount: f32) -> Self {
        Self {
            x: self.x + amount,
            y: self.y + amount,
            w: self.w - amount * 2.0,
            h: self.h - amount * 2.0,
        }
    }

    pub fn center(self) -> Point {
        Point::new(self.x + self.w * 0.5, self.y + self.h * 0.5)
    }

    /// Boundary points count as contained.
    pub fn contains(self, point: Point) -> bool {
        point.x >= self.x
            && point.x <= self.right()
            && point.y >= self.y
            && point.y <= self.bottom()
    }
}

/// A sampled outline. A closed contour treats the last point as connected to
/// the first; it does not duplicate the first point at the end.
#[derive(Clone, Debug, PartialEq)]
pub struct Contour {
    pub points: Vec<Point>,
    pub closed: bool,
}

impl Contour {
    pub fn new(points: Vec<Point>, closed: bool) -> Self {
        Self { points, closed }
    }

    pub fn len(&self) -> usize {
        self.points.len()
    }

    pub fn is_empty(&self) -> bool {
        self.points.is_empty()
    }
}

/// Samples a wobbly rectangle whose corners are circular arcs.
///
/// `radii` is `[top-left, top-right, bottom-right, bottom-left]`, using the
/// horizontal CSS radii from the tokens. Each radius is clamped to half the
/// shorter side, then every arc and straight edge contributes
/// `segments_per_corner` samples (the final point of a feature is the first
/// point of the next, so nothing is duplicated). Samples are displaced along
/// their outward normal by up to `jitter`, using `seed` for the sequence.
///
/// This is an approximation: CSS draws elliptical corner radii and applies
/// filters; this function draws sampled circular arcs and stores points.
pub fn wobbly_rect(
    rect: Rect,
    radii: [f32; 4],
    seed: &str,
    jitter: f32,
    segments_per_corner: usize,
) -> Contour {
    let width = rect.w.max(0.0);
    let height = rect.h.max(0.0);
    let left = rect.x;
    let top = rect.y;
    let right = left + width;
    let bottom = top + height;

    let cap = width.min(height) * 0.5;
    let [tl, tr, br, bl] = radii.map(|radius| radius.clamp(0.0, cap));
    let jitter = jitter.abs();
    let samples = segments_per_corner.max(1);
    let mut rng = Rng::new(seed);
    let mut points = Vec::with_capacity(samples * 8);

    // Top-left: left edge tangent to top edge tangent.
    push_arc(
        &mut points,
        &mut rng,
        Point::new(left + tl, top + tl),
        tl,
        180.0,
        270.0,
        samples,
        jitter,
    );
    push_edge(
        &mut points,
        &mut rng,
        Point::new(left + tl, top),
        Point::new(right - tr, top),
        (0.0, -1.0),
        samples,
        jitter,
    );
    // Top-right: top edge tangent to right edge tangent.
    push_arc(
        &mut points,
        &mut rng,
        Point::new(right - tr, top + tr),
        tr,
        270.0,
        360.0,
        samples,
        jitter,
    );
    push_edge(
        &mut points,
        &mut rng,
        Point::new(right, top + tr),
        Point::new(right, bottom - br),
        (1.0, 0.0),
        samples,
        jitter,
    );
    // Bottom-right: right edge tangent to bottom edge tangent.
    push_arc(
        &mut points,
        &mut rng,
        Point::new(right - br, bottom - br),
        br,
        0.0,
        90.0,
        samples,
        jitter,
    );
    push_edge(
        &mut points,
        &mut rng,
        Point::new(right - br, bottom),
        Point::new(left + bl, bottom),
        (0.0, 1.0),
        samples,
        jitter,
    );
    // Bottom-left: bottom edge tangent to left edge tangent.
    push_arc(
        &mut points,
        &mut rng,
        Point::new(left + bl, bottom - bl),
        bl,
        90.0,
        180.0,
        samples,
        jitter,
    );
    push_edge(
        &mut points,
        &mut rng,
        Point::new(left, bottom - bl),
        Point::new(left, top + tl),
        (-1.0, 0.0),
        samples,
        jitter,
    );

    Contour::new(points, true)
}

/// Samples a wobbly circle with `segments` evenly spaced points.
///
/// Each point moves along its radial normal by up to `jitter`. The contour is
/// closed and does not repeat its first point.
pub fn wobbly_circle(
    center: Point,
    radius: f32,
    seed: &str,
    jitter: f32,
    segments: usize,
) -> Contour {
    let radius = radius.max(0.0);
    let jitter = jitter.abs();
    let mut rng = Rng::new(seed);
    let mut points = Vec::with_capacity(segments);

    for index in 0..segments {
        let angle = TAU * index as f32 / segments as f32;
        let (sin, cos) = angle.sin_cos();
        let ideal = Point::new(center.x + cos * radius, center.y + sin * radius);
        push_jittered(&mut points, &mut rng, ideal, (cos, sin), jitter);
    }

    Contour::new(points, true)
}

/// Translates every point.
pub fn offset_contour(contour: &Contour, dx: f32, dy: f32) -> Contour {
    Contour::new(
        contour
            .points
            .iter()
            .map(|point| Point::new(point.x + dx, point.y + dy))
            .collect(),
        contour.closed,
    )
}

/// Rotates every point around `center` by `degrees` (clockwise in screen
/// coordinates, because the y axis points down).
pub fn rotate_contour(contour: &Contour, center: Point, degrees: f32) -> Contour {
    let (sin, cos) = degrees.to_radians().sin_cos();
    Contour::new(
        contour
            .points
            .iter()
            .map(|point| {
                let dx = point.x - center.x;
                let dy = point.y - center.y;
                Point::new(
                    center.x + dx * cos - dy * sin,
                    center.y + dx * sin + dy * cos,
                )
            })
            .collect(),
        contour.closed,
    )
}

/// Scales every point by `factor` around `center`.
pub fn scale_contour(contour: &Contour, center: Point, factor: f32) -> Contour {
    Contour::new(
        contour
            .points
            .iter()
            .map(|point| {
                Point::new(
                    center.x + (point.x - center.x) * factor,
                    center.y + (point.y - center.y) * factor,
                )
            })
            .collect(),
        contour.closed,
    )
}

/// Clipped 45° hatch lines covering `rect`.
///
/// Lines run up-right, matching `repeating-linear-gradient(-45deg, …)`.
/// `spacing` is the perpendicular distance between adjacent lines, and
/// `offset` translates the pattern. Every returned endpoint lies inside the
/// rectangle; degenerate corner touches are omitted.
pub fn hatch_lines(rect: Rect, spacing: f32, offset: (f32, f32)) -> Vec<(Point, Point)> {
    let width = rect.w.max(0.0);
    let height = rect.h.max(0.0);
    if width <= 0.0 || height <= 0.0 || !spacing.is_finite() || spacing <= 0.0 {
        return Vec::new();
    }

    let x0 = rect.x;
    let y0 = rect.y;
    let x1 = x0 + width;
    let y1 = y0 + height;

    // Lines have the equation x + y = c. Moving between adjacent lines by
    // `spacing` perpendicular means moving by `spacing * sqrt(2)` in c.
    let step = spacing * std::f32::consts::SQRT_2;
    let phase = (offset.0 + offset.1).rem_euclid(step);
    let c_min = x0 + y0;
    let c_max = x1 + y1;
    let epsilon = 1e-4;

    let mut lines = Vec::new();
    let mut c = c_min + phase;
    while c <= c_max + epsilon {
        let start_x = x0.max(c - y1);
        let end_x = x1.min(c - y0);
        if end_x - start_x > epsilon {
            lines.push((
                Point::new(start_x, c - start_x),
                Point::new(end_x, c - end_x),
            ));
        }
        c += step;
    }
    lines
}

fn push_jittered(
    points: &mut Vec<Point>,
    rng: &mut Rng,
    point: Point,
    normal: (f32, f32),
    jitter: f32,
) {
    let amount = ((rng.next_f64() * 2.0 - 1.0) as f32) * jitter;
    points.push(Point::new(
        point.x + normal.0 * amount,
        point.y + normal.1 * amount,
    ));
}

// Each parameter is a distinct geometric input; a struct would only rename
// the call site without making the arc math clearer.
#[allow(clippy::too_many_arguments)]
fn push_arc(
    points: &mut Vec<Point>,
    rng: &mut Rng,
    center: Point,
    radius: f32,
    start_degrees: f32,
    end_degrees: f32,
    samples: usize,
    jitter: f32,
) {
    // A zero-radius corner is the meeting point of its two edges; the next
    // edge samples that point, so the arc contributes nothing.
    if radius <= f32::EPSILON {
        return;
    }
    for index in 0..samples {
        let t = index as f32 / samples as f32;
        let angle = (start_degrees + (end_degrees - start_degrees) * t).to_radians();
        let (sin, cos) = angle.sin_cos();
        let ideal = Point::new(center.x + cos * radius, center.y + sin * radius);
        push_jittered(points, rng, ideal, (cos, sin), jitter);
    }
}

fn push_edge(
    points: &mut Vec<Point>,
    rng: &mut Rng,
    start: Point,
    end: Point,
    normal: (f32, f32),
    samples: usize,
    jitter: f32,
) {
    for index in 0..samples {
        let t = index as f32 / samples as f32;
        push_jittered(points, rng, start.lerp(end, t), normal, jitter);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::theme;

    fn rect() -> Rect {
        Rect::new(10.0, 20.0, 200.0, 120.0)
    }

    fn assert_close(a: f32, b: f32, tolerance: f32) {
        assert!(
            (a - b).abs() <= tolerance,
            "expected {a} ≈ {b} (tolerance {tolerance})"
        );
    }

    #[test]
    fn rect_helpers_work() {
        let r = rect();
        assert_eq!(r.right(), 210.0);
        assert_eq!(r.bottom(), 140.0);
        let center = r.center();
        assert_eq!(center, Point::new(110.0, 80.0));
        assert!(r.contains(Point::new(10.0, 20.0)));
        assert!(r.contains(Point::new(210.0, 140.0)));
        assert!(!r.contains(Point::new(9.9, 20.0)));
        assert!(!r.contains(Point::new(10.0, 140.1)));
        let inset = r.inset(5.0);
        assert_eq!(inset, Rect::new(15.0, 25.0, 190.0, 110.0));
        assert_eq!(inset.center(), center);
    }

    #[test]
    fn contour_constructors_keep_flags() {
        let contour = Contour::new(vec![Point::new(0.0, 0.0)], false);
        assert_eq!(contour.len(), 1);
        assert!(!contour.is_empty());
        assert!(!contour.closed);
    }

    #[test]
    fn wobbly_rect_is_deterministic() {
        let a = wobbly_rect(rect(), theme::RADIUS_STICKER, "save", 2.0, 6);
        let b = wobbly_rect(rect(), theme::RADIUS_STICKER, "save", 2.0, 6);
        let c = wobbly_rect(rect(), theme::RADIUS_STICKER, "ticket-42", 2.0, 6);
        assert_eq!(a, b);
        assert_ne!(a.points, c.points);
        assert!(a.closed);
        assert_eq!(a.len(), 6 * 8);
    }

    #[test]
    fn wobble_never_exceeds_the_jitter_budget() {
        let jitter = 1.7;
        let ideal = wobbly_rect(rect(), theme::RADIUS_STICKER, "save", 0.0, 5);
        let wobbly = wobbly_rect(rect(), theme::RADIUS_STICKER, "save", jitter, 5);
        assert_eq!(ideal.len(), wobbly.len());
        assert_eq!(ideal.points.len(), 40);
        let mut moved = false;
        for (before, after) in ideal.points.iter().zip(&wobbly.points) {
            let displacement = before.distance(*after);
            assert!(
                displacement <= jitter * 1.01 + 1e-5,
                "displacement {displacement} exceeds {jitter}"
            );
            moved |= displacement > 1e-4;
        }
        assert!(
            moved,
            "the seeded jitter should displace at least one point"
        );
    }

    #[test]
    fn radii_are_clamped_to_half_the_shorter_side() {
        let tiny = Rect::new(0.0, 0.0, 10.0, 8.0);
        let contour = wobbly_rect(tiny, [100.0; 4], "save", 0.0, 3);
        for point in &contour.points {
            assert!(point.x.is_finite() && point.y.is_finite());
            assert!(point.x >= -0.001 && point.x <= 10.001);
            assert!(point.y >= -0.001 && point.y <= 8.001);
        }
    }

    #[test]
    fn wobbly_circle_is_deterministic_and_bounded() {
        let center = Point::new(50.0, 60.0);
        let a = wobbly_circle(center, 30.0, "save", 2.0, 24);
        let b = wobbly_circle(center, 30.0, "save", 2.0, 24);
        let c = wobbly_circle(center, 30.0, "ticket-42", 2.0, 24);
        assert_eq!(a, b);
        assert_ne!(a.points, c.points);
        assert_eq!(a.len(), 24);
        assert!(a.closed);
        for point in &a.points {
            let distance = center.distance(*point);
            assert!((distance - 30.0).abs() <= 2.0 * 1.01 + 1e-4);
        }
    }

    #[test]
    fn offset_rotate_and_scale_keep_closure_and_distances() {
        let contour = wobbly_rect(rect(), theme::RADIUS_STICKER, "save", 2.0, 8);
        let moved = offset_contour(&contour, 12.0, -7.0);
        assert!(moved.closed);
        assert_eq!(moved.len(), contour.len());
        for (before, after) in contour.points.iter().zip(&moved.points) {
            assert_eq!(after.x, before.x + 12.0);
            assert_eq!(after.y, before.y - 7.0);
        }

        let center = rect().center();
        let rotated = rotate_contour(&contour, center, 90.0);
        assert!(rotated.closed);
        assert_eq!(rotated.len(), contour.len());
        for source in 0..contour.points.len() {
            let next = (source + 1) % contour.points.len();
            let before = contour.points[source].distance(contour.points[next]);
            let after = rotated.points[source].distance(rotated.points[next]);
            assert_close(before, after, 1e-4);
        }

        let scaled = scale_contour(&contour, center, 2.0);
        assert!(scaled.closed);
        assert_eq!(scaled.len(), contour.len());
        for source in 0..contour.points.len() {
            let next = (source + 1) % contour.points.len();
            let before = contour.points[source].distance(contour.points[next]);
            let after = scaled.points[source].distance(scaled.points[next]);
            assert_close(before * 2.0, after, 1e-3);
        }
    }

    #[test]
    fn hatch_lines_stay_inside_the_rect_and_run_at_45_degrees() {
        let r = Rect::new(5.0, 10.0, 120.0, 80.0);
        let lines = hatch_lines(r, 8.0, theme::HATCH_OFFSET);
        assert!(!lines.is_empty());
        for (start, end) in &lines {
            for point in [start, end] {
                assert!(
                    point.x >= r.x - 1e-4
                        && point.x <= r.right() + 1e-4
                        && point.y >= r.y - 1e-4
                        && point.y <= r.bottom() + 1e-4,
                    "{point:?} escaped {r:?}"
                );
            }
            let dx = end.x - start.x;
            let dy = end.y - start.y;
            assert!(dx > 0.0);
            assert!(
                (dx + dy).abs() < 1e-3,
                "line is not at -45 degrees: dx={dx}, dy={dy}"
            );
        }
    }

    #[test]
    fn hatch_lines_reject_degenerate_input() {
        let r = Rect::new(0.0, 0.0, 10.0, 10.0);
        assert!(hatch_lines(r, 0.0, (0.0, 0.0)).is_empty());
        assert!(hatch_lines(r, -1.0, (0.0, 0.0)).is_empty());
        assert!(hatch_lines(r, f32::NAN, (0.0, 0.0)).is_empty());
        assert!(hatch_lines(Rect::new(0.0, 0.0, 0.0, 10.0), 1.0, (0.0, 0.0)).is_empty());
    }

    #[test]
    fn hatch_offset_moves_the_pattern() {
        let r = Rect::new(0.0, 0.0, 100.0, 100.0);
        let a = hatch_lines(r, 10.0, (0.0, 0.0));
        let b = hatch_lines(r, 10.0, (5.0, 0.0));
        assert_ne!(a, b);
    }
}
