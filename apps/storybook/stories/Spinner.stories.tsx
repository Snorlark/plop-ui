import { Button, Spinner } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const KINDS = ["ink", "dots", "scribble", "sticker", "buddy"] as const;

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  args: { kind: "ink", size: "md", label: "Loading", showLabel: false, tone: "mustard", delay: 0 },
  argTypes: {
    kind: { control: "inline-radio", options: KINDS },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "inline-radio", options: ["mustard", "tomato", "mint", "bubblegum", "periwinkle", "ink"] },
    delay: { control: { type: "range", min: 0, max: 1000, step: 50 } },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Kinds: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
      {KINDS.map((kind) => (
        <Spinner key={kind} kind={kind} size="lg" label={`Loading (${kind})`} seed={kind} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
      <Spinner size="sm" seed="s" />
      <Spinner size="md" seed="m" />
      <Spinner size="lg" seed="l" />
    </div>
  ),
};

export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
      <Spinner style={{ color: "var(--plop-ink)" }} seed="a" />
      <Spinner style={{ color: "var(--plop-tomato)" }} seed="b" />
      <Spinner style={{ color: "var(--plop-leaf)" }} seed="c" />
      <span style={{ display: "inline-flex", padding: "10px 16px", background: "var(--plop-ink)", color: "var(--plop-on-ink)", borderRadius: "14px 10px 15px 11px" }}>
        <Spinner kind="dots" showLabel label="On ink" size="sm" />
      </span>
    </div>
  ),
};

export const WithLabel: Story = { args: { kind: "dots", showLabel: true, label: "Saving your board" } };

export const Delayed: Story = { args: { delay: 600, showLabel: true, label: "Shows after 600ms" } };

export const InAButton: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20 }}>
      <Button variant="ink" loading loadingLabel="Sending">
        Send report
      </Button>
      <Button variant="mustard" loading loadingLabel="Saving">
        Save
      </Button>
    </div>
  ),
};

/** 300 spinners at once, for checking they stay off the main thread (see apps/docs/e2e/loading.spec.ts). */
export const Stress: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {Array.from({ length: 300 }, (_, i) => (
        <Spinner key={i} kind={KINDS[i % KINDS.length]} size={i % 3 === 0 ? "lg" : "md"} label={`Loading ${i}`} seed={i} />
      ))}
    </div>
  ),
};
