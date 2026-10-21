import { surfaceNames, type SurfaceName } from "@plop-ui/tokens";

export const SURFACE_COOKIE = "plop-surface";
export const THEME_COOKIE = "plop-theme";

export type Theme = "system" | "light" | "dark";

export function parseSurface(value: string | undefined): SurfaceName {
  return surfaceNames.includes(value as SurfaceName) ? (value as SurfaceName) : "poster";
}

export function parseTheme(value: string | undefined): Theme {
  return value === "light" || value === "dark" ? value : "system";
}
