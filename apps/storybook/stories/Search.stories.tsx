import { CommandPalette, SearchField, type SearchGroup } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const GROUPS: SearchGroup[] = [
  { id: "incidents", label: "Incidents", items: [{ id: "i1", title: "Flooding, Purok 4", sub: "Brgy. 3, 2 min ago", meta: { label: "Critical", tone: "tomato" }, lead: { dot: "tomato" } }, { id: "i2", title: "Lost child, town plaza", sub: "Poblacion", meta: { label: "Resolved", tone: "mint" }, lead: { dot: "mint" } }] },
  { id: "people", label: "People", items: [{ id: "p1", title: "Rosa Santos", sub: "Dispatcher", lead: { avatar: "Rosa Santos" } }, { id: "p2", title: "Jun Reyes", sub: "PO2, Mobile 2", lead: { avatar: "Jun Reyes" } }] },
];

const meta = { title: "Inputs/SearchField", component: SearchField, args: { label: "Search the dispatch board", groups: GROUPS, shortcut: "/" } } satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (a) => <div style={{ minHeight: 380 }}><SearchField {...a} /></div> };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40 }}>
      <SearchField size="sm" label="Search" hideLabel groups={GROUPS} />
      <SearchField label="Search incidents" groups={GROUPS} />
      <SearchField size="lg" label="Find a person" groups={GROUPS} />
    </div>
  ),
};
export const Loading: Story = { args: { defaultValue: "flood", loading: true } };
export const Palette: Story = {
  render: () => <CommandPalette open onOpenChange={() => {}} shortcut={false} groups={GROUPS} emptyGroups={[{ id: "a", label: "Actions", items: [{ id: "a1", title: "Send a report" }] }]} onSelect={() => {}} />,
};
