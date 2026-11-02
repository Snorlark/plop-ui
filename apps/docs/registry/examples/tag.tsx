"use client";

import { useState } from "react";
import { Tag } from "@plop-ui/react";

/** Tag: strips of washi tape for labels and filters. Removable ones peel off. */
export function TagExample() {
  const [filters, setFilters] = useState(["Doodles", "Zines", "Comics"]);
  return (
    <>
      <Tag tone="tomato">Wild idea</Tag>
      <Tag tone="mustard" pattern="dots">
        In progress
      </Tag>
      {filters.map((f) => (
        <Tag key={f} onRemove={() => setFilters((all) => all.filter((x) => x !== f))}>
          {f}
        </Tag>
      ))}
    </>
  );
}
