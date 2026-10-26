import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { MoreIcon } from "../icons";
import { Menu, type MenuItem } from "./Menu";

function items(onSelect: (what: string) => void): MenuItem[] {
  return [
    { label: "Rename", onSelect: () => onSelect("rename") },
    { label: "Duplicate", onSelect: () => onSelect("duplicate"), keys: ["Shift", "D"] },
    { label: "Copy link", onSelect: () => onSelect("copy") },
    "separator",
    { label: "Delete sketch", onSelect: () => onSelect("delete"), danger: true },
  ];
}

describe("Menu", () => {
  it("opens on ArrowDown with focus on the first item, arrows wrap, Enter runs one and focus returns", async () => {
    const onSelect = vi.fn();
    renderWithPlop(<Menu label="Sketch actions" items={items(onSelect)} />);
    const trigger = screen.getByRole("button", { name: "Sketch actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete sketch" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("duplicate");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("jumps by letter, Home and End, and Escape closes back to the trigger", async () => {
    const onSelect = vi.fn();
    renderWithPlop(<Menu label="More actions" icon={<MoreIcon />} items={items(onSelect)} />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    await userEvent.click(trigger);
    await userEvent.keyboard("c");
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete sketch" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
