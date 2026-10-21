import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderWithPlop } from "../../test/render";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("is a switch with aria-checked", () => {
    renderWithPlop(<Switch>Share live location</Switch>);
    const sw = screen.getByRole("switch", { name: "Share live location" });
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("toggles on click and calls onCheckedChange", async () => {
    const onChange = vi.fn();
    renderWithPlop(<Switch onCheckedChange={onChange}>Night mode</Switch>);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles when the label is clicked", async () => {
    renderWithPlop(<Switch>Silence alerts</Switch>);
    await userEvent.click(screen.getByText("Silence alerts"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("toggles with Space and Enter", async () => {
    renderWithPlop(<Switch>Sharing</Switch>);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("can be controlled", async () => {
    function Controlled() {
      const [on, setOn] = useState(true);
      return (
        <Switch checked={on} onCheckedChange={setOn}>
          Controlled
        </Switch>
      );
    }
    renderWithPlop(<Controlled />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("does not toggle when disabled", async () => {
    renderWithPlop(<Switch disabled>Auto-assign</Switch>);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
});
