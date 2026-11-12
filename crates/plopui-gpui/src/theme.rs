use plopui_core::theme::{SurfaceMode, SurfaceName};

/// The surface a gallery (or app) is printed on. Components read only this.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PlopTheme {
    pub surface: SurfaceName,
    pub dark: bool,
}

impl Default for PlopTheme {
    fn default() -> Self {
        Self {
            surface: SurfaceName::Poster,
            dark: false,
        }
    }
}

impl gpui_kit::Global for PlopTheme {}

impl PlopTheme {
    /// Publishes the app-wide surface. Call once at startup; components that
    /// own a `PlopTheme` still render from that field, so previews and
    /// per-section surfaces keep working.
    pub fn init(cx: &mut gpui_kit::App) {
        if cx.try_global::<Self>().is_none() {
            cx.set_global(Self::default());
        }
    }

    /// The surface published by [`PlopTheme::init`], or Poster light when the
    /// host app never called it.
    pub fn current(cx: &gpui_kit::App) -> Self {
        cx.try_global::<Self>().copied().unwrap_or_default()
    }

    pub fn set(cx: &mut gpui_kit::App, theme: Self) {
        cx.set_global(theme);
    }

    pub fn mode(self) -> SurfaceMode {
        let surface = self.surface.surface(self.dark);
        if self.dark {
            surface.dark
        } else {
            surface.light
        }
    }

    pub fn with_surface(mut self, surface: SurfaceName) -> Self {
        self.surface = surface;
        self
    }

    pub fn with_dark(mut self, dark: bool) -> Self {
        self.dark = dark;
        self
    }

    /// The same surface with paper text colors. Use it for anything drawn on
    /// a cream card, field or sheet: on a dark page the page text is cream,
    /// but paper text stays ink, exactly like the React kit's `.plop-paper`.
    pub fn on_paper(self) -> Self {
        Self {
            surface: self.surface,
            dark: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn on_paper_keeps_the_surface_but_turns_the_lights_on() {
        for surface in SurfaceName::ALL {
            let dark = PlopTheme {
                surface,
                dark: true,
            };
            let paper = dark.on_paper();
            assert_eq!(paper.surface, surface);
            assert!(!paper.dark);
            assert_eq!(paper.mode().on, surface.surface(false).light.on);
        }
    }

    #[test]
    fn mode_reads_the_selected_surface_and_lightness() {
        for surface in SurfaceName::ALL {
            let light = PlopTheme {
                surface,
                dark: false,
            };
            assert_eq!(light.mode().bg, surface.surface(false).light.bg);

            let dark = PlopTheme {
                surface,
                dark: true,
            };
            assert_eq!(dark.mode().bg, surface.surface(true).dark.bg);
        }
    }
}
