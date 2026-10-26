"use client";

import { CopyIcon, EditIcon, LinkIcon, Menu, MoreIcon, MultiSelect, PinIcon, Select, toast, TrashIcon, type MenuItem, type SelectOption } from "@plop-ui/react";

const BRUSHES: SelectOption[] = [
  { value: "pencil", label: "Pencil", hint: "Light and scratchy", lead: { dot: "periwinkle" } },
  { value: "marker", label: "Marker", hint: "Bold and a bit wobbly", lead: { dot: "mustard" } },
  { value: "crayon", label: "Crayon", hint: "Waxy, never neat", lead: { dot: "tomato" } },
  { value: "ink", label: "Ink pen", hint: "One line, no undo", lead: { dot: "ink" } },
];
const PAPERS: SelectOption[] = [
  { value: "poster", label: "Poster" },
  { value: "mat", label: "Cutting mat" },
  { value: "notebook", label: "Notebook" },
  { value: "kraft", label: "Kraft" },
  { value: "riso", label: "Riso" },
];
const SORTS: SelectOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "liked", label: "Most liked" },
  { value: "wild", label: "Wildest first" },
];
export const FRIENDS: SelectOption[] = [
  { value: "rosa", label: "Rosa Santos", hint: "Illustrator", group: "Online", lead: { avatar: "Rosa Santos", status: "online" } },
  { value: "jun", label: "Jun Reyes", hint: "Animator", group: "Online", lead: { avatar: "Jun Reyes", status: "online" } },
  { value: "mika", label: "Mika Tan", hint: "Letterer, on a call", group: "Online", lead: { avatar: "Mika Tan", status: "busy" } },
  { value: "ana", label: "Ana Cruz", hint: "Away until Monday", group: "Away", lead: { avatar: "Ana Cruz", status: "offline" }, disabled: true },
  { value: "ben", label: "Ben Ocampo", hint: "Away until Monday", group: "Away", lead: { avatar: "Ben Ocampo", status: "offline" }, disabled: true },
];
const TAGS: SelectOption[] = [
  { value: "wild", label: "Wild idea", tone: "tomato" },
  { value: "doodles", label: "Doodles", tone: "mustard" },
  { value: "posters", label: "Posters", tone: "bubblegum" },
  { value: "comics", label: "Comics", tone: "periwinkle" },
  { value: "shipped", label: "Shipped", tone: "mint" },
];
const ACTIONS: MenuItem[] = [
  { label: "Rename", icon: <EditIcon />, keys: ["E"], onSelect: () => toast("Renaming…") },
  { label: "Duplicate", icon: <CopyIcon />, keys: ["Shift", "D"], onSelect: () => toast.success("Sketch duplicated") },
  { label: "Pin to board", icon: <PinIcon />, keys: ["P"], onSelect: () => toast.success("Pinned to your board") },
  { label: "Copy link", icon: <LinkIcon />, keys: ["C"], onSelect: () => toast.success("Link copied") },
  "separator",
  { label: "Delete sketch", icon: <TrashIcon />, danger: true, onSelect: () => toast.error("Sketch deleted") },
];

/** Select, the searchable picker and MultiSelect, in one sketchbook. */
export function SelectDemo() {
  return (
    <div className="fields" style={{ minHeight: 360, alignItems: "start" }}>
      <Select label="Brush" options={BRUSHES} defaultValue="marker" />
      <Select label="Paper" options={PAPERS} placeholder="Pick a paper" />
      <Select label="Collaborator" options={FRIENDS} searchable searchLabel="Find a friend" placeholder="Invite someone" />
      <MultiSelect label="Tags" options={TAGS} defaultValue={["wild", "doodles"]} placeholder="Any tag" />
      <Select label="Sort by" size="sm" options={SORTS} defaultValue="newest" />
      <Select label="Paper" options={PAPERS} placeholder="Pick a paper" error="Pick a paper before you post." />
      <Select label="Brush" options={BRUSHES} defaultValue="pencil" disabled hint="Locked while the sketch is shipping." />
      <Select label="Collaborator" options={[]} placeholder="Loading friends" loading />
    </div>
  );
}

export function MenuDemo() {
  return (
    <div className="row" style={{ minHeight: 360, alignItems: "flex-start", gap: 40 }}>
      <Menu label="Sketch actions" items={ACTIONS} />
      <Menu label="More actions" icon={<MoreIcon />} items={ACTIONS} />
    </div>
  );
}
