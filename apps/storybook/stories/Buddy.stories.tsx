import { Buddy, BUDDY_CAST, BuddyPeek, Button, Callout, TicketCard, Toast, type BuddyMood } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Feedback/Buddy",
  component: Buddy,
  args: { mood: "success", size: "lg" },
  argTypes: {
    mood: { control: "inline-radio", options: Object.keys(BUDDY_CAST) },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Buddy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const cast = (Object.keys(BUDDY_CAST) as BuddyMood[]).map((mood) => (
  <figure key={mood} style={{ margin: 0, display: "grid", justifyItems: "center", gap: 6, maxWidth: 160, textAlign: "center", fontSize: 14 }}>
    <Buddy mood={mood} size="lg" />
    <strong>{BUDDY_CAST[mood].name}</strong>
    <figcaption>{BUDDY_CAST[mood].purpose}</figcaption>
  </figure>
));

export const TheCast: Story = {
  render: () => <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>{cast}</div>,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
      <Buddy mood="preview" size="sm" />
      <Buddy mood="preview" size="md" />
      <Buddy mood="preview" size="lg" />
    </div>
  ),
};

export const OnToasts: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
      <Toast kind="success" buddy>Copied to clipboard</Toast>
      <Toast kind="error" buddy>Couldn&apos;t send</Toast>
      <Toast kind="info" buddy>Preview ready</Toast>
      <Toast kind="success" buddy="congrats">Shift closed</Toast>
      <Toast kind="info" buddy="thinking">Syncing reports…</Toast>
    </div>
  ),
};

export const OnCallouts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40, maxWidth: 520 }}>
      <Callout tone="warn" title="Last update 12 min ago" buddy>Unit positions may be stale.</Callout>
      <Callout tone="error" title="Couldn't reach dispatch" buddy action={<Button size="sm" variant="tomato">Try again</Button>} />
      <Callout tone="success" title="All units checked in" buddy="congrats" />
    </div>
  ),
};

export const PeekOverAnything: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "flex-end", paddingTop: 70 }}>
      <BuddyPeek mood="preview" side="end">
        <TicketCard meta="#1042 · Draft" title="Flooded underpass" stub="Preview">Not sent yet.</TicketCard>
      </BuddyPeek>
      <BuddyPeek mood="congrats" size="md">
        <Button variant="mint">Close shift</Button>
      </BuddyPeek>
      <Button variant="tomato" buddy buddyMood="error">Retry</Button>
      <Button variant="mint" buddy buddyMood="congrats">Close shift</Button>
      <BuddyPeek mood="stale">
        <Button variant="plain">Refresh units</Button>
      </BuddyPeek>
    </div>
  ),
};
