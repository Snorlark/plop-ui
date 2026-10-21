import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderWithPlop } from "../../test/render";
import { PlopProvider } from "../PlopProvider/PlopProvider";
import { Tag } from "./Tag";

function Filters({ initial = ["Barangay 3", "Last 24 hours", "Fire"] }: { initial?: string[] }) {
  const [tags, setTags] = useState(initial);
  return (
    <div>
      {tags.map((t) => (
        <Tag key={t} onRemove={() => setTags((all) => all.filter((x) => x !== t))}>
          {t}
        </Tag>
      ))}
    </div>
  );
}

describe("Tag", () => {
  it("renders a static label with no buttons", () => {
    render(<Tag status="en-route">En route</Tag>);
    expect(screen.getByText("En route")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("names the remove button after the label", () => {
    renderWithPlop(<Filters initial={["Fire"]} />);
    expect(screen.getByRole("button", { name: "Remove Fire" })).toBeInTheDocument();
  });

  it("accepts a custom remove label", () => {
    renderWithPlop(
      <Tag onRemove={() => {}} removeLabel="Clear fire filter">
        Fire
      </Tag>,
    );
    expect(screen.getByRole("button", { name: "Clear fire filter" })).toBeInTheDocument();
  });

  it("removes the tag and moves focus to the next one", async () => {
    renderWithPlop(<Filters />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Barangay 3" }));
    expect(screen.queryByText("Barangay 3")).toBeNull();
    expect(screen.getByRole("button", { name: "Remove Last 24 hours" })).toHaveFocus();
  });

  it("moves focus to the previous tag when the last one is removed", async () => {
    renderWithPlop(<Filters />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Fire" }));
    expect(screen.getByRole("button", { name: "Remove Last 24 hours" })).toHaveFocus();
  });

  it("peels off before removing when motion is allowed", () => {
    vi.useFakeTimers();
    render(
      <PlopProvider reducedMotion="never">
        <Filters initial={["Fire"]} />
      </PlopProvider>,
    );
    act(() => screen.getByRole("button", { name: "Remove Fire" }).click());
    expect(screen.getByText("Fire").closest("[data-plop-tag]")).toHaveAttribute("data-removing");
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByText("Fire")).toBeNull();
    vi.useRealTimers();
  });

  it("uses a stable seeded tilt", () => {
    const tag = () => screen.getByText("Alpha").closest<HTMLElement>("[data-plop-tag]")!;
    const { rerender } = render(<Tag seed="x">Alpha</Tag>);
    const tilt = tag().style.getPropertyValue("--tilt");
    expect(tilt).toMatch(/deg$/);
    rerender(<Tag seed="x">Alpha</Tag>);
    expect(tag().style.getPropertyValue("--tilt")).toBe(tilt);
  });
});
