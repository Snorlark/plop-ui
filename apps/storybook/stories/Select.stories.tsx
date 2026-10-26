import { MultiSelect, Select, type SelectOption } from "@plop-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

const BRUSHES: SelectOption[] = [
  { value: "pencil", label: "Pencil", hint: "Light and scratchy", lead: { dot: "periwinkle" } },
  { value: "marker", label: "Marker", hint: "Bold and a bit wobbly", lead: { dot: "mustard" } },
  { value: "crayon", label: "Crayon", hint: "Waxy, never neat", lead: { dot: "tomato" } },
];
const FRIENDS: SelectOption[] = [
  { value: "rosa", label: "Rosa Santos", hint: "Illustrator", group: "Online", lead: { avatar: "Rosa Santos", status: "online" } },
  { value: "jun", label: "Jun Reyes", hint: "Animator", group: "Online", lead: { avatar: "Jun Reyes", status: "online" } },
  { value: "ana", label: "Ana Cruz", hint: "Away until Monday", group: "Away", lead: { avatar: "Ana Cruz", status: "offline" }, disabled: true },
];
const TAGS: SelectOption[] = [
  { value: "wild", label: "Wild idea", tone: "tomato" },
  { value: "doodles", label: "Doodles", tone: "mustard" },
  { value: "posters", label: "Posters", tone: "bubblegum" },
  { value: "shipped", label: "Shipped", tone: "mint" },
];

const meta = { title: "Inputs/Select", component: Select, args: { label: "Brush", options: BRUSHES }, decorators: [(S) => <div style={{ minHeight: 340 }}><S /></div>] } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: "marker" } };
export const Placeholder: Story = { args: { placeholder: "Pick a brush" } };
export const Small: Story = { args: { size: "sm", defaultValue: "pencil" } };
export const PeoplePicker: Story = { args: { label: "Collaborator", options: FRIENDS, searchable: true, searchLabel: "Find a friend", placeholder: "Invite someone" } };
export const Multi: Story = { render: () => <MultiSelect label="Tags" options={TAGS} defaultValue={["wild", "doodles"]} placeholder="Any tag" /> };
export const Error: Story = { args: { placeholder: "Pick a brush", error: "Pick a brush before you post." } };
export const Disabled: Story = { args: { defaultValue: "pencil", disabled: true, hint: "Locked while the sketch is shipping." } };
export const Loading: Story = { args: { label: "Collaborator", options: [], placeholder: "Loading friends", loading: true } };
