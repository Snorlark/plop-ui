import { render, screen, within } from "@testing-library/react";
import { StatusTimeline } from "./StatusTimeline";

const steps = ["Sketched", "Inked", "Colored", "Shipped"];

describe("StatusTimeline", () => {
  it("is an ordered list with one item per step", () => {
    render(<StatusTimeline steps={steps} current={2} label="Sketch progress" />);
    const list = screen.getByRole("list", { name: "Sketch progress" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  });

  it("marks the current step with aria-current=step", () => {
    render(<StatusTimeline steps={steps} current={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(items.filter((li) => li.hasAttribute("aria-current"))).toHaveLength(1);
  });

  it("writes every status in text, not just color", () => {
    render(<StatusTimeline steps={steps} current={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Sketched, done");
    expect(items[2]).toHaveTextContent("Colored, current step");
    expect(items[3]).toHaveTextContent("Shipped, not started");
  });

  it("shows times from the times prop or the step objects", () => {
    render(<StatusTimeline steps={[{ label: "Sketched", time: "9:02 AM" }, "Inked"]} times={[undefined, "9:04 AM"]} current={1} />);
    expect(screen.getByText("9:02 AM")).toBeInTheDocument();
    expect(screen.getByText("9:04 AM")).toBeInTheDocument();
  });

  it("marks everything done when current is past the end", () => {
    render(<StatusTimeline steps={steps} current={4} />);
    expect(screen.getAllByRole("listitem").every((li) => li.textContent?.includes("done"))).toBe(true);
  });

  it("accepts custom status words", () => {
    render(<StatusTimeline steps={["Uno"]} current={0} statusText={{ done: "tapos", current: "ngayon", pending: "hindi pa" }} />);
    expect(screen.getByRole("listitem")).toHaveTextContent("Uno, ngayon");
  });
});
