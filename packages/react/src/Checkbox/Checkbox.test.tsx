import { screen } from "@testing-library/react";
import { PlopProvider } from "../PlopProvider/PlopProvider";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("is a real checkbox input named by its label", () => {
    renderWithPlop(<Checkbox>Responders on shift</Checkbox>);
    const box = screen.getByRole("checkbox", { name: "Responders on shift" });
    expect(box.tagName).toBe("INPUT");
    expect(box).toHaveAttribute("type", "checkbox");
  });

  it("toggles on click and reports the new value", async () => {
    const onCheckedChange = vi.fn();
    const onChange = vi.fn();
    renderWithPlop(
      <Checkbox onCheckedChange={onCheckedChange} onChange={onChange}>
        Caller, by SMS
      </Checkbox>,
    );
    await userEvent.click(screen.getByText("Caller, by SMS"));
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalled();
  });

  it("toggles with Space", async () => {
    renderWithPlop(<Checkbox>Barangay captain</Checkbox>);
    await userEvent.tab();
    expect(screen.getByRole("checkbox")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("supports the indeterminate state", () => {
    const { rerender } = renderWithPlop(<Checkbox indeterminate>Some units</Checkbox>);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(box).toHaveAttribute("aria-checked", "mixed");
    rerender(
      <PlopProvider reducedMotion="always">
        <Checkbox>Some units</Checkbox>
      </PlopProvider>,
    );
    expect(box.indeterminate).toBe(false);
  });

  it("cannot be changed when disabled", async () => {
    renderWithPlop(<Checkbox disabled>Provincial office</Checkbox>);
    await userEvent.click(screen.getByText("Provincial office"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("forwards its ref to the input", () => {
    let node: HTMLInputElement | null = null;
    renderWithPlop(<Checkbox ref={(n) => { node = n; }}>Ref</Checkbox>);
    expect(node).toBeInstanceOf(HTMLInputElement);
  });
});
