import { Progress, ProgressRing } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  args: { label: "Syncing offline sketches", value: 4, max: 10, valueText: "4 of 10", tone: "ink", solid: false, indeterminate: false },
  argTypes: { tone: { control: "inline-radio", options: ["ink", "mint", "tomato"] } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Tones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <Progress label="Pages inked" value={7} max={9} valueText="7 of 9" tone="mint" />
      <Progress label="Response time target" value={92} valueText="92% used" tone="tomato" solid />
    </div>
  ),
};
export const Indeterminate: Story = { args: { label: "Finding the closest pencil", indeterminate: true, valueText: undefined } };
export const Empty: Story = { args: { value: 0, valueText: "0 of 10" } };
export const Full: Story = { args: { value: 10, valueText: "10 of 10", tone: "mint" } };
export const Ring: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
      <ProgressRing label="Sketches synced" value={0} size="sm" />
      <ProgressRing label="Uploading photos" value={64} />
      <ProgressRing label="Stickers cut" value={3} max={8} valueText="3 of 8" tone="tomato" size="lg" />
      <ProgressRing label="Board done" value={100} tone="mint" size="lg" />
    </div>
  ),
};
