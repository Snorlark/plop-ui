import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithPlop } from "../../test/render";
import { Button } from "../Button/Button";
import { toast } from "../Toast/store";
import { BURST_STYLES } from "./burst";

/* jsdom has no Web Animations: stand one in so the marks stay on the page long enough to count. */
const marks = () => document.querySelectorAll("svg[viewBox='-13 -13 26 26']").length;

beforeEach(() => {
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: vi.fn(() => ({ onfinish: null })) });
});
afterEach(() => {
  delete (Element.prototype as { animate?: unknown }).animate;
  vi.useRealTimers();
});

describe("burst", () => {
  it("is off by default: a plain press throws nothing and doesn't shake", () => {
    renderWithPlop(<Button variant="tomato">Delete</Button>, { reducedMotion: "never" });
    fireEvent.click(screen.getByRole("button"));
    expect(marks()).toBe(0);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-shake");
  });

  it.each(BURST_STYLES)("throws %s marks when asked", (style) => {
    renderWithPlop(<Button burst={style}>Go</Button>, { reducedMotion: "never" });
    fireEvent.click(screen.getByRole("button"));
    expect(marks()).toBeGreaterThan(0);
  });

  it("shakes for the failure styles (poof, zap, drops) and not for the celebrations", () => {
    renderWithPlop(
      <>
        <Button burst="zap">Retry</Button>
        <Button burst="drops">Oops</Button>
        <Button burst="hearts">Like</Button>
        <Button burst="stars">Win</Button>
      </>,
      { reducedMotion: "never" },
    );
    for (const name of ["Retry", "Oops", "Like", "Win"]) fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.getByRole("button", { name: "Retry" })).toHaveAttribute("data-shake");
    expect(screen.getByRole("button", { name: "Oops" })).toHaveAttribute("data-shake");
    expect(screen.getByRole("button", { name: "Like" })).not.toHaveAttribute("data-shake");
    expect(screen.getByRole("button", { name: "Win" })).not.toHaveAttribute("data-shake");
  });

  it("skips the marks under reduced motion", () => {
    renderWithPlop(<Button burst="stars">Win</Button>, { reducedMotion: "always" });
    fireEvent.click(screen.getByRole("button"));
    expect(marks()).toBe(0);
  });

  it("works from the keyboard: Enter on a button with a burst throws marks", () => {
    renderWithPlop(<Button burst="sparkle">Save</Button>, { reducedMotion: "never" });
    const button = screen.getByRole("button");
    button.focus();
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.click(button);
    expect(marks()).toBeGreaterThan(0);
  });
});

describe("toast burst and tint", () => {
  it("celebrates a success toast that asks for it, once the stamp lands", () => {
    vi.useFakeTimers();
    renderWithPlop(<span />, { reducedMotion: "never" });
    act(() => {
      toast.success("Saved!", { burst: true });
    });
    expect(marks()).toBe(0);
    act(() => vi.advanceTimersByTime(320));
    expect(marks()).toBeGreaterThan(0);
  });

  it("shakes an error toast that asks for a burst, and tints the wash red", () => {
    vi.useFakeTimers();
    renderWithPlop(<span />, { reducedMotion: "never" });
    act(() => {
      toast.error("Couldn't send", { burst: true });
    });
    const zone = screen.getByRole("status");
    expect(zone).toHaveAttribute("data-kind", "error");
    act(() => vi.advanceTimersByTime(320));
    expect(zone.querySelector("[data-shake]")).not.toBeNull();
  });

  it("leaves toasts quiet without a burst, and tints the wash green for success", () => {
    vi.useFakeTimers();
    renderWithPlop(<span />, { reducedMotion: "never" });
    act(() => {
      toast.success("Saved!");
    });
    act(() => vi.advanceTimersByTime(320));
    expect(marks()).toBe(0);
    expect(screen.getByRole("status")).toHaveAttribute("data-kind", "success");
  });
});
