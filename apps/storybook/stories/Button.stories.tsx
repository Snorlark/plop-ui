import { BellIcon, Button, PhoneIcon, PinIcon } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "Save changes", variant: "ink", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["ink", "periwinkle", "mint", "tomato", "mustard", "plain"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tilt: { control: { type: "range", min: -8, max: 8, step: 0.5 } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Hero: Story = {
  args: { children: "Send report", size: "lg", tilt: -3, buddy: true },
  parameters: { docs: { description: { story: "Add a buddy for the one action that matters most on a screen." } } },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center" }}>
      <Button variant="ink" seed="a">Save changes</Button>
      <Button variant="periwinkle" seed="b">Add note</Button>
      <Button variant="mint" seed="c">Mark resolved</Button>
      <Button variant="tomato" seed="d">Cancel dispatch</Button>
      <Button variant="mustard" seed="e">Call back</Button>
      <Button variant="plain" seed="f">Skip for now</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center" }}>
      <Button size="sm" iconLeft={<PinIcon />}>Share pin</Button>
      <Button size="md" iconLeft={<BellIcon />}>Page unit</Button>
      <Button size="lg" iconLeft={<PhoneIcon size={26} />}>Call</Button>
    </div>
  ),
};

/** Hover peels the corner up; the story pins the pressed look so it can be reviewed. */
export const Pressed: Story = {
  args: { children: "Pressed" },
  render: (args) => <Button {...args} data-pressed="" />,
};

export const Loading: Story = { args: { loading: true, children: "Saving", loadingLabel: "Saving" } };

function LoadingToggleDemo() {
    const [saving, setSaving] = useState(false);
    return (
      <Button
        loading={saving}
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1500);
        }}
      >
        Save changes
      </Button>
    );
  }

export const LoadingToggle: Story = {
  name: "Loading (interactive)",
  render: () => <LoadingToggleDemo />,
};

export const Disabled: Story = { args: { disabled: true, variant: "periwinkle", children: "Archived" } };

export const Focus: Story = {
  args: { children: "Tab to me" },
  parameters: { docs: { description: { story: "Focus shows the dashed “cut here” line with scissors. Press Tab." } } },
};
