import { useState } from "react";
import { Button, PlopProvider, StampCard, STAMP_INKS } from "@plop-ui/react";
import { surfaceNames } from "@plop-ui/tokens";
import type { Meta, StoryObj } from "@storybook/react";

/** A matcha cup, drawn in currentColor so it takes the stamp's ink. */
const cup = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M10 17h25l-2.6 19.5c-.3 2.4-2.3 4.2-4.7 4.2H17.4c-2.4 0-4.4-1.8-4.7-4.2Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M35 21.5c4.4-.6 6.6 1.6 6.1 4.6-.5 3-3.4 4.6-7.4 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M13.4 24.5c5.6 1.8 13.6 1.8 20 0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M19 6.5c-2 2.6 2 4.4 0 7M26 6.5c-2 2.6 2 4.4 0 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: "Display/StampCard",
  component: StampCard,
  args: { total: 8, filled: 3, title: "Matcha Corner", seed: "storybook" },
  argTypes: {
    filled: { control: { type: "range", min: 0, max: 12 } },
    total: { control: { type: "range", min: 1, max: 12 } },
    ink: { control: "select", options: ["mixed", ...STAMP_INKS] },
  },
} satisfies Meta<typeof StampCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { filled: 0 } };
export const OneStamp: Story = { args: { filled: 1 } };
export const Full: Story = { args: { filled: 8 } };
export const NoTitle: Story = { args: { title: undefined } };
export const NoCount: Story = { args: { showCount: false } };
export const CustomStamp: Story = { args: { stamp: cup, ink: "leaf", filled: 5 } };
export const FreeLastStamp: Story = {
  args: { total: 6, filled: 6, stamp: (i: number) => (i === 5 ? <span style={{ fontFamily: "var(--plop-font-letter)", fontWeight: 900, fontSize: 13 }}>FREE</span> : cup) },
};
export const MixedInks: Story = { args: { ink: "mixed", filled: 8 } };
export const OneInkEach: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      {STAMP_INKS.map((ink) => <StampCard key={ink} {...args} total={4} filled={3} ink={ink} title={ink} />)}
    </div>
  ),
};
export const FewSlots: Story = { args: { total: 3, filled: 2 } };
export const ManySlots: Story = { args: { total: 12, filled: 7 } };
export const CustomColumns: Story = { args: { total: 10, filled: 4, columns: 2 } };
export const LongTitle: Story = { args: { title: "The Very Long Name Matcha & Hojicha Corner Café, Upper Floor" }, decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>] };
export const NarrowContainer: Story = { args: { total: 10, filled: 6 }, decorators: [(Story) => <div style={{ maxWidth: 220 }}><Story /></div>] };
export const CustomWords: Story = {
  args: { title: "Matcha Corner", countText: (f: number, t: number) => `${f} sa ${t} na selyo`, statusText: { filled: "May selyo", empty: "Wala pa" } },
};
export const SquareCorners: Story = { decorators: [(Story) => <PlopProvider roundness={0}><Story /></PlopProvider>] };
export const ReducedMotion: Story = { decorators: [(Story) => <PlopProvider reducedMotion="always"><Story /></PlopProvider>] };

function Stamping() {
  const [filled, setFilled] = useState(2);
  const full = filled >= 8;
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <StampCard total={8} filled={filled} title="Matcha Corner" stamp={cup} seed="stamping" />
      <Button size="sm" onClick={() => setFilled(full ? 0 : filled + 1)}>{full ? "Start a new card" : "Buy a matcha"}</Button>
    </div>
  );
}
/** Press the button to watch the newest stamp thunk on (still under reduced motion). */
export const Stamp: Story = { render: () => <Stamping /> };

export const Surfaces: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 20 }}>
      {(["light", "dark"] as const).flatMap((theme) => surfaceNames.map((surface) => (
        <PlopProvider key={`${theme}-${surface}`} surface={surface} theme={theme} style={{ padding: 28 }}>
          <StampCard {...args} title={`${surface} · ${theme}`} />
        </PlopProvider>
      )))}
    </div>
  ),
};
