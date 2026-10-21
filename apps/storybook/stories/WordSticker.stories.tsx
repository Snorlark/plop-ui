import { Doodle, WordSticker } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Display/WordSticker",
  component: WordSticker,
  args: { children: "Plop!", tone: "mustard", size: 64, tilt: -4, jitter: 2 },
  argTypes: {
    tone: { control: "inline-radio", options: ["mustard", "tomato", "mint", "bubblegum", "periwinkle", "ink", "paper"] },
    size: { control: { type: "range", min: 24, max: 140, step: 2 } },
    tilt: { control: { type: "range", min: -15, max: 15, step: 0.5 } },
    jitter: { control: { type: "range", min: 0, max: 6, step: 0.5 } },
  },
} satisfies Meta<typeof WordSticker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
      {(["mustard", "tomato", "mint", "bubblegum", "periwinkle", "ink", "paper"] as const).map((tone, i) => (
        <WordSticker key={tone} tone={tone} size={44} tilt={i % 2 ? 3 : -3}>
          {tone}
        </WordSticker>
      ))}
    </div>
  ),
};

export const Doodles: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Doodle kind="star" size={56} />
      <Doodle kind="heart" tone="bubblegum" size={56} />
      <Doodle kind="sparkle" tone="mustard" size={56} />
      <Doodle kind="burst" tone="mint" size={56} />
    </div>
  ),
};
