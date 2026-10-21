import { Tag } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "Display/Tag",
  component: Tag,
  args: { children: "En route", tone: "mustard" },
  argTypes: {
    tone: { control: "inline-radio", options: ["ink", "tomato", "mustard", "mint", "periwinkle", "bubblegum"] },
    pattern: { control: "inline-radio", options: ["stripes", "dots", "grid"] },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
      <Tag status="critical">Critical</Tag>
      <Tag status="dispatched">Dispatched</Tag>
      <Tag status="en-route">En route</Tag>
      <Tag status="resolved">Resolved</Tag>
      <Tag status="unassigned">Unassigned</Tag>
    </div>
  ),
};

export const Patterns: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 22 }}>
      <Tag tone="bubblegum" pattern="dots">Dots</Tag>
      <Tag tone="mint" pattern="grid">Grid</Tag>
      <Tag tone="mustard" pattern="stripes">Stripes</Tag>
    </div>
  ),
};

function RemovableDemo() {
    const [tags, setTags] = useState(["Barangay 3", "Last 24 hours", "Fire"]);
    return (
      <div style={{ display: "flex", gap: 22, minHeight: 40 }}>
        {tags.length === 0 && <span>All filters cleared.</span>}
        {tags.map((t, i) => (
          <Tag key={t} tone={(["bubblegum", "periwinkle", "mint"] as const)[i % 3]} onRemove={() => setTags((all) => all.filter((x) => x !== t))}>
            {t}
          </Tag>
        ))}
      </div>
    );
  }

export const Removable: Story = {
  render: () => <RemovableDemo />,
};
