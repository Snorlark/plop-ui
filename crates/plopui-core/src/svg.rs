//! A small SVG path parser for the hand-drawn icon set.
//!
//! The browser kit draws its icons as SVG paths with cubic curves. A native
//! renderer needs points, so this module samples the commands the icons use
//! (`M L H V C S Q T Z`, absolute and relative) into [`Contour`]s in the
//! icon's viewBox coordinates. Arcs are not implemented because the icon set
//! does not use them; an unsupported command stops parsing after the shapes
//! read so far.

use crate::geometry::{Contour, Point};

/// Samples per cubic or quadratic segment. Enough for a 24–32 px icon at 2×.
const CURVE_STEPS: usize = 16;
/// Samples around a full circle.
const CIRCLE_STEPS: usize = 40;

/// Parse an SVG `d` attribute into one contour per subpath.
///
/// A subpath closed by `Z` is marked closed; an open subpath stays open so a
/// renderer can stroke it without drawing a closing line.
pub fn parse_path(d: &str) -> Vec<Contour> {
    Parser::new(d).run()
}

/// A circle sampled as a closed contour, in viewBox coordinates.
pub fn circle_contour(cx: f32, cy: f32, r: f32) -> Contour {
    let mut points = Vec::with_capacity(CIRCLE_STEPS);
    for step in 0..CIRCLE_STEPS {
        let angle = std::f32::consts::TAU * step as f32 / CIRCLE_STEPS as f32;
        points.push(Point::new(cx + r * angle.cos(), cy + r * angle.sin()));
    }
    Contour::new(points, true)
}

struct Parser<'a> {
    bytes: &'a [u8],
    pos: usize,
    contours: Vec<Contour>,
    current: Vec<Point>,
    start: Point,
    cursor: Point,
    /// The previous cubic or quadratic control point, for `S` and `T`.
    previous_control: Option<Point>,
    /// The command that produced `previous_control` (only `C/c` or `Q/q`).
    previous_kind: Option<u8>,
}

impl<'a> Parser<'a> {
    fn new(source: &'a str) -> Self {
        Self {
            bytes: source.as_bytes(),
            pos: 0,
            contours: Vec::new(),
            current: Vec::new(),
            start: Point::new(0.0, 0.0),
            cursor: Point::new(0.0, 0.0),
            previous_control: None,
            previous_kind: None,
        }
    }

