import { Loader } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Feedback/Loader",
  component: Loader,
  args: { label: "Loading the crew", variant: "inline", slowAfter: 3000, onCancel: () => {} },
  argTypes: { variant: { control: "inline-radio", options: ["inline", "card"] }, kind: { control: "inline-radio", options: ["ink", "dots", "scribble", "sticker", "buddy"] } },
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const SlowRightAway: Story = { args: { slowAfter: 1, slowMessage: "Taking longer than usual. The studio's wifi is slow." } };
export const NeverSlow: Story = { args: { slowAfter: 0 } };
export const Card: Story = {
  args: { variant: "card", label: "Pressing your page", tips: ["Rosa is checking the ink.", "Cutting the stickers out.", "Peeling off the backing paper."], slowAfter: 5000 },
};
