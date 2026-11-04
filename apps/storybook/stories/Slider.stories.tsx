import { useState } from "react";
import { Button, PlopProvider, Slider } from "@plop-ui/react";
import { surfaceNames } from "@plop-ui/tokens";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Inputs/Slider",
  component: Slider,
  args: { label: "Pencil pressure", defaultValue: 40, showValue: true },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Minimum: Story = { args: { defaultValue: 0 } };
export const Maximum: Story = { args: { defaultValue: 100 } };
export const Disabled: Story = { args: { disabled: true } };
export const NoValueLabel: Story = { args: { showValue: false } };
export const Fractional: Story = { args: { label: "Radius", min: 0, max: 2, step: 0.1, defaultValue: 1, formatValue: (v) => `${v}×` } };
export const Negative: Story = { args: { label: "Tilt", min: -20, max: 20, step: 0.5, defaultValue: -5, formatValue: (v) => `${v}°` } };
export const Continuous: Story = { args: { label: "Mix", min: 0, max: 1, step: "any", defaultValue: 0.365, formatValue: (v) => v.toFixed(3) } };
export const FixedBounds: Story = { args: { label: "Fixed pressure", min: 5, max: 5, defaultValue: 5 } };
export const Narrow: Story = { decorators: [(Story) => <div style={{ width: 180 }}><Story /></div>] };
export const RightToLeft: Story = { args: { dir: "rtl" } };
export const SquareCorners: Story = { decorators: [(Story) => <PlopProvider roundness={0}><Story /></PlopProvider>] };
export const ReducedMotion: Story = { decorators: [(Story) => <PlopProvider reducedMotion="always"><Story /></PlopProvider>] };
function ControlledSlider() {
  const [value, setValue] = useState(40);
  return <Slider label="Pencil pressure" value={value} onValueChange={setValue} showValue />;
}
export const Controlled: Story = { render: () => <ControlledSlider /> };
export const FormReset: Story = {
  render: (args) => <form style={{ display: "grid", gap: 20 }}><Slider {...args} name="pressure" /><Button type="reset" size="sm">Reset pressure</Button></form>,
};
export const Focused: Story = { play: async ({ canvasElement }) => { canvasElement.querySelector("input")?.focus(); } };
export const Pressed: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector("input");
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  },
};
export const Surfaces: Story = {
  decorators: [],
  render: (args) => <div style={{ display: "grid", gap: 20 }}>
    {(["light", "dark"] as const).flatMap((theme) => surfaceNames.map((surface) => (
      <PlopProvider key={`${theme}-${surface}`} surface={surface} theme={theme} style={{ padding: 28 }}>
        <Slider {...args} label={`${surface} · ${theme}`} />
      </PlopProvider>
    )))}
  </div>,
};
