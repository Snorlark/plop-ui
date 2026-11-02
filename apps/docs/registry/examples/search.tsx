"use client";

import { useState } from "react";
import { Button, CommandPalette, SearchField, toast, type SearchGroup } from "@plop-ui/react";

const sketches: SearchGroup = {
  id: "sketches",
  label: "Sketches",
  items: [
    { id: "teacup", title: "Cat in a teacup", sub: "Draft · 2 days ago" },
    { id: "moon", title: "Moon picnic", sub: "Shipped", meta: { label: "new", tone: "mint" } },
  ],
};
const people: SearchGroup = {
  id: "people",
  label: "People",
  items: [{ id: "rosa", title: "Rosa Santos", sub: "Illustrator" }],
};
const actions: SearchGroup = {
  id: "actions",
  label: "Actions",
  items: [{ id: "new", title: "New sketch" }],
};

/** SearchField and CommandPalette: grouped results, recent searches, and a ⌘K / Ctrl K palette. */
export function SearchExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SearchField
        label="Search the sketchbook"
        shortcut="/"
        groups={[sketches, people]}
        recentKey="recent-searches"
        onSelect={(item) => toast(`Opening ${item.title}`)}
      />

      <Button variant="plain" onClick={() => setOpen(true)}>
        Open command palette (⌘K)
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[sketches, people]}
        emptyGroups={[actions]}
        onSelect={(item) => toast(`Run: ${item.title}`)}
      />
    </>
  );
}
