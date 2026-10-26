import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderWithPlop } from "../../test/render";
import { PlopProvider } from "../PlopProvider/PlopProvider";
import { Tag } from "./Tag";

function Filters({ initial = ["Doodles", "Last 24 hours", "Favorites"] }: { initial?: string[] }) {
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
    render(<Tag status="en-route">In progress</Tag>);
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("names the remove button after the label", () => {
    renderWithPlop(<Filters initial={["Favorites"]} />);
    expect(screen.getByRole("button", { name: "Remove Favorites" })).toBeInTheDocument();
  });

  it("accepts a custom remove label", () => {
    renderWithPlop(
      <Tag onRemove={() => {}} removeLabel="Clear favorites filter">
        Favorites
      </Tag>,
    );
    expect(screen.getByRole("button", { name: "Clear favorites filter" })).toBeInTheDocument();
  });

  it("removes the tag and moves focus to the next one", async () => {
    renderWithPlop(<Filters />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Doodles" }));
    expect(screen.queryByText("Doodles")).toBeNull();
    expect(screen.getByRole("button", { name: "Remove Last 24 hours" })).toHaveFocus();
  });

  it("moves focus to the previous tag when the last one is removed", async () => {
    renderWithPlop(<Filters />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Favorites" }));
    expect(screen.getByRole("button", { name: "Remove Last 24 hours" })).toHaveFocus();
  });

  it("peels off before removing when motion is allowed", () => {
    vi.useFakeTimers();
    render(
      <PlopProvider reducedMotion="never">
        <Filters initial={["Favorites"]} />
      </PlopProvider>,
    );
    act(() => screen.getByRole("button", { name: "Remove Favorites" }).click());
    expect(screen.getByText("Favorites").closest("[data-plop-tag]")).toHaveAttribute("data-removing");
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByText("Favorites")).toBeNull();
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
