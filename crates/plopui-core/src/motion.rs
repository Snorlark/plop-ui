//! Motion tokens and reduced-motion decisions.
//!
//! PlopUI's `reducedMotion` setting has three values: `system` follows the OS,
//! `always` always reduces motion, and `never` always allows it. The names
//! describe the motion preference, not whether animation is enabled.

/// Tokens from `packages/tokens/src/tokens.ts`.
pub const SPRING_CURVE: [f32; 4] = [0.28, 1.75, 0.5, 1.0];
pub const SPRING_DURATION_MS: u64 = 500;
pub const SQUISH_CURVE: [f32; 4] = [0.2, 0.9, 0.3, 1.0];
pub const SQUISH_DURATION_MS: u64 = 80;
/// Interval between the three boil filters.
pub const BOIL_INTERVAL_MS: u64 = 140;

/// What the app asks for, before consulting the OS.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum MotionPreference {
    /// Follow `prefers-reduced-motion`.
    System,
    /// Always reduce motion.
    Always,
    /// Never reduce motion.
    Never,
}

impl MotionPreference {
    pub const ALL: [MotionPreference; 3] = [
        MotionPreference::System,
        MotionPreference::Always,
        MotionPreference::Never,
    ];
}

/// Resolves the app preference against the OS `prefers-reduced-motion` flag.
pub const fn motion_reduced(pref: MotionPreference, os_reduced: bool) -> bool {
    match pref {
        MotionPreference::System => os_reduced,
        MotionPreference::Always => true,
        MotionPreference::Never => false,
    }
}

/// The duration an animation should run for; zero when motion is reduced.
///
/// Callers should still perform state changes instantly under reduced motion,
/// rather than skipping them.
pub const fn duration_ms(pref: MotionPreference, os_reduced: bool, base_ms: u64) -> u64 {
    if motion_reduced(pref, os_reduced) {
        0
    } else {
        base_ms
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn system_follows_the_os() {
        assert!(motion_reduced(MotionPreference::System, true));
        assert!(!motion_reduced(MotionPreference::System, false));
    }

    #[test]
    fn always_and_never_override_the_os() {
        assert!(motion_reduced(MotionPreference::Always, false));
        assert!(motion_reduced(MotionPreference::Always, true));
        assert!(!motion_reduced(MotionPreference::Never, false));
        assert!(!motion_reduced(MotionPreference::Never, true));
    }

    #[test]
    fn reduced_motion_has_zero_duration() {
        assert_eq!(duration_ms(MotionPreference::Always, false, 500), 0);
        assert_eq!(duration_ms(MotionPreference::System, true, 500), 0);
        assert_eq!(duration_ms(MotionPreference::Never, true, 500), 500);
        assert_eq!(duration_ms(MotionPreference::System, false, 500), 500);
    }

    #[test]
    fn token_motion_values_match_typescript() {
        assert_eq!(SPRING_CURVE, [0.28, 1.75, 0.5, 1.0]);
        assert_eq!(SQUISH_CURVE, [0.2, 0.9, 0.3, 1.0]);
        assert_eq!(SPRING_DURATION_MS, 500);
        assert_eq!(SQUISH_DURATION_MS, 80);
        assert_eq!(BOIL_INTERVAL_MS, 140);
    }
}
