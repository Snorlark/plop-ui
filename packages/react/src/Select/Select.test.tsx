import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderWithPlop } from "../../test/render";
import { MultiSelect, Select, type SelectOption } from "./Select";

const BRUSHES: SelectOption[] = [
  { value: "pencil", label: "Pencil" },
  { value: "marker", label: "Marker" },
  { value: "crayon", label: "Crayon", disabled: true },
  { value: "ink", label: "Ink pen" },
];

const PEOPLE: SelectOption[] = [
  { value: "rosa", label: "Rosa Santos", hint: "Illustrator", group: "Online", lead: { avatar: "Rosa Santos", status: "online" } },
  { value: "jun", label: "Jun Reyes", hint: "Animator", group: "Online", lead: { avatar: "Jun Reyes", status: "online" } },
  { value: "ana", label: "Ana Cruz", hint: "Letterer", group: "Away", lead: { avatar: "Ana Cruz" } },
];

describe("Select in a form", () => {
  const formOf = (container: HTMLElement) => container.querySelector("form") as HTMLFormElement;

  it("submits the picked option through a hidden input named by `name`", async () => {
    const { container } = renderWithPlop(
      <form>
        <Select label="Drink" name="drink" options={BRUSHES} />
      </form>,
    );
    expect(new FormData(formOf(container)).get("drink")).toBe("");
    await userEvent.click(screen.getByRole("button", { name: /Drink/ }));
    await userEvent.click(screen.getByRole("option", { name: "Marker" }));
    const input = container.querySelector('input[type="hidden"][name="drink"]') as HTMLInputElement;
    expect(input.value).toBe("marker");
    expect(new FormData(formOf(container)).get("drink")).toBe("marker");
  });

  it("submits a default value from the start, and follows a controlled value", () => {
    const first = renderWithPlop(
      <form>
        <Select label="Drink" name="drink" options={BRUSHES} defaultValue="ink" />
      </form>,
    );
    expect(new FormData(formOf(first.container)).get("drink")).toBe("ink");
    first.unmount();
    const second = renderWithPlop(
      <form>
        <Select label="Drink" name="drink" options={BRUSHES} value="pencil" />
      </form>,
    );
    expect(new FormData(formOf(second.container)).get("drink")).toBe("pencil");
  });

  it("submits nothing for a value that no option has, because the trigger does not show it", () => {
    const { container } = renderWithPlop(
      <form>
        <Select label="Drink" name="drink" options={BRUSHES} value="water" />
      </form>,
    );
    expect(new FormData(formOf(container)).get("drink")).toBe("");
    expect(screen.getByRole("button", { name: /Drink/ })).toHaveTextContent("Choose…");
  });

  it("renders no input without a `name`, and none is submitted while the field is disabled", () => {
    const { container } = renderWithPlop(
      <form>
        <Select label="Drink" options={BRUSHES} defaultValue="ink" />
        <Select label="Locked" name="locked" options={BRUSHES} defaultValue="ink" disabled />
      </form>,
    );
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(1);
    expect(new FormData(formOf(container)).has("locked")).toBe(false);
  });

  it("keeps the keyboard and the accessibility tree as they were", () => {
    renderWithPlop(
      <form>
        <Select label="Drink" name="drink" options={BRUSHES} />
      </form>,
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(document.querySelector('input[type="hidden"]')).not.toHaveAttribute("tabindex");
  });

  it("submits one entry per picked option in a MultiSelect, in the order of the options", async () => {
    const { container } = renderWithPlop(
      <form>
        <MultiSelect label="Brushes" name="brushes" options={BRUSHES} />
      </form>,
    );
    expect(new FormData(formOf(container)).getAll("brushes")).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: /Brushes/ }));
    await userEvent.click(screen.getByRole("option", { name: "Ink pen" }));
    await userEvent.click(screen.getByRole("option", { name: "Pencil" }));
    expect(new FormData(formOf(container)).getAll("brushes")).toEqual(["pencil", "ink"]);
    await userEvent.click(screen.getByRole("option", { name: "Pencil" }));
    expect(new FormData(formOf(container)).getAll("brushes")).toEqual(["ink"]);
  });
});

describe("Select", () => {
  it("opens from the keyboard, skips disabled options, picks with Enter and hands focus back", async () => {
    const onValueChange = vi.fn();
    renderWithPlop(<Select label="Brush" options={BRUSHES} defaultValue="marker" onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: /Brush/ });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const list = screen.getByRole("listbox", { name: "Brush" });
    expect(list).toHaveFocus();
    expect(list).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Marker" }).id);
    await userEvent.keyboard("{ArrowDown}");
    expect(list).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Ink pen" }).id);
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("ink");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent("Ink pen");
  });

  it("jumps to a typed letter, Home and End, and Escape closes without picking", async () => {
    const onValueChange = vi.fn();
    renderWithPlop(<Select label="Brush" options={BRUSHES} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Brush/ }));
    const list = screen.getByRole("listbox");
    await userEvent.keyboard("i");
    expect(list).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Ink pen" }).id);
    await userEvent.keyboard("{Home}");
    expect(list).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Pencil" }).id);
    await userEvent.keyboard("{End}");
    expect(list).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Ink pen" }).id);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: /Brush/ })).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("searchable: typing filters by name or hint and Enter picks the first match", async () => {
    const onValueChange = vi.fn();
    renderWithPlop(<Select label="Collaborator" options={PEOPLE} searchable searchLabel="Find a person" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Collaborator/ }));
    const box = screen.getByRole("combobox", { name: "Find a person" });
    expect(box).toHaveFocus();
    await userEvent.keyboard("anim");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("jun");
  });

  it("reads the error as the trigger's description, and can't open while disabled or loading", () => {
    const { rerender } = renderWithPlop(<Select label="Brush" options={BRUSHES} error="Pick a brush first." />);
    const trigger = screen.getByRole("button", { name: /Brush/ });
    expect(trigger).toHaveAccessibleDescription("Pick a brush first.");
    rerender(<Select label="Brush" options={BRUSHES} loading />);
    expect(screen.getByRole("button", { name: /Brush/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Brush/ })).toHaveAttribute("aria-busy", "true");
  });
});

describe("MultiSelect", () => {
  function Tags() {
    const [v, setV] = useState(["doodles"]);
    return (
      <MultiSelect
        label="Tags"
        value={v}
        onValueChange={setV}
        options={[
          { value: "doodles", label: "Doodles", tone: "mustard" },
          { value: "posters", label: "Posters", tone: "bubblegum" },
          { value: "comics", label: "Comics" },
        ]}
      />
    );
  }

  it("toggles with Space and stays open; picked options show as tape on the trigger", async () => {
    renderWithPlop(<Tags />);
    const trigger = screen.getByRole("button", { name: /Tags/ });
    expect(trigger).toHaveTextContent("1 selected");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const list = screen.getByRole("listbox");
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.keyboard("{ArrowDown} ");
    expect(screen.getByRole("option", { name: "Posters" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowUp} ");
    expect(screen.getByRole("option", { name: "Doodles" })).toHaveAttribute("aria-selected", "false");
    expect(trigger).toHaveTextContent("Posters");
    expect(trigger).not.toHaveTextContent("Doodles");
  });
});
