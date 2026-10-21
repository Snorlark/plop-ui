import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../test/render";
import { Avatar, AvatarStack } from "./Avatar/Avatar";
import { Count, EmptyState, StatusDot } from "./Badge/Badge";
import { Button } from "./Button/Button";
import { Callout } from "./Callout/Callout";
import { Eta, StickyNote, TicketCard, UnitCard, UnitCardRow } from "./Cards/Cards";
import { Heading } from "./Heading/Heading";
import { Lettering } from "./Lettering/Lettering";
import { Progress } from "./Progress/Progress";
import { Radio, RadioGroup } from "./Radio/Radio";
import { Sheet } from "./Sheet/Sheet";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs/Tabs";
import { TextArea, TextField } from "./TextField/TextField";
import { toast } from "./Toast/store";
import { Toast } from "./Toast/Toaster";
import { Tooltip } from "./Tooltip/Tooltip";

describe("Lettering", () => {
  it("reads as plain text to screen readers and jitters the same way every time", () => {
    const { container, rerender } = render(<Lettering>Send report</Lettering>);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText("Send report")).toBeInTheDocument();
    const first = container.innerHTML;
    rerender(<Lettering>Send report</Lettering>);
    expect(container.innerHTML).toBe(first);
  });

  it("passes non-text children through", () => {
    render(<Lettering><b>bold</b></Lettering>);
    expect(screen.getByText("bold").tagName).toBe("B");
  });

  it("gives a button a clean accessible name", () => {
    renderWithPlop(<Button>Send report</Button>);
    expect(screen.getByRole("button", { name: "Send report" })).toBeInTheDocument();
  });
});

