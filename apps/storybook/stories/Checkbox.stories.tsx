import { Checkbox } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Inputs/Checkbox",
  component: Checkbox,
  args: { children: "Someone comments" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { indeterminate: true, children: "Some friends" } };
export const GreenTick: Story = { args: { defaultChecked: true, tickColor: "var(--plop-leaf)", children: "Weekly digest, by email" } };
export const Disabled: Story = { args: { disabled: true, children: "Provincial office (off hours)" } };
export const Group: Story = {
  render: () => (
    <fieldset style={{ border: 0, padding: 0, display: "grid", gap: 14 }}>
      <legend style={{ fontStyle: "italic", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Notify me when</legend>
      <Checkbox defaultChecked>Someone comments</Checkbox>
      <Checkbox>A friend remixes my sketch</Checkbox>
      <Checkbox defaultChecked tickColor="var(--plop-leaf)">Weekly digest, by email</Checkbox>
      <Checkbox disabled>Provincial office (off hours)</Checkbox>
    </fieldset>
  ),
};
