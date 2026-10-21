"use client";

import { Button, CommandPalette, SearchField, toast, type SearchGroup } from "@plop-ui/react";
import { useState } from "react";

const GROUPS: SearchGroup[] = [
  {
    id: "incidents",
    label: "Incidents",
    items: [
      { id: "i1", title: "Flooding, Purok 4", sub: "Brgy. 3, 2 min ago", meta: { label: "Critical", tone: "tomato" }, lead: { dot: "tomato" } },
      { id: "i2", title: "Road accident, Maharlika Hwy", sub: "Brgy. 1, 9 min ago", meta: { label: "En route", tone: "mustard" }, lead: { dot: "mustard" } },
      { id: "i3", title: "Lost child, town plaza", sub: "Poblacion, 1 h ago", meta: { label: "Resolved", tone: "mint" }, lead: { dot: "mint" } },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "p1", title: "Rosa Santos", sub: "Dispatcher, on shift", lead: { avatar: "Rosa Santos" } },
      { id: "p2", title: "Jun Reyes", sub: "PO2, Mobile 2", lead: { avatar: "Jun Reyes" } },
      { id: "p3", title: "Mika Tan", sub: "Medic, Rescue 5", lead: { avatar: "Mika Tan" } },
    ],
  },
];
const ACTIONS: SearchGroup[] = [{ id: "a", label: "Actions", items: [{ id: "a1", title: "Send a report", sub: "Start a new incident report" }, { id: "a2", title: "Page a unit", sub: "Notify responders on shift" }] }];

export function SearchDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="stack" style={{ gap: 30, justifyItems: "center", minHeight: 360 }}>
      <SearchField label="Search the dispatch board" placeholder="Try “brgy”, “mobile” or “rosa”" groups={GROUPS} recentKey="plop-demo-recent" onSelect={(it) => toast.success(`Opened ${it.title}`, { buddy: true })} />
      <Button variant="plain" onClick={() => setOpen(true)}>
        Open the command palette
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} shortcut={false} groups={GROUPS} emptyGroups={ACTIONS} onSelect={(it) => toast(it.title)} />
    </div>
  );
}
