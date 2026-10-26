import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { Button } from "../Button/Button";
import { Callout } from "../Callout/Callout";
import { Toast, Toaster } from "../Toast/Toaster";
import { toast } from "../Toast/store";
import { Buddy, BUDDY_CAST, BuddyPeek, type BuddyMood } from "./Buddy";

const MOODS = Object.keys(BUDDY_CAST) as BuddyMood[];

describe("Buddy", () => {
  it("draws a different character for every mood", () => {
    const drawings = MOODS.map((mood) => renderWithPlop(<Buddy mood={mood} />).container.querySelector("[data-mood] svg")?.innerHTML);
    expect(new Set(drawings).size).toBe(MOODS.length);
  });

  it("is decorative unless it carries a label", () => {
    const { container, rerender } = renderWithPlop(<Buddy mood="success" />);
    expect(container.querySelector("[data-mood]")).toHaveAttribute("aria-hidden", "true");
    rerender(<Buddy mood="error" label="Couldn't send" />);
    expect(screen.getByRole("img", { name: "Couldn't send" })).toHaveAttribute("data-mood", "error");
  });
});

describe("BuddyPeek", () => {
  it("peeks over any component without getting in the way of the keyboard", async () => {
    const onClick = vi.fn();
    renderWithPlop(
      <BuddyPeek mood="congrats">
        <button type="button" onClick={onClick}>
          Finish the zine
        </button>
      </BuddyPeek>,
    );
    await userEvent.tab();
    const button = screen.getByRole("button", { name: "Finish the zine" });
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
    expect(document.querySelector('[data-mood="congrats"]')).not.toBeNull();
  });
});

describe("attached to components", () => {
  it("Toast picks the character for its kind, or the one you name", () => {
    const { container, rerender } = renderWithPlop(<Toast kind="error" buddy>Couldn't send</Toast>);
    expect(container.querySelector('[data-mood="error"]')).not.toBeNull();
    rerender(<Toast kind="success" buddy="congrats">Zine finished</Toast>);
    expect(container.querySelector('[data-mood="congrats"]')).not.toBeNull();
    expect(screen.getByText("Zine finished")).toBeInTheDocument();
  });

  it("toast() can bring a character along", () => {
    renderWithPlop(<Toaster />, { toaster: false });
    act(() => {
      toast.success("Copied to clipboard", { buddy: true });
    });
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
    expect(screen.getByRole("status").querySelector('[data-mood="success"]')).not.toBeNull();
    act(() => toast.dismiss(1e9));
  });

  it("Button can carry any character as its buddy and still presses with the keyboard", async () => {
    const onClick = vi.fn();
    const pip = renderWithPlop(<Button buddy>Retry</Button>).container.querySelector("button svg")?.innerHTML;
    const { container } = renderWithPlop(
      <Button buddy buddyMood="error" onClick={onClick}>
        Retry
      </Button>,
    );
    const button = container.querySelector("button")!;
    expect(button.querySelector("svg")?.innerHTML).not.toBe(pip);
    expect(button).toHaveAccessibleName("Retry");
    button.focus();
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("Callout maps its tone to a character", () => {
    const { container } = renderWithPlop(<Callout tone="warn" title="Last update 12 min ago" buddy />);
    expect(container.querySelector('[data-mood="stale"]')).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Last update 12 min ago" })).toBeInTheDocument();
  });
});
