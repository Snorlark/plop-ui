import { act, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { Avatar } from "../Avatar/Avatar";
import { TicketCard, UnitCard } from "../Cards/Cards";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { Select } from "../Select/Select";
import { Tab, TabList, TabPanel, Tabs } from "../Tabs/Tabs";
import { Progress } from "../Progress/Progress";
import { ProgressRing } from "../Progress/ProgressRing";
import { Loader } from "../Spinner/Loader";
import { Skeleton, SkeletonText } from "./Skeleton";

describe("Progress, indeterminate", () => {
  it("is a progressbar with no value to read out", () => {
    renderWithPlop(<Progress label="Finding the closest pencil" indeterminate />);
    const bar = screen.getByRole("progressbar", { name: "Finding the closest pencil" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("aria-busy", "true");
  });
});

describe("ProgressRing", () => {
  it("reads its label and value, and clamps", () => {
    renderWithPlop(<ProgressRing label="Uploading photos" value={140} max={100} />);
    const ring = screen.getByRole("progressbar", { name: "Uploading photos" });
    expect(ring).toHaveAttribute("aria-valuenow", "100");
    expect(ring).toHaveAttribute("aria-valuetext", "100%");
  });

  it("takes a custom value text and never takes focus", async () => {
    renderWithPlop(
      <>
        <ProgressRing label="Pages" value={3} max={8} valueText="3 of 8" />
        <button type="button">Next</button>
      </>,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "3 of 8");
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });
});

describe("Skeleton", () => {
  it("is hidden from screen readers and never focusable", () => {
    const { container } = renderWithPlop(
      <>
        <Skeleton shape="circle" />
        <SkeletonText lines={4} />
      </>,
    );
    const scraps = container.querySelectorAll('[aria-hidden="true"]');
    expect(scraps.length).toBeGreaterThan(0);
    expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
  });

  it("cuts lines the same way for the same seed, the last one short", () => {
    const { container, rerender } = renderWithPlop(<SkeletonText lines={3} seed="para" />);
    const widths = () => [...container.querySelectorAll<HTMLElement>("[style*='width']")].map((el) => el.style.width);
    const first = widths();
    expect(first).toHaveLength(3);
    expect(parseFloat(first[2]!)).toBeLessThan(parseFloat(first[0]!));
    rerender(<SkeletonText lines={3} seed="para" />);
    expect(widths()).toEqual(first);
  });
});

describe("Loader", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("says what's loading, then that it's slow, with a Cancel button that works from the keyboard", async () => {
    const onCancel = vi.fn();
    renderWithPlop(<Loader label="Loading sketches" slowAfter={3000} onCancel={onCancel} />);
    expect(screen.getByText("Loading sketches")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("This is taking longer than usual.")).toBeInTheDocument();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("rotates tips on a card", () => {
    renderWithPlop(<Loader variant="card" label="Pressing your page" tips={["Inking", "Cutting"]} tipEvery={1000} slowAfter={0} />);
    expect(screen.getByText("Inking")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Cutting")).toBeInTheDocument();
  });
});

describe("useDelayedLoading", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows nothing for a quick load", () => {
    const { result, rerender } = renderHook(({ on }) => useDelayedLoading(on, { delay: 300 }), { initialProps: { on: true } });
    act(() => vi.advanceTimersByTime(200));
    rerender({ on: false });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe(false);
  });

  it("shows after the delay and stays up for the minimum", () => {
    const { result, rerender } = renderHook(({ on }) => useDelayedLoading(on, { delay: 300, minDuration: 500 }), { initialProps: { on: true } });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(true);
    rerender({ on: false });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(false);
  });
});

describe("built-in loading looks", () => {
  it("Avatar: same footprint, read out as loading", () => {
    renderWithPlop(<Avatar name="Rosa Santos" loading />);
    const img = screen.getByRole("img", { name: "Loading Rosa Santos" });
    expect(img).toHaveAttribute("aria-busy", "true");
  });

  it("Select: waits, can't be opened from the keyboard, and says it's loading options", async () => {
    renderWithPlop(<Select label="Brush" options={[{ value: "pencil", label: "Pencil" }]} loading />);
    const trigger = screen.getByRole("button", { name: /Brush/ });
    expect(trigger).toHaveAttribute("aria-busy", "true");
    expect(trigger).toHaveAccessibleName(/loading options/);
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("TicketCard and UnitCard: busy, with a heading that says Loading", () => {
    renderWithPlop(
      <>
        <TicketCard title="" loading />
        <UnitCard name="" loading />
      </>,
    );
    const cards = screen.getAllByRole("article");
    cards.forEach((c) => expect(c).toHaveAttribute("aria-busy", "true"));
    expect(screen.getAllByRole("heading", { name: "Loading" })).toHaveLength(2);
  });

  it("TabPanel: the panel waits, the tabs still move with arrow keys", async () => {
    renderWithPlop(
      <Tabs defaultValue="a">
        <TabList label="Views">
          <Tab value="a">Drafts</Tab>
          <Tab value="b">Shipped</Tab>
        </TabList>
        <TabPanel value="a" loading>
          Drafts here
        </TabPanel>
        <TabPanel value="b">Shipped here</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Drafts here")).toBeNull();
    screen.getByRole("tab", { name: "Drafts" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Shipped" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Shipped here");
  });
});
