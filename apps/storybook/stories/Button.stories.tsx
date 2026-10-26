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
  args: { children: "Post sketch", size: "lg", tilt: -3, buddy: true },
  parameters: { docs: { description: { story: "Add a buddy for the one action that matters most on a screen." } } },
};

export const BuddyPeek: Story = {
  args: { children: "Get started", size: "lg", tilt: -2, buddy: "peek" },
  render: (args) => (
    <div style={{ paddingTop: 90 }}>
      <Button {...args} />
    </div>
  ),
  parameters: { docs: { description: { story: 'buddy="peek" hides the buddy behind the sticker until hover or keyboard focus.' } } },
};

export const Shadows: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center" }}>
      <Button shadow="soft" seed="s0">Soft (default)</Button>
      <Button shadow="stripes" seed="s1">Stripes</Button>
      <Button shadow="solid" seed="s2">Solid</Button>
      <Button shadow="outline" seed="s3">Outline</Button>
      <Button shadow="none" seed="s4">None</Button>
    </div>
  ),
  parameters: { docs: { description: { story: 'Set one sticker\'s `shadow`, or every sticker\'s with `<PlopProvider stickerShadow="solid">`.' } } },
};

export const Bursts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 28 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 30 }}>
        <Button variant="mint" burst="confetti" seed="b1">Confetti</Button>
        <Button variant="mustard" burst="stars" seed="b2">Stars</Button>
        <Button variant="periwinkle" burst="sparkle" seed="b3">Sparkle</Button>
        <Button variant="plain" burst="hearts" seed="b4">Hearts</Button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 30 }}>
        <Button variant="tomato" burst="poof" seed="b5">Poof</Button>
        <Button variant="tomato" burst="zap" seed="b6">Zap</Button>
        <Button variant="plain" burst="drops" seed="b7">Drops</Button>
        <Button seed="b8">No burst (default)</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Bursts are off by default. `burst` turns one on: `true` picks for the variant (confetti, or a poof on tomato), or name a style. The first row celebrates; the second row is for things that went wrong, and those also shake the sticker.",
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center" }}>
      <Button variant="ink" seed="a">Save changes</Button>
      <Button variant="periwinkle" seed="b">Add note</Button>
      <Button variant="mint" seed="c">Mark as shipped</Button>
      <Button variant="tomato" seed="d">Delete draft</Button>
      <Button variant="mustard" seed="e">Call back</Button>
      <Button variant="plain" seed="f">Skip for now</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center" }}>
      <Button size="sm" iconLeft={<PinIcon />}>Pin to board</Button>
      <Button size="md" iconLeft={<BellIcon />}>Ping a friend</Button>
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
