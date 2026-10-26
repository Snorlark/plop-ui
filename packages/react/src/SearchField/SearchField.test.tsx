import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { CommandPalette, SearchField, type SearchGroup } from "./SearchField";

const GROUPS: SearchGroup[] = [
  {
    id: "people",
    label: "People",
    items: [
      { id: "rosa", title: "Rosa Santos", sub: "Illustrator", lead: { avatar: "Rosa Santos" } },
      { id: "jun", title: "Jun Reyes", sub: "Animator", lead: { avatar: "Jun Reyes" } },
    ],
  },
  { id: "boards", label: "Boards", items: [{ id: "m2", title: "Animation reel", sub: "6 min left", meta: { label: "In progress", tone: "mustard" } }] },
];

async function typeAndSettle(text: string) {
  await userEvent.keyboard(text);
  act(() => vi.advanceTimersByTime(200));
}

describe("SearchField", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("is a combobox: arrows move through grouped results, Enter opens one", async () => {
    const onSelect = vi.fn();
    renderWithPlop(<SearchField label="Search the board" groups={GROUPS} onSelect={onSelect} />);
    await userEvent.tab();
    const box = screen.getByRole("combobox", { name: "Search the board" });
    expect(box).toHaveFocus();
    await typeAndSettle("anim");
    expect(box).toHaveAttribute("aria-expanded", "true");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2); // Jun Reyes (sub matches) and Animation reel
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(box).toHaveAttribute("aria-activedescendant", options[1]!.id);
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "m2" }), expect.objectContaining({ id: "boards" }));
  });

  it("announces the count, shows Hum when nothing matches, and Escape clears then closes", async () => {
    renderWithPlop(<SearchField label="Search" groups={GROUPS} />);
    const box = screen.getByRole("combobox");
    box.focus();
    await typeAndSettle("zzz");
    expect(screen.getByText("No results for zzz")).toBeInTheDocument();
    expect(document.querySelector('[data-mood="thinking"]')).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(box).toHaveValue("");
    expect(box).toHaveAttribute("aria-expanded", "false");
  });

  it("remembers picks as recent searches", async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) });
    renderWithPlop(<SearchField label="Search" groups={GROUPS} recentKey="t-recent" />);
    const box = screen.getByRole("combobox");
    box.focus();
    await typeAndSettle("rosa");
    await userEvent.keyboard("{Enter}");
    fireEvent.focus(box);
    expect(screen.getByText("Recent searches")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Rosa Santos/ })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe("CommandPalette", () => {
  it("opens with Ctrl+K and closes after a pick", async () => {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
    const onSelect = vi.fn();
    renderWithPlop(<CommandPalette groups={GROUPS} emptyGroups={[{ id: "a", label: "Actions", items: [{ id: "go", title: "Browse components" }] }]} onSelect={onSelect} />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    const box = await screen.findByRole("combobox", { name: "Type a command or search" });
    expect(box).toHaveFocus();
    expect(screen.getByRole("option", { name: /Browse components/ })).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "go" }), expect.anything());
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
