//! Seeded randomness, byte-for-byte compatible with `packages/react/src/seed.ts`.
//!
//! Every imperfection in PlopUI (tilt, wobble, jitter) comes from here, never
//! from a clock or a random device, so server and client renders agree.

/// FNV-1a over UTF-16 code units, matching JavaScript's `charCodeAt`.
///
/// JavaScript hashes one 16-bit code unit at a time, so astral characters are
/// visited as their surrogate pair. Rust's `char` is a scalar value; iterating
/// `encode_utf16` reproduces the same units.
pub fn hash_string(input: &str) -> u32 {
    let mut hash: u32 = 2_166_136_261;
    for unit in input.encode_utf16() {
        hash ^= u32::from(unit);
        hash = hash.wrapping_mul(16_777_619);
    }
    hash
}

/// A deterministic `mulberry32` generator.
///
/// The sequence is identical to JavaScript's implementation, including the
/// 32-bit wraparound at every arithmetic step.
#[derive(Clone, Debug)]
pub struct Rng {
    state: u32,
}

impl Rng {
    /// Builds a generator from a string seed.
    ///
    /// A hash of zero is replaced by one, matching the TypeScript `toInt`.
    pub fn new(value: &str) -> Self {
        Self::from_number(hash_string(value))
    }

    /// Builds a generator from a numeric seed.
    ///
    /// Zero is replaced by one, matching `value >>> 0 || 1`.
    pub fn from_number(value: u32) -> Self {
        Self {
            state: if value == 0 { 1 } else { value },
        }
    }

    /// Returns the next value in `[0, 1)`.
    pub fn next_f64(&mut self) -> f64 {
        // mulberry32
        self.state = self.state.wrapping_add(0x6d2b_79f5);
        let mut t = self.state;
        t = (t ^ (t >> 15)).wrapping_mul(t | 1);
        t ^= t.wrapping_add((t ^ (t >> 7)).wrapping_mul(t | 61));
        f64::from(t ^ (t >> 14)) / 4_294_967_296.0
    }

    /// The current internal state, useful for snapshots and debugging.
    pub fn state(&self) -> u32 {
        self.state
    }
}

/// Convenience constructor for a string-seeded generator.
pub fn seed(value: &str) -> Rng {
    Rng::new(value)
}

/// JavaScript's `Math.round`: halves round toward positive infinity.
///
/// Rust's `f64::round` rounds halves away from zero, which would turn a tilt of
/// `-0.5` into `-1` where the browser produces `-0`.
pub fn js_round(value: f64) -> f64 {
    (value + 0.5).floor()
}

/// A deterministic tilt in `[-range, range]`, rounded to two decimals.
///
/// The arithmetic is done in `f64` and only rounded to `f32` at the end, so it
/// reproduces the browser's double-precision result before conversion.
pub fn seeded_tilt(value: &str, range: f32) -> f32 {
    let n = Rng::new(value).next_f64();
    let rounded = js_round((n * 2.0 - 1.0) * f64::from(range) * 100.0) / 100.0;
    rounded as f32
}

/// Picks one item from a non-empty slice, deterministically.
///
/// # Panics
///
/// Panics if `items` is empty; JavaScript's equivalent returns `undefined`,
/// which has no safe Rust counterpart.
pub fn seeded_pick<T: Copy>(value: &str, items: &[T]) -> T {
    assert!(!items.is_empty(), "seeded_pick needs at least one item");
    let index = (Rng::new(value).next_f64() * items.len() as f64).floor() as usize;
    items[index.min(items.len() - 1)]
}

#[cfg(test)]
mod tests {
    use super::*;

    fn close(actual: f64, expected: f64, tolerance: f64) {
        assert!(
            (actual - expected).abs() <= tolerance,
            "expected {expected} ± {tolerance}, got {actual}"
        );
    }

    #[test]
    fn hashes_match_the_javascript_vectors() {
        assert_eq!(hash_string("plop-ui"), 1_116_073_807);
        assert_eq!(hash_string("save"), 3_439_296_072);
        assert_eq!(hash_string("ticket-42"), 1_351_115_394);
        assert_eq!(hash_string("中文"), 1_362_277_805);
    }

    #[test]
    fn rng_matches_the_javascript_sequence() {
        let expected = [
            0.898_609_057_068_824_8,
            0.647_720_342_269_167_3,
            0.724_070_834_694_430_2,
        ];
        let mut rng = seed("plop-ui");
        for value in expected {
            close(rng.next_f64(), value, 1e-9);
        }
    }

    #[test]
    fn rng_zero_state_becomes_one() {
        let mut zero = Rng::from_number(0);
        let mut one = Rng::from_number(1);
        assert_eq!(zero.state(), 1);
        close(zero.next_f64(), one.next_f64(), 0.0);
    }

    #[test]
    fn tilts_match_the_javascript_vectors() {
        close(f64::from(seeded_tilt("save", 2.5)), -0.05, 1e-6);
        close(f64::from(seeded_tilt("ticket-42", 2.5)), -2.19, 1e-6);
    }

    #[test]
    fn js_round_rounds_negative_halves_toward_positive_infinity() {
        assert_eq!(js_round(2.5), 3.0);
        assert_eq!(js_round(-2.5), -2.0);
        assert_eq!(js_round(-0.5), 0.0);
        assert_eq!(js_round(1.49), 1.0);
    }

    #[test]
    fn picks_are_stable_and_in_range() {
        let items = ["a", "b", "c", "d"];
        let first = seeded_pick("plop-ui", &items);
        assert_eq!(first, seeded_pick("plop-ui", &items));
        assert!(items.contains(&first));
    }

    #[test]
    fn different_seeds_produce_different_streams() {
        let mut a = seed("save");
        let mut b = seed("ticket-42");
        assert_ne!(a.next_f64(), b.next_f64());
    }

    #[test]
    #[should_panic(expected = "at least one item")]
    fn picking_from_an_empty_slice_panics() {
        let empty: [u8; 0] = [];
        seeded_pick("save", &empty);
    }
}
