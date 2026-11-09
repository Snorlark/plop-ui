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
export const Compact: Story = { args: { page: 2, pageCount: 17, variant: "compact" } };
export const CompactNarrow: Story = { args: { page: 2, pageCount: 17, variant: "compact" }, decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>] };
export const ShowingCount: Story = { args: { page: 2, pageCount: 10, variant: "compact", formatCount: (page) => `Showing ${(page - 1) * 10 + 1}–${page * 10} of 100` } };
export const WithEnds: Story = { args: { page: 5, pageCount: 40, showEnds: true } };
export const CompactWithEnds: Story = { args: { page: 5, pageCount: 40, showEnds: true, variant: "compact" } };
export const EndsAtFirst: Story = { args: { page: 1, pageCount: 40, showEnds: true } };
export const EndsAtLast: Story = { args: { page: 40, pageCount: 40, showEnds: true } };
export const Loading: Story = { args: { page: 3, pageCount: 17, loading: true, loadingLabel: "Loading page 3" } };
export const LoadingCompact: Story = { args: { page: 3, pageCount: 17, loading: true, variant: "compact" } };
export const LoadingLinks: Story = { render: (args) => <Pagination {...args} page={3} loading href={(page) => `#page-${page}`} /> };
export const HugeList: Story = { args: { page: 50000, pageCount: 100000 } };
export const Narrow: Story = { decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>] };
export const Translated: Story = { args: { "aria-label": "Résultats", previousLabel: "Précédent", nextLabel: "Suivant", firstLabel: "Début", lastLabel: "Fin", showEnds: true, loadingLabel: "Chargement", getPageLabel: (page) => `Aller à la page ${page}` } };
export const TranslatedCompact: Story = { args: { "aria-label": "Résultats", previousLabel: "Précédent", nextLabel: "Suivant", variant: "compact", formatCount: (page, count) => `${page} sur ${count}` } };
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
        <Pagination {...args} aria-label={`${surface} ${theme} compact`} variant="compact" showEnds loading href={(page) => `#page-${page}`} />
      </PlopProvider>
    )))}
  </div>,
};
