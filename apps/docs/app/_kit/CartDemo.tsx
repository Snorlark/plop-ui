"use client";

import { NumberStepper } from "@plop-ui/react";
import { useState } from "react";

const ITEMS = [
  { id: "latte", name: "Matcha latte", price: 180 },
  { id: "hojicha", name: "Hojicha", price: 160 },
];

/** A two-row café cart: each row's quantity is a small NumberStepper with a hidden label. */
export function CartDemo() {
  const [qty, setQty] = useState<Record<string, number>>({ latte: 2, hojicha: 1 });
  const total = ITEMS.reduce((sum, item) => sum + item.price * (qty[item.id] ?? 0), 0);
  return (
    <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 420 }}>
      {ITEMS.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span>
            {item.name} <span style={{ color: "var(--plop-on-soft)" }}>₱{item.price}</span>
          </span>
          <NumberStepper
            label={`Quantity of ${item.name}`}
            hideLabel
            size="sm"
            min={1}
            max={9}
            value={qty[item.id]}
            onValueChange={(n) => setQty((q) => ({ ...q, [item.id]: n }))}
          />
        </div>
      ))}
      <p style={{ margin: 0, textAlign: "right" }}>
        Total <strong>₱{total}</strong>
      </p>
    </div>
  );
}
