"use client";

import { useState } from "react";
import { MultiSelect, Select, type SelectOption } from "@plop-ui/react";

const friends: SelectOption[] = [
  { value: "rosa", label: "Rosa Santos", hint: "Illustrator", group: "Online", lead: { avatar: "Rosa Santos", status: "online" } },
  { value: "theo", label: "Theo Park", hint: "Letterer", group: "Online", lead: { avatar: "Theo Park", status: "online" } },
  { value: "mia", label: "Mia Lopez", hint: "Zine maker", group: "Away", lead: { avatar: "Mia Lopez", status: "offline" } },
];

const tags: SelectOption[] = [
  { value: "wild", label: "Wild idea", tone: "tomato" },
  { value: "draft", label: "Draft", tone: "mustard" },
  { value: "shipped", label: "Shipped", tone: "mint" },
];

/** Select & MultiSelect: a picker with hints, a searchable people picker, and tags that become tape. */
export function SelectExample() {
  const [brush, setBrush] = useState("pencil");
  const [picked, setPicked] = useState<string[]>(["wild"]);
  return (
    <>
      <Select
        label="Brush"
        options={[
          { value: "pencil", label: "Pencil", hint: "Light and scratchy", lead: { dot: "periwinkle" } },
          { value: "marker", label: "Marker", hint: "Bold and a bit wobbly", lead: { dot: "mustard" } },
        ]}
        value={brush}
        onValueChange={setBrush}
      />

      {/* A people picker: searchable, grouped, with doodle faces. */}
      <Select label="Collaborator" searchable searchLabel="Find a friend" options={friends} />

      {/* Each pick becomes a strip of tape. */}
      <MultiSelect label="Tags" options={tags} value={picked} onValueChange={setPicked} />

      <Select label="Paper" options={[{ value: "kraft", label: "Kraft" }]} error="Pick a paper before you post." />
      <Select label="Loading" options={[]} loading />
    </>
  );
}
