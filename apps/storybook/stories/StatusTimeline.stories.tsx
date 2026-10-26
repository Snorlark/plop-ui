import { Button, StatusTimeline, type StatusTimelineProps } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const steps = ["Sketched", "Inked", "Colored", "Shipped"];

const meta = {
  title: "Feedback/StatusTimeline",
  component: StatusTimeline,
  args: { steps, current: 2, times: ["9:02 AM", "9:04 AM", "6 min away", "Waiting"], label: "Sketch progress" },
  argTypes: {
    current: { control: { type: "range", min: 0, max: 4 } },
    orientation: { control: "inline-radio", options: ["auto", "horizontal", "vertical"] },
  },
} satisfies Meta<typeof StatusTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Vertical: Story = { args: { orientation: "vertical" } };
export const AllDone: Story = { args: { current: 4, times: ["9:02 AM", "9:04 AM", "9:05 AM", "9:17 AM"] } };
export const JustSketched: Story = { args: { current: 0, times: ["Now"] } };

function InteractiveDemo(args: StatusTimelineProps) {
  const [current, setCurrent] = useState(0);
  return (
    <div style={{ display: "grid", gap: 36 }}>
      <StatusTimeline {...args} current={current} times={undefined} />
      <div style={{ display: "flex", gap: 18 }}>
        <Button size="sm" onClick={() => setCurrent((c) => Math.min(c + 1, steps.length))}>Next step</Button>
        <Button size="sm" variant="plain" onClick={() => setCurrent(0)}>Start over</Button>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: (args) => <InteractiveDemo {...args} />,
};
