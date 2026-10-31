import { Skeleton, SkeletonText } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  args: { shape: "line", animated: true },
  argTypes: { shape: { control: "inline-radio", options: ["line", "title", "circle", "block", "pill"] } },
  decorators: [(Story) => <div style={{ maxWidth: 460 }}>{Story()}</div>],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Shapes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Skeleton shape="title" />
      <Skeleton />
      <Skeleton shape="circle" />
      <Skeleton shape="pill" />
      <Skeleton shape="block" />
    </div>
  ),
};
export const Row: Story = {
  render: () => (
    <div aria-busy="true" aria-label="Crew" style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <Skeleton shape="circle" width={52} height={52} />
      <span style={{ flex: 1, display: "grid", gap: 8 }}>
        <Skeleton shape="title" width="55%" height={16} />
        <Skeleton width="80%" height={12} />
      </span>
      <Skeleton shape="pill" width={58} />
    </div>
  ),
};
export const Paragraph: Story = { render: () => <SkeletonText lines={4} /> };
export const Still: Story = { args: { animated: false, shape: "block" } };
