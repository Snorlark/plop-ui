import { Tag } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "Display/Tag",
  component: Tag,
  args: { children: "In progress", tone: "mustard" },
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
      <Tag status="critical">Wild idea</Tag>
      <Tag status="dispatched">Inked</Tag>
      <Tag status="en-route">In progress</Tag>
      <Tag status="resolved">Shipped</Tag>
      <Tag status="unassigned">Up for grabs</Tag>
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
    const [tags, setTags] = useState(["Doodles", "Last 24 hours", "Favorites"]);
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
