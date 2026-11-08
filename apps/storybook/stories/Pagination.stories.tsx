import { useState } from "react";
import { Pagination, PlopProvider, type PaginationProps } from "@plop-ui/react";
import { surfaceNames } from "@plop-ui/tokens";
import type { Meta, StoryObj } from "@storybook/react";

function LocalPagination(args: PaginationProps) {
  const [page, setPage] = useState(args.page);
  return <Pagination {...args} page={page} onPageChange={setPage} />;
}
const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  args: { page: 1, pageCount: 20 },
  render: (args) => <LocalPagination key={`${args.page}-${args.pageCount}`} {...args} />,
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Middle: Story = { args: { page: 10 } };
export const Last: Story = { args: { page: 20 } };
export const FewPages: Story = { args: { page: 2, pageCount: 3 } };
export const SinglePage: Story = { args: { pageCount: 1 } };
export const Empty: Story = { args: { pageCount: 0 } };
export const Disabled: Story = { args: { disabled: true, page: 10 } };
export const Links: Story = { render: (args) => <Pagination {...args} href={(page) => `#page-${page}`} /> };
export const HugeList: Story = { args: { page: 50000, pageCount: 100000 } };
export const Narrow: Story = { decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>] };
export const Translated: Story = { args: { "aria-label": "Résultats", previousLabel: "Précédent", nextLabel: "Suivant", getPageLabel: (page) => `Aller à la page ${page}` } };
export const RightToLeft: Story = { args: { dir: "rtl" } };
export const ReducedMotion: Story = { decorators: [(Story) => <PlopProvider reducedMotion="always"><Story /></PlopProvider>] };
export const Focused: Story = { play: async ({ canvasElement }) => { canvasElement.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus(); } };
export const Pressed: Story = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>("button:not(:disabled)");
    button?.focus();
    button?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
  },
};
export const Surfaces: Story = {
  render: (args) => <div style={{ display: "grid", gap: 28 }}>
    {(["light", "dark"] as const).flatMap((theme) => surfaceNames.map((surface) => (
      <PlopProvider key={`${theme}-${surface}`} surface={surface} theme={theme} style={{ padding: 32 }}>
        <Pagination {...args} aria-label={`${surface} ${theme}`} href={(page) => `#page-${page}`} />
      </PlopProvider>
    )))}
  </div>,
};
