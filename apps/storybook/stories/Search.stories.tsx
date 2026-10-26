import { CommandPalette, SearchField, type SearchGroup } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const GROUPS: SearchGroup[] = [
  { id: "sketches", label: "Sketches", items: [{ id: "i1", title: "Cat in a teacup", sub: "Doodles, 2 min ago", meta: { label: "Wild idea", tone: "tomato" }, lead: { dot: "tomato" } }, { id: "i2", title: "Poster for the zine fair", sub: "Posters", meta: { label: "Shipped", tone: "mint" }, lead: { dot: "mint" } }] },
  { id: "people", label: "People", items: [{ id: "p1", title: "Rosa Santos", sub: "Illustrator", lead: { avatar: "Rosa Santos" } }, { id: "p2", title: "Jun Reyes", sub: "Animator", lead: { avatar: "Jun Reyes" } }] },
];

const meta = { title: "Inputs/SearchField", component: SearchField, args: { label: "Search the sketchbook", groups: GROUPS, shortcut: "/" } } satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (a) => <div style={{ minHeight: 380 }}><SearchField {...a} /></div> };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40 }}>
      <SearchField size="sm" label="Search" hideLabel groups={GROUPS} />
      <SearchField label="Search sketches" groups={GROUPS} />
      <SearchField size="lg" label="Find a person" groups={GROUPS} />
    </div>
  ),
};
export const Loading: Story = { args: { defaultValue: "cat", loading: true } };
export const Palette: Story = {
  render: () => <CommandPalette open onOpenChange={() => {}} shortcut={false} groups={GROUPS} emptyGroups={[{ id: "a", label: "Actions", items: [{ id: "a1", title: "Start a sketch" }] }]} onSelect={() => {}} />,
};
