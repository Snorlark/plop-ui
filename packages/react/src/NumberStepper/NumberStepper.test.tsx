import { createRef, useState } from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { color, onFill, surfaceNames, surfaces } from "@plop-ui/tokens";
import { renderWithPlop } from "../../test/render";
import { contrastRatio } from "../contrast";
import { NumberStepper } from "./NumberStepper";

const input = () => screen.getByRole("spinbutton");
const minus = () => screen.getByRole("button", { name: /decrease/i });
const plus = () => screen.getByRole("button", { name: /increase/i });

describe("NumberStepper", () => {
  it("is a labelled native number input with named − and + buttons", () => {
    const ref = createRef<HTMLInputElement>();
    renderWithPlop(<NumberStepper ref={ref} label="Quantity" min={1} max={9} defaultValue={2} />);
    expect(input()).toBe(ref.current);
    expect(input()).toHaveAttribute("type", "number");
    expect(input()).toHaveAccessibleName("Quantity");
    expect(input()).toHaveAttribute("min", "1");
    expect(input()).toHaveAttribute("max", "9");
    expect(input()).toHaveValue(2);
    expect(screen.getByRole("button", { name: "Decrease Quantity" })).toHaveAttribute("aria-controls", input().id);
    expect(screen.getByRole("button", { name: "Increase Quantity" })).toBeInTheDocument();
  });

  it("steps with ArrowUp/ArrowDown and jumps with Home/End", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithPlop(<NumberStepper label="Quantity" min={1} max={10} step={2} defaultValue={3} onValueChange={onValueChange} />);
    await user.click(input());
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveValue(5);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input()).toHaveValue(1);
    await user.keyboard("{ArrowDown}");
    expect(input()).toHaveValue(1);
    await user.keyboard("{End}");
    // 10 isn't on a step from 1, so the top is 9.
    expect(input()).toHaveValue(9);
    await user.keyboard("{Home}");
    expect(input()).toHaveValue(1);
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([5, 3, 1, 9, 1]);
  });

  it("leaves Home/End alone when there is no limit on that side", () => {
    renderWithPlop(<NumberStepper label="Count" defaultValue={4} />);
    const end = fireEvent.keyDown(input(), { key: "End" });
    expect(end).toBe(true); // not prevented
    expect(input()).toHaveValue(4);
  });

  it("respects a consumer that prevents a key's default", () => {
    renderWithPlop(<NumberStepper label="Count" defaultValue={4} onKeyDown={(e) => e.preventDefault()} />);
    fireEvent.keyDown(input(), { key: "ArrowUp" });
    expect(input()).toHaveValue(4);
  });

  it("disables − and + at the limits and announces button presses", async () => {
    const user = userEvent.setup();
    renderWithPlop(<NumberStepper label="Quantity" min={1} max={3} defaultValue={2} />);
    await user.click(plus());
    expect(input()).toHaveValue(3);
    expect(plus()).toBeDisabled();
    expect(minus()).toBeEnabled();
    expect(screen.getByText("3", { selector: "[aria-live]" })).toBeInTheDocument();
    await user.click(minus());
    await user.click(minus());
    expect(input()).toHaveValue(1);
    expect(minus()).toBeDisabled();
    expect(screen.getByText("1", { selector: "[aria-live]" })).toBeInTheDocument();
  });

  it("moves focus to the input when the focused button disables at a limit", async () => {
    const user = userEvent.setup();
    renderWithPlop(<NumberStepper label="Quantity" min={0} max={1} defaultValue={0} />);
    await user.tab(); // minus is disabled at 0, so the first stop is the input
    expect(input()).toHaveFocus();
    await user.tab();
    expect(plus()).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(input()).toHaveValue(1);
    expect(plus()).toBeDisabled();
    expect(input()).toHaveFocus();
  });

  it("lets you type freely, then clamps and snaps on blur", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithPlop(<><NumberStepper label="Quantity" min={1} max={20} defaultValue={2} onValueChange={onValueChange} /><button>Next</button></>);
    await user.tripleClick(input());
    await user.keyboard("{Backspace}");
    expect(input()).toHaveValue(null); // empty while editing, not snapped back yet
    await user.keyboard("12");
    expect(input()).toHaveValue(12);
    expect(onValueChange).toHaveBeenLastCalledWith(12);
    await user.keyboard("0"); // 120, out of range: waits for blur
    expect(onValueChange).toHaveBeenLastCalledWith(12);
    await user.tab();
    expect(input()).toHaveValue(20);
    expect(onValueChange).toHaveBeenLastCalledWith(20);
  });

  it("restores the last value when left empty, and Enter commits what was typed", async () => {
    const user = userEvent.setup();
    renderWithPlop(<><NumberStepper label="Quantity" min={0} max={10} defaultValue={4} /><button>Next</button></>);
    await user.tripleClick(input());
    await user.keyboard("{Backspace}");
    await user.tab();
    expect(input()).toHaveValue(4);
    await user.tripleClick(input());
    await user.keyboard("99{Enter}");
    expect(input()).toHaveValue(10);
  });

  it("keeps controlled values until the parent updates them", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = renderWithPlop(<NumberStepper label="Quantity" value={2} onValueChange={change} />);
    await user.click(plus());
    expect(change).toHaveBeenCalledWith(3);
    expect(input()).toHaveValue(2);
    rerender(<NumberStepper label="Quantity" value={5} onValueChange={change} />);
    expect(input()).toHaveValue(5);
  });

  it("works as a controlled cart quantity", async () => {
    const user = userEvent.setup();
    function Cart() {
      const [qty, setQty] = useState(1);
      return <><NumberStepper label="Matcha latte" hideLabel value={qty} onValueChange={setQty} min={1} max={9} /><p>Total {qty * 180}</p></>;
    }
    renderWithPlop(<Cart />);
    await user.click(screen.getByRole("button", { name: "Increase Matcha latte" }));
    expect(screen.getByText("Total 360")).toBeInTheDocument();
  });

  it("submits its value with the form and resets to the default", async () => {
    renderWithPlop(<form data-testid="form"><NumberStepper label="Quantity" name="qty" defaultValue={2} /></form>);
    const form = screen.getByTestId("form") as HTMLFormElement;
    fireEvent.click(plus());
    expect(new FormData(form).get("qty")).toBe("3");
    await act(async () => { form.reset(); await Promise.resolve(); });
    expect(input()).toHaveValue(2);
  });

  it("locks everything when disabled or read-only", () => {
    const { rerender } = renderWithPlop(<NumberStepper label="Quantity" defaultValue={2} disabled />);
    expect(input()).toBeDisabled();
    expect(minus()).toBeDisabled();
    expect(plus()).toBeDisabled();
    rerender(<NumberStepper label="Quantity" defaultValue={2} readOnly />);
    fireEvent.keyDown(input(), { key: "ArrowUp" });
    expect(input()).toHaveValue(2);
    expect(plus()).toBeDisabled();
  });

  it("handles fractional steps without float drift", () => {
    renderWithPlop(<NumberStepper label="Kilos" min={0} max={1} step={0.1} defaultValue={0.2} />);
    fireEvent.click(plus());
    expect(input()).toHaveValue(0.3);
    expect(input()).toHaveAttribute("inputmode", "decimal");
  });

  it("uses custom button names and keeps the label for screen readers when hidden", () => {
    renderWithPlop(<NumberStepper label="Hojicha" hideLabel decrementLabel="Remove one" incrementLabel="Add one" />);
    expect(screen.getByRole("button", { name: "Remove one" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add one" })).toBeInTheDocument();
    expect(input()).toHaveAccessibleName("Hojicha");
  });

  describe("with onRemove", () => {
    const trash = (name = "Remove item") => screen.getByRole("button", { name });

    it("keeps − disabled at min when onRemove isn't passed", () => {
      renderWithPlop(<NumberStepper label="Quantity" min={1} defaultValue={1} />);
      expect(minus()).toBeDisabled();
      expect(screen.queryByRole("button", { name: "Remove item" })).not.toBeInTheDocument();
    });

    it("turns − into an enabled trash button at min that calls onRemove", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const onValueChange = vi.fn();
      renderWithPlop(<NumberStepper label="Quantity" min={1} defaultValue={1} onRemove={onRemove} onValueChange={onValueChange} />);
      expect(trash()).toBeEnabled();
      expect(trash()).not.toHaveAttribute("aria-controls");
      expect(screen.queryByRole("button", { name: /decrease/i })).not.toBeInTheDocument();
      await user.click(trash());
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(input()).toHaveValue(1);
    });

    it("keeps focus on the same button when − swaps to trash, and Space removes", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      renderWithPlop(<NumberStepper label="Quantity" min={1} max={9} defaultValue={2} onRemove={onRemove} />);
      await user.tab();
      const button = minus();
      expect(button).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(input()).toHaveValue(1);
      expect(trash()).toBe(button);
      expect(button).toHaveFocus();
      expect(onRemove).not.toHaveBeenCalled();
      await user.keyboard(" ");
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("turns back into − when the value leaves min", async () => {
      const user = userEvent.setup();
      renderWithPlop(<NumberStepper label="Quantity" min={1} defaultValue={1} onRemove={() => {}} />);
      await user.click(plus());
      expect(screen.queryByRole("button", { name: "Remove item" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Decrease Quantity" })).toHaveAttribute("aria-controls", input().id);
    });

    it("never removes from the keyboard on the input", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      renderWithPlop(<NumberStepper label="Quantity" min={1} defaultValue={2} onRemove={onRemove} />);
      await user.click(input());
      await user.keyboard("{ArrowDown}{ArrowDown}{Home}");
      expect(input()).toHaveValue(1);
      expect(onRemove).not.toHaveBeenCalled();
    });

    it("announces the removal even after the row unmounts", async () => {
      const user = userEvent.setup();
      function Cart() {
        const [inCart, setInCart] = useState(true);
        return inCart ? <NumberStepper label="Matcha latte" hideLabel min={1} defaultValue={1} removeLabel="Remove Matcha latte" removedMessage="Matcha latte removed" onRemove={() => setInCart(false)} /> : <p>Cart is empty</p>;
      }
      renderWithPlop(<Cart />);
      await user.click(trash("Remove Matcha latte"));
      expect(screen.getByText("Cart is empty")).toBeInTheDocument();
      expect(await screen.findByText("Matcha latte removed", { selector: "[aria-live]" })).toBeInTheDocument();
    });

    it("marks the trash button so it turns red on hover and press, and leaves − alone", async () => {
      const user = userEvent.setup();
      renderWithPlop(<NumberStepper label="Quantity" min={1} defaultValue={2} onRemove={() => {}} />);
      expect(minus().className).not.toMatch(/trash/);
      await user.click(minus());
      expect(trash().className).toMatch(/trash/);
    });

    it("locks the trash button when disabled or read-only", () => {
      const onRemove = vi.fn();
      const { rerender } = renderWithPlop(<NumberStepper label="Quantity" min={1} defaultValue={1} onRemove={onRemove} disabled />);
      expect(trash()).toBeDisabled();
      rerender(<NumberStepper label="Quantity" min={1} defaultValue={1} onRemove={onRemove} readOnly />);
      expect(trash()).toBeDisabled();
      fireEvent.click(trash());
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  it("draws the same seeded tilt on every render", () => {
    const tilts = () => [...document.querySelectorAll<HTMLElement>("[style*='tilt']")].map((el) => el.getAttribute("style"));
    const first = renderWithPlop(<NumberStepper label="Quantity" seed="cart-1" />);
    const drawn = tilts();
    expect(drawn).toHaveLength(3); // the paper box and both stickers
    first.unmount();
    renderWithPlop(<NumberStepper label="Quantity" seed="cart-1" />);
    expect(tilts()).toEqual(drawn);
  });

  it("uses AA text on every surface and readable ink on the paper box", () => {
    for (const surface of surfaceNames) for (const theme of ["light", "dark"] as const) {
      const { on, bg } = surfaces[surface][theme];
      expect(contrastRatio(on, bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(color.inkText, color.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(color.ink, color.paper)).toBeGreaterThanOrEqual(3);
    expect(onFill.mustard.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
