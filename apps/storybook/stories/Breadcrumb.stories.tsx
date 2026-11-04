import { Breadcrumb, PlopProvider } from "@plop-ui/react";
import { surfaceNames } from "@plop-ui/tokens";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";

const items = [
  { label: "Home", href: "#home" },
  { label: "Docs", href: "#docs" },
  { label: "Components", href: "#components" },
  { label: "Breadcrumb" },
] as const;
const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  args: { items },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SinglePage: Story = { args: { items: [{ label: "Home" }] } };
export const TwoPages: Story = { args: { items: [items[0], items[3]] } };
export const Empty: Story = { args: { items: [] } };
export const NonNavigableCategory: Story = { args: { items: [items[0], { label: "Components" }, items[3]] } };
export const Narrow: Story = {
  render: (args) => <div style={{ width: 280 }}><Breadcrumb {...args} /></div>,
};
export const Expanded: Story = {
  ...Narrow,
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>("button")?.click();
  },
};
export const AlwaysVisible: Story = { ...Narrow, args: { collapse: false } };
export const LongLabels: Story = {
  ...Narrow,
  args: { items: [items[0], items[1], { label: "A very long current page title that wraps within the available space" }] },
};
function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return <a {...props} data-router-link="">{children}</a>;
}
export const CustomLink: Story = { args: { as: RouterLink } };
export const Surfaces: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["light", "dark"] as const).flatMap((theme) => surfaceNames.map((surface) => (
        <PlopProvider key={`${theme}-${surface}`} theme={theme} surface={surface} style={{ padding: 24 }}>
          <Breadcrumb {...args} aria-label={`${surface} ${theme} breadcrumb`} />
        </PlopProvider>
      )))}
    </div>
  ),
};
export const ReducedMotion: Story = {
  ...Narrow,
  decorators: [(Story) => <PlopProvider reducedMotion="always"><Story /></PlopProvider>],
};
