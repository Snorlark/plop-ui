import { Avatar, Select, Tab, TabList, TabPanel, Tabs, TicketCard, UnitCard } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

/** The loading look built into components that fetch: one prop, no custom CSS. */
const meta = { title: "Feedback/Loading states" } satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardList: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 18, maxWidth: 420 }}>
      <TicketCard title="" loading />
      <TicketCard title="" loading />
      <UnitCard name="" loading />
    </div>
  ),
};

export const LoadingSelect: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Select label="Brush" options={[]} loading />
    </div>
  ),
};

export const LoadingAvatar: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
      <Avatar name="Rosa Santos" size="sm" loading />
      <Avatar name="Rosa Santos" loading />
      <Avatar name="" size="lg" loading />
      <Avatar name="Rosa Santos" size="xl" loading />
    </div>
  ),
};

export const LoadingTabPanel: Story = {
  render: () => (
    <Tabs defaultValue="drafts">
      <TabList label="Sketch views">
        <Tab value="drafts">Drafts</Tab>
        <Tab value="shipped">Shipped</Tab>
      </TabList>
      <TabPanel value="drafts" loading>
        Drafts
      </TabPanel>
      <TabPanel value="shipped">Eleven sketches shipped.</TabPanel>
    </Tabs>
  ),
};
