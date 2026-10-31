import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { Button } from "../Button/Button";
import { PlopProvider } from "../PlopProvider/PlopProvider";
import { inkLoop, scribbleLine, Spinner, type SpinnerKind } from "./Spinner";

/** PlopProvider has its own status region, so find the spinner by its words. */
const spinner = (label = "Loading") => screen.getByText(label).closest<HTMLElement>('[role="status"]')!;

const KINDS: SpinnerKind[] = ["ink", "dots", "scribble", "sticker", "buddy"];

describe("Spinner", () => {
  it("is a status read out as its label, default Loading", () => {
    renderWithPlop(<Spinner />);
    expect(spinner()).toHaveTextContent("Loading");
  });

  it.each(KINDS)("draws the %s kind as decoration only", (kind) => {
    renderWithPlop(<Spinner kind={kind} label="Fetching sketches" />);
    const status = spinner("Fetching sketches");
    expect(status).toHaveTextContent("Fetching sketches");
    expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByText("Fetching sketches")?.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("never takes keyboard focus", async () => {
    renderWithPlop(
      <>
        <Spinner showLabel label="Saving" />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("sizes itself and waits out a delay", () => {
    renderWithPlop(<Spinner size="lg" delay={300} />);
    const status = spinner();
    expect(status.style.getPropertyValue("--sp-size")).toBe("52px");
    expect(status.style.getPropertyValue("--sp-delay")).toBe("300ms");
  });

  it("wobbles the same way for the same seed, and differently for another", () => {
    expect(inkLoop("a")).toBe(inkLoop("a"));
    expect(inkLoop("a")).not.toBe(inkLoop("b"));
    expect(scribbleLine(1)).toBe(scribbleLine(1));
    const { rerender } = renderWithPlop(<Spinner seed="same" />);
    const first = spinner().outerHTML;
    rerender(<Spinner seed="same" />);
    expect(spinner().outerHTML).toBe(first);
  });

  it("is what a loading Button shows, and the Button keeps focus", async () => {
    const { rerender } = renderWithPlop(<Button loadingLabel="Sending">Send</Button>);
    await userEvent.tab();
    const button = screen.getByRole("button");
    expect(button).toHaveFocus();
    rerender(
      <PlopProvider reducedMotion="always">
        <Button loading loadingLabel="Sending">
          Send
        </Button>
      </PlopProvider>,
    );
    expect(button).toHaveFocus();
    expect(button.querySelector("svg path[pathLength='100']")).not.toBeNull();
  });
});
