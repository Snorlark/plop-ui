import { CopyIcon, EditIcon, Menu, MoreIcon, PinIcon, TrashIcon, type MenuItem } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const ITEMS: MenuItem[] = [
  { label: "Rename", icon: <EditIcon />, keys: ["E"], onSelect: () => {} },
  { label: "Duplicate", icon: <CopyIcon />, keys: ["Shift", "D"], onSelect: () => {} },
  { label: "Pin to board", icon: <PinIcon />, onSelect: () => {} },
  { label: "Archive", onSelect: () => {}, disabled: true },
  "separator",
  { label: "Delete sketch", icon: <TrashIcon />, danger: true, onSelect: () => {} },
];

const meta = { title: "Actions/Menu", component: Menu, args: { label: "Sketch actions", items: ITEMS }, decorators: [(S) => <div style={{ minHeight: 360, paddingLeft: 200 }}><S /></div>] } satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Icon: Story = { args: { label: "More actions", icon: <MoreIcon />, align: "end" } };
