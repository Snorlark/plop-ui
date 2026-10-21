"use client";

import { useHaptics } from "@plop-ui/react";
import { surfaceNames, surfaces, type SurfaceName } from "@plop-ui/tokens";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SURFACE_COOKIE, THEME_COOKIE, type Theme } from "../surface";

const chip: Record<SurfaceName, string> = {
  poster: "radial-gradient(rgba(40,72,216,.3) 1px, transparent 1.4px) 0 0 / 6px 6px, #EEE7D6",
  mat: "linear-gradient(rgba(255,248,231,.35) 1.5px, transparent 1.5px) 0 0 / 10px 10px, linear-gradient(90deg, rgba(255,248,231,.35) 1.5px, transparent 1.5px) 0 0 / 10px 10px, #2E6B55",
  notebook: "linear-gradient(90deg, transparent 8px, #E79C9C 8px 10px, transparent 10px), repeating-linear-gradient(#F8F4E9 0 6px, #BFCDF0 6px 7px)",
  kraft: "radial-gradient(rgba(90,60,30,.35) 1px, transparent 1.4px) 0 0 / 5px 5px, #C69C6D",
  riso: "radial-gradient(rgba(210,56,30,.4) 1.4px, transparent 1.8px) 0 0 / 6px 6px, #F6A9B8",
};

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Stores the surface and theme in cookies, then refreshes so the server
 * re-renders the page's PlopProvider on the new paper.
 */
export function SurfaceSwitcher({ surface, theme }: { surface: SurfaceName; theme: Theme }) {
  const router = useRouter();
  const haptics = useHaptics();
  const [current, setCurrent] = useState(surface);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [, startTransition] = useTransition();

  const pickSurface = (next: SurfaceName) => {
    setCurrent(next);
    setCookie(SURFACE_COOKIE, next);
    haptics.tap();
    startTransition(() => router.refresh());
  };

  const pickTheme = (next: Theme) => {
    setCurrentTheme(next);
    setCookie(THEME_COOKIE, next);
    startTransition(() => router.refresh());
  };

  return (
    <div className="row" style={{ gap: "12px 26px" }}>
      <fieldset className="surfaces">
        <legend>Surface</legend>
        {surfaceNames.map((name) => (
          <label className="swatch" key={name}>
            <input type="radio" name="surface" value={name} checked={current === name} onChange={() => pickSurface(name)} />
            <span className="swatch__chip" style={{ background: chip[name] }} />
            <span>{surfaces[name].label}</span>
          </label>
        ))}
      </fieldset>
      <label className="theme-pick">
        Theme
        <select value={currentTheme} onChange={(e) => pickTheme(e.target.value as Theme)}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  );
}
