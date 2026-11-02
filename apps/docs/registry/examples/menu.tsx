"use client";

import { CopyIcon, EditIcon, Menu, MoreIcon, TrashIcon, toast } from "@plop-ui/react";

/** Menu: a sticker button that opens a list of actions, with icons, shortcuts and a danger item. */
export function MenuExample() {
  return (
    <>
      <Menu
        label="Sketch actions"
        items={[
          { label: "Rename", icon: <EditIcon />, keys: ["E"], onSelect: () => toast("Rename") },
          { label: "Duplicate", icon: <CopyIcon />, keys: ["Shift", "D"], onSelect: () => toast("Duplicated") },
          "separator",
          { label: "Delete sketch", icon: <TrashIcon />, danger: true, onSelect: () => toast.error("Deleted") },
        ]}
      />

      <Menu
        label="More actions"
        icon={<MoreIcon />}
        align="end"
        items={[
          { label: "Share", onSelect: () => toast("Link copied") },
          { label: "Archive", onSelect: () => toast("Archived") },
        ]}
      />
    </>
  );
}
