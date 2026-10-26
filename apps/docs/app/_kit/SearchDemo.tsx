"use client";

import { Button, CommandPalette, SearchField, toast, type SearchGroup } from "@plop-ui/react";
import { useState } from "react";

const GROUPS: SearchGroup[] = [
  {
    id: "sketches",
    label: "Sketches",
    items: [
      { id: "i1", title: "Cat in a teacup", sub: "Doodles, 2 min ago", meta: { label: "Wild idea", tone: "tomato" }, lead: { dot: "tomato" } },
      { id: "i2", title: "Poster for the zine fair", sub: "Posters, 9 min ago", meta: { label: "In progress", tone: "mustard" }, lead: { dot: "mustard" } },
      { id: "i3", title: "Birthday card for Lola", sub: "Cards, 1 h ago", meta: { label: "Shipped", tone: "mint" }, lead: { dot: "mint" } },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "p1", title: "Rosa Santos", sub: "Illustrator, sketching now", lead: { avatar: "Rosa Santos" } },
      { id: "p2", title: "Jun Reyes", sub: "Animator", lead: { avatar: "Jun Reyes" } },
      { id: "p3", title: "Mika Tan", sub: "Letterer", lead: { avatar: "Mika Tan" } },
    ],
  },
];
const ACTIONS: SearchGroup[] = [{ id: "a", label: "Actions", items: [{ id: "a1", title: "Start a sketch", sub: "Open a blank page" }, { id: "a2", title: "Invite a friend", sub: "Draw on the same board" }] }];

export function SearchDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="stack" style={{ gap: 30, justifyItems: "center", alignContent: "start", minHeight: 360 }}>
      <SearchField label="Search the sketchbook" placeholder="Try “cat”, “poster” or “rosa”" groups={GROUPS} recentKey="plop-demo-recent" onSelect={(it) => toast.success(`Opened ${it.title}`, { buddy: true })} />
      <Button variant="plain" onClick={() => setOpen(true)}>
        Open the command palette
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} shortcut={false} groups={GROUPS} emptyGroups={ACTIONS} onSelect={(it) => toast(it.title)} />
    </div>
  );
}