describe("ink burst", () => {
  it("throws ink marks out of a clicked button when motion is allowed", () => {
    renderWithPlop(<Button>Pop</Button>, { reducedMotion: "never" });
    fireEvent.click(screen.getByRole("button"));
    // jsdom has no Web Animations, so the marks are created and cleaned up straight away; the call must not throw.
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("can be turned off", () => {
    renderWithPlop(<Button burst={false}>Quiet</Button>, { reducedMotion: "never" });
    fireEvent.click(screen.getByRole("button"));
    expect(document.querySelectorAll("svg[viewBox='-13 -13 26 26']")).toHaveLength(0);
  });
});

describe("Toast", () => {
  it("shows toasts in the polite live region and removes them after their time", () => {
    vi.useFakeTimers();
    renderWithPlop(<span />);
    act(() => {
      toast.success("Report sent", { duration: 1000 });
    });
    const zone = screen.getByRole("status");
    expect(zone).toHaveAttribute("aria-live", "polite");
    expect(within(zone).getByText("Report sent")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1300));
    expect(within(zone).queryByText("Report sent")).toBeNull();
    vi.useRealTimers();
  });

  it("replaces the previous toast and can be dismissed", () => {
    renderWithPlop(<span />);
    let id = 0;
    act(() => {
      toast("First");
      id = toast.error("Second");
    });
    const zone = screen.getByRole("status");
    expect(within(zone).queryByText("First")).toBeNull();
    expect(within(zone).getByText("Second")).toBeInTheDocument();
    act(() => toast.dismiss(id));
    expect(within(zone).queryByText("Second")).toBeNull();
  });

  it("renders a static toast", () => {
    render(<Toast kind="error">Couldn't send</Toast>);
    expect(screen.getByText("Couldn't send")).toBeInTheDocument();
  });
});

describe("Tooltip", () => {
  it("describes its trigger and hides on Escape", async () => {
    renderWithPlop(
      <Tooltip content="Priority sets who gets paged first.">
        <button type="button">Priority</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Priority" });
    expect(trigger).toHaveAccessibleDescription("Priority sets who gets paged first.");
    trigger.focus();
    await userEvent.keyboard("{Escape}");
    expect(trigger.parentElement).toHaveAttribute("data-dismissed");
    fireEvent.blur(trigger);
    expect(trigger.parentElement).not.toHaveAttribute("data-dismissed");
  });

  it("can be held open", () => {
    renderWithPlop(
      <Tooltip content="Help" open side="right">
        <button type="button">?</button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip").parentElement).toHaveAttribute("data-open");
  });

  it("opens below for the bottom side, still on keyboard focus", async () => {
    renderWithPlop(
      <Tooltip content="Sound off" side="bottom">
        <button type="button">Sound</button>
      </Tooltip>,
    );
    await userEvent.tab();
    const trigger = screen.getByRole("button", { name: "Sound" });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleDescription("Sound off");
    expect(screen.getByRole("tooltip").className).toMatch(/bottom/);
  });
});

describe("TextField and TextArea", () => {
  it("labels the input and links the hint", () => {
    render(<TextField label="Caller name" hint="Optional." />);
    const input = screen.getByRole("textbox", { name: "Caller name" });
    expect(input).toHaveAccessibleDescription("Optional.");
  });

  it("marks errors as invalid and describes how to fix them", () => {
    render(<TextField label="Location" error="Add a street, barangay, or landmark." required />);
    const input = screen.getByRole("textbox", { name: /Location/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Add a street, barangay, or landmark.");
    expect(input).toBeRequired();
  });

  it("types like a normal input", async () => {
    render(<TextField label="Phone" success />);
    await userEvent.type(screen.getByRole("textbox", { name: "Phone" }), "0917");
    expect(screen.getByRole("textbox", { name: "Phone" })).toHaveValue("0917");
  });

  it("renders a ruled textarea", () => {
    render(<TextArea label="What happened?" placeholder="Write it like you'd say it on the phone." />);
    expect(screen.getByRole("textbox", { name: "What happened?" }).tagName).toBe("TEXTAREA");
  });
});

describe("RadioGroup", () => {
  it("is a named group of native radios that selects with click and arrow keys", async () => {
    const onChange = vi.fn();
    renderWithPlop(
      <RadioGroup legend="Priority" defaultValue="medium" onValueChange={onChange}>
        <Radio value="low">Low</Radio>
        <Radio value="medium" dotColor="var(--plop-mustard)">Medium</Radio>
        <Radio value="high">High, page everyone</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole("group", { name: "Priority" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Medium" })).toBeChecked();
    await userEvent.click(screen.getByText("Low"));
    expect(screen.getByRole("radio", { name: "Low" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("low");
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Medium" })).toBeChecked();
  });

  it("requires a group", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Radio value="x">X</Radio>)).toThrow();
  });
});

describe("Avatar", () => {
  it("names the person and their status", () => {
    render(<Avatar name="Jun Reyes" status="online" />);
    expect(screen.getByRole("img", { name: "Jun Reyes, online" })).toBeInTheDocument();
  });

  it("draws the same face for the same name", () => {
    const a = render(<Avatar name="Rosa Santos" />).container.innerHTML;
    const b = render(<Avatar name="Rosa Santos" />).container.innerHTML;
    expect(a).toBe(b);
  });

  it("uses a photo when given, with a custom status word", () => {
    render(<Avatar name="Ana Cruz" src="/ana.jpg" status="busy" statusLabel="on a call" size="lg" />);
    expect(screen.getByRole("img", { name: "Ana Cruz, on a call" }).querySelector("img")).toHaveAttribute("src", "/ana.jpg");
  });

  it("stacks faces with a +N chip", () => {
    render(<AvatarStack names={["Rosa Santos", "Jun Reyes", "Ana Cruz", "A", "B", "C", "D"]} />);
    expect(screen.getByRole("img", { name: "Rosa, Jun, Ana and 4 more" })).toHaveTextContent("+4");
  });
});

describe("Cards", () => {
  it("renders a ticket with a heading and stub", () => {
    render(
      <TicketCard meta="Ticket #1042, 9:14 AM" title="Printer jams" stub="Open">
        Leo
      </TicketCard>,
    );
    expect(screen.getByRole("heading", { name: "Printer jams" })).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders a unit card with rows and an ETA", () => {
    render(
      <UnitCard name="Mobile 2" subtitle="PO2 Jun Reyes" tilt={1}>
        <UnitCardRow>
          <Eta value={6} unit="min away" />
        </UnitCardRow>
      </UnitCard>,
    );
    expect(screen.getByRole("heading", { name: "Mobile 2" })).toBeInTheDocument();
    expect(screen.getByText("min away")).toBeInTheDocument();
  });

  it("renders a sticky note", () => {
    render(<StickyNote footer="Added by Ana" tone="pink">Use the side entrance.</StickyNote>);
    expect(screen.getByRole("complementary")).toHaveTextContent("Use the side entrance.");
  });
});

describe("Tabs", () => {
  const ui = (
    <Tabs defaultValue="active">
      <TabList label="Incident queue">
        <Tab value="active">Active</Tab>
        <Tab value="resolved">Resolved</Tab>
        <Tab value="flagged">Flagged</Tab>
      </TabList>
      <TabPanel value="active">Three active</TabPanel>
      <TabPanel value="resolved">Two resolved</TabPanel>
      <TabPanel value="flagged">Nothing flagged</TabPanel>
    </Tabs>
  );

  it("links tabs to panels and shows the selected one", () => {
    renderWithPlop(ui);
    expect(screen.getByRole("tablist", { name: "Incident queue" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Active" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Active" })).toHaveTextContent("Three active");
    expect(screen.queryByText("Two resolved")).not.toBeVisible();
  });

  it("moves with arrow keys, Home and End (roving tabindex)", async () => {
    renderWithPlop(ui);
    await userEvent.click(screen.getByRole("tab", { name: "Active" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Resolved" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Resolved" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Active" })).toHaveAttribute("tabindex", "-1");
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Flagged" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Active" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Flagged" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Active" })).toHaveFocus();
  });

  it("requires a Tabs parent", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Tab value="x">X</Tab>)).toThrow();
  });
});

describe("Progress", () => {
  it("is a labeled progressbar with a readable value", () => {
    render(<Progress label="Syncing offline reports" value={4} max={10} valueText="4 of 10" />);
    const bar = screen.getByRole("progressbar", { name: "Syncing offline reports" });
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuetext", "4 of 10");
  });

  it("clamps and defaults to a percentage", () => {
    render(<Progress label="Used" value={150} tone="tomato" solid />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "100%");
  });
});

describe("Callout, Count, StatusDot, EmptyState, Sheet", () => {
  it("renders a callout with a heading, body and action", () => {
    render(<Callout tone="error" title="Couldn't reach the station" action={<button type="button">Try again</button>} role="alert">Saved on this phone.</Callout>);
    expect(screen.getByRole("alert")).toHaveTextContent("Saved on this phone.");
    expect(screen.getByRole("heading", { name: "Couldn't reach the station" })).toBeInTheDocument();
  });

  it("gives counts a meaningful name", () => {
    render(<Count label="3 unread">3</Count>);
    expect(screen.getByRole("img", { name: "3 unread" })).toHaveTextContent("3");
  });

  it("writes status words next to the dot", () => {
    render(<StatusDot tone="busy">On a call</StatusDot>);
    expect(screen.getByText("On a call")).toBeInTheDocument();
  });

  it("renders an empty state and a sheet", () => {
    render(
      <Sheet tape="bubblegum">
        <EmptyState>Nothing flagged.</EmptyState>
      </Sheet>,
    );
    expect(screen.getByText("Nothing flagged.").closest(".plop-paper")).not.toBeNull();
  });
});

describe("Heading", () => {
  it("is a real heading with a clean name", () => {
    renderWithPlop(<Heading level={2}>Status timeline</Heading>);
    expect(screen.getByRole("heading", { level: 2, name: "Status timeline" })).toBeInTheDocument();
  });
});

describe("icons", () => {
  it("are decorative and draw in currentColor", async () => {
    const icons = await import("./icons");
    for (const [name, Icon] of Object.entries(icons)) {
      const { container, unmount } = renderWithPlop(<Icon />);
      const svg = container.querySelector("svg");
      expect(svg, name).toHaveAttribute("aria-hidden", "true");
      expect(svg, name).toHaveAttribute("focusable", "false");
      unmount();
    }
  });

  it("draw an off state for the feedback toggles", async () => {
    const { HapticsIcon, SoundIcon } = await import("./icons");
    const on = renderWithPlop(<SoundIcon />).container.innerHTML;
    const off = renderWithPlop(<SoundIcon off />).container.innerHTML;
    expect(off).not.toBe(on);
    expect(renderWithPlop(<HapticsIcon off />).container.querySelectorAll("path").length).toBe(3);
  });
});
