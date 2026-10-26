import { CloseIcon, IconButton, PhoneIcon, PlusIcon } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
  args: { icon: <PlusIcon />, label: "New sketch", variant: "mustard" },
  argTypes: {
    variant: { control: "inline-radio", options: ["ink", "periwinkle", "mint", "tomato", "mustard", "plain"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const All: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
      <IconButton icon={<PlusIcon />} label="New sketch" variant="mustard" tilt={6} />
      <IconButton icon={<PhoneIcon />} label="Start SOS call" variant="tomato" tilt={-5} />
      <IconButton icon={<CloseIcon />} label="Close" variant="plain" size="sm" tilt={4} />
      <IconButton icon={<PhoneIcon />} label="Call" size="lg" />
    </div>
  ),
};

export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
