import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { usePlop } from "../PlopProvider/context";
import { PlopProvider } from "../PlopProvider/PlopProvider";
import { useBoil } from "./useBoil";
import { HAPTIC_PATTERNS, useHaptics } from "./useHaptics";
import { useReducedMotion } from "./useReducedMotion";
import { useSound } from "./useSound";

const wrap =
  (props: Partial<Parameters<typeof PlopProvider>[0]> = {}) =>
  ({ children }: { children: ReactNode }) => <PlopProvider {...props}>{children}</PlopProvider>;

describe("useHaptics", () => {
  it("vibrates with the documented patterns", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    const { result } = renderHook(() => useHaptics(), { wrapper: wrap() });
    result.current.tap();
    result.current.success();
    result.current.error();
    expect(vibrate.mock.calls).toEqual([[HAPTIC_PATTERNS.tap], [HAPTIC_PATTERNS.success], [HAPTIC_PATTERNS.error]]);
    expect(result.current.enabled).toBe(true);
  });

  it("does nothing when turned off", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    const { result } = renderHook(() => useHaptics(), { wrapper: wrap({ haptics: false }) });
    result.current.tap();
    expect(vibrate).not.toHaveBeenCalled();
    expect(result.current.enabled).toBe(false);
  });

  it("without the Vibration API, does nothing on desktop and uses the iOS switch proxy on touch devices", () => {
    Object.defineProperty(navigator, "vibrate", { value: undefined, configurable: true });
    const { result } = renderHook(() => useHaptics(), { wrapper: wrap() });
    result.current.tap();
    // Desktop Firefox and Safari: no haptics, and nothing that could take focus.
    expect(document.querySelector("input[switch]")).toBeNull();
    Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
    result.current.tap();
    expect(document.querySelector("input[switch]")).not.toBeNull();
    Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true });
  });
});

describe("nested PlopProvider", () => {
  it("inherits haptics, sound and motion from the parent unless set", () => {
    const nested = ({ children }: { children: ReactNode }) => (
      <PlopProvider haptics={false} sound reducedMotion="always">
        <PlopProvider surface="kraft">{children}</PlopProvider>
      </PlopProvider>
    );
    expect(renderHook(() => usePlop(), { wrapper: nested }).result.current).toEqual({ haptics: false, sound: true, reducedMotion: "always" });

    const overridden = ({ children }: { children: ReactNode }) => (
      <PlopProvider haptics={false}>
        <PlopProvider haptics>{children}</PlopProvider>
      </PlopProvider>
    );
    expect(renderHook(() => useHaptics().enabled, { wrapper: overridden }).result.current).toBe(true);
  });
});

describe("PlopProvider surface", () => {
  it("keeps the surrounding surface when none is given, so a page-level switch reaches it", () => {
    const { container } = render(
      <div data-plop-surface="mat">
        <PlopProvider>
          <span>inside</span>
        </PlopProvider>
      </div>,
    );
    const root = container.querySelector("[data-plop-filters]");
    expect(root).not.toHaveAttribute("data-plop-surface");
    expect(root?.closest("[data-plop-surface]")).toHaveAttribute("data-plop-surface", "mat");
  });
});

describe("useReducedMotion", () => {
  it("follows the provider setting", () => {
    expect(renderHook(() => useReducedMotion(), { wrapper: wrap({ reducedMotion: "always" }) }).result.current).toBe(true);
    expect(renderHook(() => useReducedMotion(), { wrapper: wrap({ reducedMotion: "never" }) }).result.current).toBe(false);
  });

  it("follows the OS under system", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (q) => ({ matches: true, media: q, addEventListener: () => {}, removeEventListener: () => {} }) as unknown as MediaQueryList,
    );
    expect(renderHook(() => useReducedMotion(), { wrapper: wrap() }).result.current).toBe(true);
  });
});

describe("useBoil", () => {
  it("cycles the wobble filters while active", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBoil({ seed: 1 }), { wrapper: wrap({ reducedMotion: "never" }) });
    const first = result.current.filter;
    act(() => vi.advanceTimersByTime(140));
    expect(result.current.filter).not.toBe(first);
    expect(result.current.filter).toMatch(/^url\(#plop-wob[123]\)$/);
    vi.useRealTimers();
  });

  it("holds still under reduced motion", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBoil({ seed: 1 }), { wrapper: wrap({ reducedMotion: "always" }) });
    const first = result.current.filter;
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.filter).toBe(first);
    vi.useRealTimers();
  });

  it("holds still when inactive", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBoil({ seed: 2, active: false }), { wrapper: wrap({ reducedMotion: "never" }) });
    const first = result.current.filter;
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.filter).toBe(first);
    vi.useRealTimers();
  });
});

describe("useSound", () => {
  it("stays silent unless sound is on", () => {
    const Ctor = vi.fn();
    Object.defineProperty(window, "AudioContext", { value: Ctor, configurable: true });
    const { result } = renderHook(() => useSound(), { wrapper: wrap() });
    result.current("down");
    expect(Ctor).not.toHaveBeenCalled();
  });

  it("never throws when audio is blocked", () => {
    Object.defineProperty(window, "AudioContext", {
      value: vi.fn(() => {
        throw new Error("blocked");
      }),
      configurable: true,
    });
    const { result } = renderHook(() => useSound(), { wrapper: wrap({ sound: true }) });
    expect(() => result.current("up")).not.toThrow();
  });
});

describe("PlopProvider", () => {
  it("sets the surface, theme and motion attributes and renders the filters", () => {
    render(
      <PlopProvider surface="kraft" theme="dark" reducedMotion="always" data-testid="root">
        hi
      </PlopProvider>,
    );
    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-plop-surface", "kraft");
    expect(root).toHaveAttribute("data-plop-theme", "dark");
    expect(root).toHaveAttribute("data-plop-motion", "reduce");
    expect(root).toHaveClass("plop-surface");
    expect(root.querySelector("#plop-wob1")).not.toBeNull();
  });

  it("follows the system theme by default and can skip painting", () => {
    render(
      <PlopProvider paint={false} reducedMotion="never" data-testid="root">
        hi
      </PlopProvider>,
    );
    const root = screen.getByTestId("root");
    expect(root).not.toHaveAttribute("data-plop-theme");
    expect(root).toHaveAttribute("data-plop-motion", "full");
    expect(root).not.toHaveClass("plop-surface");
  });
});
