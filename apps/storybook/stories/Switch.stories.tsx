import { Switch } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Inputs/Switch",
  component: Switch,
  args: { children: "Share live location" },
  argTypes: { color: { control: "inline-radio", options: ["mint", "ink", "tomato"] } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Colors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 22 }}>
      <Switch defaultChecked>Share live location</Switch>
      <Switch color="ink" defaultChecked>Night mode for the sketchbook</Switch>
      <Switch color="tomato">Mute comment pings</Switch>
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true, children: "Auto-assign (needs admin)" } };
