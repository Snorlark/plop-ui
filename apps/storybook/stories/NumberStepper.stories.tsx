import { useRef, useState } from "react";
import { Button, NumberStepper, PlopProvider } from "@plop-ui/react";
import { surfaceNames } from "@plop-ui/tokens";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Inputs/NumberStepper",
  component: NumberStepper,
  args: { label: "Quantity", defaultValue: 2, min: 1, max: 9 },
} satisfies Meta<typeof NumberStepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AtMinimum: Story = { args: { defaultValue: 1 } };
export const AtMinimumWithRemove: Story = { args: { defaultValue: 1, onRemove: () => {} } };
export const CustomRemoveLabel: Story = { args: { label: "Quantity of Matcha latte", defaultValue: 1, onRemove: () => {}, removeLabel: "Remove Matcha latte", removedMessage: "Matcha latte removed" } };
export const AtMaximum: Story = { args: { defaultValue: 9 } };
export const NoUpperLimit: Story = { args: { label: "Count", min: 0, max: undefined, defaultValue: 120 } };
export const Small: Story = { args: { size: "sm" } };
export const HiddenLabel: Story = { args: { label: "Quantity of Matcha latte", hideLabel: true } };
export const CustomButtonNames: Story = { args: { decrementLabel: "Remove one", incrementLabel: "Add one" } };
export const Fractional: Story = { args: { label: "Kilos of tea", min: 0, max: 5, step: 0.25, defaultValue: 1.5 } };
export const BigSteps: Story = { args: { label: "Tea bags", min: 0, max: 100, step: 10, defaultValue: 20 } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const LongLabel: Story = { args: { label: "How many oat milk hojicha lattes for the whole studio?" }, decorators: [(Story) => <div style={{ maxWidth: 260 }}><Story /></div>] };
export const SquareCorners: Story = { decorators: [(Story) => <PlopProvider roundness={0}><Story /></PlopProvider>] };
export const ReducedMotion: Story = { decorators: [(Story) => <PlopProvider reducedMotion="always"><Story /></PlopProvider>] };

function ControlledStepper() {
  const [qty, setQty] = useState(2);
  return <div style={{ display: "grid", gap: 12 }}><NumberStepper label="Quantity" value={qty} onValueChange={setQty} min={1} max={9} /><p>You picked {qty}.</p></div>;
}
export const Controlled: Story = { render: () => <ControlledStepper /> };

function CartRow() {
  const [qty, setQty] = useState(1);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between", maxWidth: 420 }}>
      <span>Matcha latte · ₱{qty * 180}</span>
      <NumberStepper label="Quantity of Matcha latte" hideLabel size="sm" value={qty} onValueChange={setQty} min={1} max={9} />
    </div>
  );
}
export const InACart: Story = { render: () => <CartRow /> };

function RemovableCartRow() {
  const [qty, setQty] = useState(1);
  const [inCart, setInCart] = useState(true);
  const addBack = useRef<HTMLButtonElement>(null);
  if (!inCart) {
    return <Button ref={addBack} size="sm" onClick={() => { setQty(1); setInCart(true); }}>Add Matcha latte back</Button>;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between", maxWidth: 420 }}>
      <span>Matcha latte · ₱{qty * 180}</span>
      <NumberStepper
        label="Quantity of Matcha latte"
        hideLabel
        size="sm"
        value={qty}
        onValueChange={setQty}
        min={1}
        max={9}
        removeLabel="Remove Matcha latte"
        removedMessage="Matcha latte removed"
        // The row unmounts, so hand focus to what replaces it.
        onRemove={() => { setInCart(false); requestAnimationFrame(() => addBack.current?.focus()); }}
      />
    </div>
  );
}
export const InACartWithRemove: Story = { render: () => <RemovableCartRow /> };

export const FormReset: Story = {
  render: (args) => <form style={{ display: "grid", gap: 20, justifyItems: "start" }}><NumberStepper {...args} name="qty" /><Button type="reset" size="sm">Reset quantity</Button></form>,
};
export const Focused: Story = { play: async ({ canvasElement }) => { canvasElement.querySelector("input")?.focus(); } };
export const Surfaces: Story = {
  render: (args) => <div style={{ display: "grid", gap: 20 }}>
    {(["light", "dark"] as const).flatMap((theme) => surfaceNames.map((surface) => (
      <PlopProvider key={`${theme}-${surface}`} surface={surface} theme={theme} style={{ padding: 28 }}>
        <NumberStepper {...args} label={`${surface} · ${theme}`} />
      </PlopProvider>
    )))}
  </div>,
};
