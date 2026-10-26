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
      <Toast kind="success" buddy="congrats">Zine finished</Toast>
      <Toast kind="info" buddy="thinking">Syncing sketches…</Toast>
    </div>
  ),
};

export const OnCallouts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40, maxWidth: 520 }}>
      <Callout tone="warn" title="Last update 12 min ago" buddy>Drafts may be out of date.</Callout>
      <Callout tone="error" title="Couldn't reach the server" buddy action={<Button size="sm" variant="tomato">Try again</Button>} />
      <Callout tone="success" title="Every page is filled" buddy="congrats" />
    </div>
  ),
};

export const PeekOverAnything: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "flex-end", paddingTop: 70 }}>
      <BuddyPeek mood="preview" side="end">
        <TicketCard meta="#1042 · Draft" title="Cat in a teacup" stub="Preview">Not posted yet.</TicketCard>
      </BuddyPeek>
      <BuddyPeek mood="congrats" size="md">
        <Button variant="mint">Finish the zine</Button>
      </BuddyPeek>
      <Button variant="tomato" buddy buddyMood="error">Retry</Button>
      <Button variant="mint" buddy buddyMood="congrats">Finish the zine</Button>
      <BuddyPeek mood="stale">
        <Button variant="plain">Refresh sketches</Button>
      </BuddyPeek>
    </div>
  ),
};