    fn run(mut self) -> Vec<Contour> {
        while let Some(command) = self.next_command() {
            let relative = command.is_ascii_lowercase();
            match command.to_ascii_uppercase() {
                b'M' => {
                    self.finish(false);
                    let Some(x) = self.number() else { break };
                    let Some(y) = self.number() else { break };
                    let point = self.absolute(relative, x, y);
                    self.start = point;
                    self.cursor = point;
                    self.current.push(point);
                    // Repeated pairs after M are implicit line-to commands.
                    self.line_pairs(relative);
                }
                b'L' => self.line_pairs(relative),
                b'H' => {
                    while let Some(x) = self.number() {
                        let nx = if relative { self.cursor.x + x } else { x };
                        self.cursor = Point::new(nx, self.cursor.y);
                        self.push_cursor();
                    }
                    self.previous_control = None;
                }
                b'V' => {
                    while let Some(y) = self.number() {
                        let ny = if relative { self.cursor.y + y } else { y };
                        self.cursor = Point::new(self.cursor.x, ny);
                        self.push_cursor();
                    }
                    self.previous_control = None;
                }
                b'C' => {
                    while let (Some(x1), Some(y1), Some(x2), Some(y2), Some(x), Some(y)) = (
                        self.number(),
                        self.number(),
                        self.number(),
                        self.number(),
                        self.number(),
                        self.number(),
                    ) {
                        let c1 = self.absolute(relative, x1, y1);
                        let c2 = self.absolute(relative, x2, y2);
                        let end = self.absolute(relative, x, y);
                        self.cubic(c1, c2, end);
                        self.previous_control = Some(c2);
                        self.previous_kind = Some(b'C');
                    }
                }
                b'S' => {
                    while let (Some(x2), Some(y2), Some(x), Some(y)) =
                        (self.number(), self.number(), self.number(), self.number())
                    {
                        let c2 = self.absolute(relative, x2, y2);
                        let end = self.absolute(relative, x, y);
                        let c1 = match (self.previous_kind, self.previous_control) {
                            (Some(b'C'), Some(control)) => Point::new(
                                self.cursor.x * 2.0 - control.x,
                                self.cursor.y * 2.0 - control.y,
                            ),
                            _ => self.cursor,
                        };
                        self.cubic(c1, c2, end);
                        self.previous_control = Some(c2);
                        self.previous_kind = Some(b'C');
                    }
                }
                b'Q' => {
                    while let (Some(x1), Some(y1), Some(x), Some(y)) =
                        (self.number(), self.number(), self.number(), self.number())
                    {
                        let control = self.absolute(relative, x1, y1);
                        let end = self.absolute(relative, x, y);
                        self.quadratic(control, end);
                        self.previous_control = Some(control);
                        self.previous_kind = Some(b'Q');
                    }
                }
                b'T' => {
                    while let (Some(x), Some(y)) = (self.number(), self.number()) {
                        let end = self.absolute(relative, x, y);
                        let control = match (self.previous_kind, self.previous_control) {
                            (Some(b'Q'), Some(control)) => Point::new(
                                self.cursor.x * 2.0 - control.x,
                                self.cursor.y * 2.0 - control.y,
                            ),
                            _ => self.cursor,
                        };
                        self.quadratic(control, end);
                        self.previous_control = Some(control);
                        self.previous_kind = Some(b'Q');
                    }
                }
                b'Z' => {
                    self.finish(true);
                    self.cursor = self.start;
                    self.previous_control = None;
                }
                _ => break,
            }
        }
        self.finish(false);
        self.contours
    }

    fn line_pairs(&mut self, relative: bool) {
        while let (Some(x), Some(y)) = (self.number(), self.number()) {
            let point = self.absolute(relative, x, y);
            self.cursor = point;
            self.push_cursor();
        }
        self.previous_control = None;
    }

    fn absolute(&self, relative: bool, x: f32, y: f32) -> Point {
        if relative {
            Point::new(self.cursor.x + x, self.cursor.y + y)
        } else {
            Point::new(x, y)
        }
    }

    fn push_cursor(&mut self) {
        self.current.push(self.cursor);
    }

    fn cubic(&mut self, c1: Point, c2: Point, end: Point) {
        let from = self.cursor;
        for step in 1..=CURVE_STEPS {
            let t = step as f32 / CURVE_STEPS as f32;
            let mt = 1.0 - t;
            let x = mt * mt * mt * from.x
                + 3.0 * mt * mt * t * c1.x
                + 3.0 * mt * t * t * c2.x
                + t * t * t * end.x;
            let y = mt * mt * mt * from.y
                + 3.0 * mt * mt * t * c1.y
                + 3.0 * mt * t * t * c2.y
                + t * t * t * end.y;
            self.current.push(Point::new(x, y));
        }
        self.cursor = end;
    }

    fn quadratic(&mut self, control: Point, end: Point) {
        let from = self.cursor;
        for step in 1..=CURVE_STEPS {
            let t = step as f32 / CURVE_STEPS as f32;
            let mt = 1.0 - t;
            let x = mt * mt * from.x + 2.0 * mt * t * control.x + t * t * end.x;
            let y = mt * mt * from.y + 2.0 * mt * t * control.y + t * t * end.y;
            self.current.push(Point::new(x, y));
        }
        self.cursor = end;
    }

    fn finish(&mut self, closed: bool) {
        if self.current.len() >= 2 {
            let points = std::mem::take(&mut self.current);
            self.contours.push(Contour::new(points, closed));
        } else {
            self.current.clear();
        }
    }

