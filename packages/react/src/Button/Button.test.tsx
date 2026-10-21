import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { PinIcon } from "../icons";
import { Button } from "./Button";

describe("Button", () => {
  it("is a native button that defaults to type=button", () => {
    renderWithPlop(<Button>Send report</Button>);
    const button = screen.getByRole("button", { name: "Send report" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("clicks with Enter and shows the press", async () => {
    const onClick = vi.fn();
    renderWithPlop(<Button onClick={onClick}>Send</Button>);
    const button = screen.getByRole("button");
    button.focus();
    fireEvent.keyDown(button, { key: "Enter" });
    expect(button).toHaveAttribute("data-pressed");
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalled();
  });

  it("shows the press while Space is held and releases on keyup", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithPlop(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard("[Space>]");
    expect(button).toHaveAttribute("data-pressed");
    await user.keyboard("[/Space]");
    expect(button).not.toHaveAttribute("data-pressed");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("squishes on pointer down and releases on pointer up or leave", () => {
    renderWithPlop(<Button>Press</Button>);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { button: 0 });
    expect(button).toHaveAttribute("data-pressed");
    fireEvent.pointerUp(button);
    expect(button).not.toHaveAttribute("data-pressed");
    fireEvent.pointerDown(button, { button: 0 });
    fireEvent.pointerLeave(button);
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("ignores right clicks for the press", () => {
    renderWithPlop(<Button>Press</Button>);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { button: 2 });
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("releases when focus leaves mid-press", () => {
    renderWithPlop(<Button>Press</Button>);
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: " " });
    expect(button).toHaveAttribute("data-pressed");
    fireEvent.blur(button);
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("sets aria-busy while loading and ignores clicks", async () => {
    const onClick = vi.fn();
    renderWithPlop(
      <Button loading onClick={onClick} loadingLabel="Sending">
        Send
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Sending")).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.pointerDown(button, { button: 0 });
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("does nothing when disabled", async () => {
    const onClick = vi.fn();
    renderWithPlop(
      <Button disabled onClick={onClick}>
        Archived
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses the given tilt, or a seeded one that is stable for the same seed", () => {
    const { rerender } = renderWithPlop(<Button tilt={-3}>A</Button>);
    expect(screen.getByRole("button").style.getPropertyValue("--tilt")).toBe("-3deg");
    rerender(<Button seed="same">A</Button>);
    const first = screen.getByRole("button").style.getPropertyValue("--tilt");
    rerender(<Button seed="same">A</Button>);
    expect(screen.getByRole("button").style.getPropertyValue("--tilt")).toBe(first);
  });

  it("renders a buddy that cheers after a click", async () => {
    vi.useFakeTimers();
    renderWithPlop(<Button buddy>Send report</Button>, { reducedMotion: "never" });
    const button = screen.getByRole("button", { name: "Send report" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("data-happy");
    act(() => vi.advanceTimersByTime(1200));
    expect(button).not.toHaveAttribute("data-happy");
    vi.useRealTimers();
  });

  it("springs back after release when motion is allowed", () => {
    vi.useFakeTimers();
    renderWithPlop(<Button>Spring</Button>, { reducedMotion: "never" });
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { button: 0 });
    fireEvent.pointerUp(button);
    expect(button).toHaveAttribute("data-released");
    act(() => vi.advanceTimersByTime(500));
    expect(button).not.toHaveAttribute("data-released");
    vi.useRealTimers();
  });

  it("renders an icon before the label", () => {
    renderWithPlop(<Button iconLeft={<PinIcon data-testid="pin" />}>Share pin</Button>);
    expect(screen.getByTestId("pin")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share pin" })).toBeInTheDocument();
  });

  it("taps haptics on press when enabled", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    renderWithPlop(<Button>Buzz</Button>);
    fireEvent.pointerDown(screen.getByRole("button"), { button: 0 });
    expect(vibrate).toHaveBeenCalledWith(8);
  });
});
