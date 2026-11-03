import { createRef } from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { color, surfaceNames, surfaces } from "@plop-ui/tokens";
import { renderWithPlop } from "../../test/render";
import { contrastRatio } from "../contrast";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("uses a labelled native range with the requested bounds and form value", () => {
    const ref = createRef<HTMLInputElement>();
    renderWithPlop(<form data-testid="form"><Slider ref={ref} label="Radius" id="radius" name="radius" min={0} max={2} step={0.1} defaultValue={1} showValue formatValue={(v) => `${v}×`} /></form>);
    const slider = screen.getByRole("slider", { name: "Radius" });
    expect(ref.current).toBe(slider);
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "2");
    expect(slider).toHaveAttribute("step", "0.1");
    expect(slider).toHaveAccessibleName("Radius");
    expect(slider).toHaveAttribute("aria-valuetext", "1×");
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("radius")).toBe("1");
    expect(screen.getByText("1×")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps keyboard focus and press feedback while leaving native adjustment keys unhandled", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    const onBlur = vi.fn();
    renderWithPlop(<><Slider label="Pressure" onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={onBlur} /><button>Next</button></>);
    const slider = screen.getByRole("slider");
    await user.tab();
    expect(slider).toHaveFocus();
    for (const key of ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]) {
      fireEvent.keyDown(slider, { key });
      expect(slider).toHaveAttribute("data-pressed");
      expect(onKeyDown.mock.calls.at(-1)?.[0].defaultPrevented).toBe(false);
      fireEvent.keyUp(slider, { key });
      expect(slider).not.toHaveAttribute("data-pressed");
    }
    await user.keyboard("[ArrowRight>]");
    await user.tab();
    expect(slider).not.toHaveAttribute("data-pressed");
    expect(screen.getByRole("button")).toHaveFocus();
    expect(onKeyUp).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    // JSDOM has no range-key defaults: browser tests verify actual numeric adjustment.
  });

  it("respects a consumer that prevents a key's default action", () => {
    renderWithPlop(<Slider label="Pressure" onKeyDown={(e) => e.preventDefault()} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).not.toHaveAttribute("data-pressed");
  });

  it("supports uncontrolled updates and calls the native event before the numeric callback", () => {
    const calls: string[] = [];
    renderWithPlop(<Slider label="Pressure" defaultValue={20} showValue onChange={(e) => calls.push(`event:${e.currentTarget.value}`)} onValueChange={(v) => calls.push(`value:${v}`)} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "60" } });
    expect(screen.getByRole("slider")).toHaveValue("60");
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(calls).toEqual(["event:60", "value:60"]);
  });

  it("keeps controlled values until the parent updates them", () => {
    const change = vi.fn();
    const { rerender } = renderWithPlop(<Slider label="Pressure" value={30} onValueChange={change} showValue />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "40" } });
    expect(change).toHaveBeenCalledWith(40);
    expect(screen.getByRole("slider")).toHaveValue("30");
    expect(screen.getByText("30")).toBeInTheDocument();
    rerender(<Slider label="Pressure" value={50} showValue />);
    expect(screen.getByRole("slider")).toHaveValue("50");
  });

  it.each([
    [undefined, 0, 100, 1, "50"],
    [-5, 0, 100, 1, "0"],
    [200, 0, 100, 1, "100"],
    [100, 0, 100, 30, "90"],
    [0.36, 0, 1, 0.1, "0.4"],
    [-0.36, -1, 1, 0.1, "-0.4"],
    [0.365, 0, 1, "any", "0.365"],
    [5, 5, 5, 1, "5"],
    [NaN, 0, 100, 0, "50"],
  ] as const)("normalizes value %s in %s…%s at step %s", (value, min, max, step, expected) => {
    renderWithPlop(<Slider label="Pressure" value={value} min={min} max={max} step={step} />);
    expect(screen.getByRole("slider")).toHaveValue(expected);
  });

  it("restores the initial uncontrolled value on form reset, unless cancelled", async () => {
    renderWithPlop(<form data-testid="form"><Slider label="Pressure" defaultValue={20} showValue /></form>);
    const slider = screen.getByRole("slider");
    const form = screen.getByTestId("form") as HTMLFormElement;
    fireEvent.change(slider, { target: { value: "60" } });
    await act(async () => form.reset());
    expect(slider).toHaveValue("20");
    expect(screen.getByText("20")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "60" } });
    form.addEventListener("reset", (e) => e.preventDefault(), { once: true });
    await act(async () => form.reset());
    expect(slider).toHaveValue("60");
  });

  it("skips disabled inputs in the tab order and preserves custom accessible text", async () => {
    renderWithPlop(<><Slider label="Pressure" disabled /><Slider label="Volume" formatValue={(v) => `${v}%`} aria-valuetext="Half volume" /><button>Next</button></>);
    expect(screen.getByRole("slider", { name: "Pressure" })).toBeDisabled();
    await userEvent.tab();
    expect(screen.getByRole("slider", { name: "Volume" })).toHaveFocus();
    expect(screen.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuetext", "Half volume");
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("reuses stable seeded imperfections on rerender", () => {
    const { container, rerender } = renderWithPlop(<Slider label="Pressure" seed="pencil" value={20} />);
    const track = container.querySelector("path")!.getAttribute("d");
    const tilt = container.querySelector('[style*="--slider-tilt"]')!.getAttribute("style");
    rerender(<Slider label="Pressure" seed="pencil" value={80} />);
    expect(container.querySelector("path")).toHaveAttribute("d", track);
    expect(container.querySelector('[style*="--slider-tilt"]')).toHaveAttribute("style", tilt);
  });

  it("uses AA text roles on all surfaces and contrasting ink on the paper track and mustard thumb", () => {
    for (const surface of surfaceNames) for (const theme of ["light", "dark"] as const) {
      const { on, onSoft, bg } = surfaces[surface][theme];
      expect(contrastRatio(on, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(onSoft, bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(color.ink, color.paper)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color.ink, color.mustard)).toBeGreaterThanOrEqual(3);
  });
});