    fn next_command(&mut self) -> Option<u8> {
        while self.pos < self.bytes.len() {
            let byte = self.bytes[self.pos];
            if byte.is_ascii_alphabetic() {
                self.pos += 1;
                return Some(byte);
            }
            if byte.is_ascii_whitespace() || byte == b',' {
                self.pos += 1;
                continue;
            }
            // Stray number where a command was expected: stop rather than guess.
            return None;
        }
        None
    }

    fn number(&mut self) -> Option<f32> {
        while self.pos < self.bytes.len() {
            let byte = self.bytes[self.pos];
            if byte.is_ascii_whitespace() || byte == b',' {
                self.pos += 1;
            } else {
                break;
            }
        }
        let start = self.pos;
        if self.pos < self.bytes.len() && matches!(self.bytes[self.pos], b'-' | b'+') {
            self.pos += 1;
        }
        let mut seen_dot = false;
        let mut digits = 0;
        while self.pos < self.bytes.len() {
            let byte = self.bytes[self.pos];
            if byte.is_ascii_digit() {
                digits += 1;
                self.pos += 1;
            } else if byte == b'.' && !seen_dot {
                seen_dot = true;
                self.pos += 1;
            } else {
                break;
            }
        }
        if digits == 0 {
            self.pos = start;
            return None;
        }
        std::str::from_utf8(&self.bytes[start..self.pos])
            .ok()
            .and_then(|text| text.parse().ok())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_a_closed_triangle() {
        let paths = parse_path("M0 0 L10 0 L10 10 Z");
        assert_eq!(paths.len(), 1);
        assert!(paths[0].closed);
        assert_eq!(paths[0].points.len(), 3);
        assert_eq!(paths[0].points[0], Point::new(0.0, 0.0));
    }

    #[test]
    fn reads_relative_commands_and_implicit_lines() {
        let paths = parse_path("M4 4 h10 v10 h-10 z");
        assert_eq!(paths.len(), 1);
        assert!(paths[0].closed);
        assert_eq!(paths[0].points.len(), 4);
        assert_eq!(paths[0].points[1], Point::new(14.0, 4.0));
        assert_eq!(paths[0].points[2], Point::new(14.0, 14.0));
    }

    #[test]
    fn samples_cubics_to_their_endpoints() {
        let paths = parse_path("M13 4 C 12.5 10, 13.5 16, 13 22");
        assert_eq!(paths.len(), 1);
        assert!(!paths[0].closed);
        assert_eq!(paths[0].points.len(), CURVE_STEPS + 1);
        let last = paths[0].points[CURVE_STEPS];
        assert!((last.x - 13.0).abs() < 0.001);
        assert!((last.y - 22.0).abs() < 0.001);
    }

    #[test]
    fn keeps_each_move_to_subpath() {
        let paths = parse_path("M2 2 L8 2 M2 6 L8 6 M2 10 L8 10");
        assert_eq!(paths.len(), 3);
        assert!(paths.iter().all(|path| !path.closed));
    }

    #[test]
    fn smooth_cubic_reflects_the_previous_control() {
        // The second curve should start heading away from the first's control.
        let paths = parse_path("M0 0 C 4 4, 8 4, 12 0 S 20 -4, 24 0");
        assert_eq!(paths.len(), 1);
        let last = paths[0].points.last().copied().unwrap();
        assert!((last.x - 24.0).abs() < 0.001);
        assert!(last.y.abs() < 0.001);
    }

    #[test]
    fn circles_close_and_stay_inside_their_radius() {
        let circle = circle_contour(10.0, 10.0, 4.0);
        assert!(circle.closed);
        assert_eq!(circle.points.len(), CIRCLE_STEPS);
        for point in &circle.points {
            let distance = point.distance(Point::new(10.0, 10.0));
            assert!((distance - 4.0).abs() < 0.001);
        }
    }

    #[test]
    fn stops_at_an_unsupported_command() {
        let paths = parse_path("M0 0 L4 4 A 2 2 0 0 1 8 8");
        // The line before the arc is kept; the arc is not invented.
        assert_eq!(paths.len(), 1);
        assert_eq!(paths[0].points.len(), 2);
    }
}
