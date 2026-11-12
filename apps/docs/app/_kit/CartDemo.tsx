"use client";

import { Button, NumberStepper } from "@plop-ui/react";
import { useRef, useState } from "react";

const ITEMS = [
  { id: "latte", name: "Matcha latte", price: 180 },
  { id: "hojicha", name: "Hojicha", price: 160 },
];
const FULL = { latte: 2, hojicha: 1 };

/**
 * A two-row café cart: each row's quantity is a small NumberStepper with a hidden label.
 * At 1, − turns into a trash button; removing a row moves focus to the next row, or the cart heading.
 */
export function CartDemo() {
  const [qty, setQty] = useState<Record<string, number>>(FULL);
  const heading = useRef<HTMLHeadingElement>(null);
  const rows = useRef<Record<string, HTMLInputElement | null>>({});
  const items = ITEMS.filter((item) => item.id in qty);
  const total = items.reduce((sum, item) => sum + item.price * (qty[item.id] ?? 0), 0);

  function remove(id: string) {
    const index = items.findIndex((item) => item.id === id);
    const next = items[index + 1] ?? items[index - 1];
    setQty(({ [id]: _, ...rest }) => rest);
    // The row unmounts with its stepper: move focus somewhere sensible instead of letting it drop to the page.
    requestAnimationFrame(() => (next ? rows.current[next.id] : heading.current)?.focus());
  }

  return (
    <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 420 }}>
      <h3 ref={heading} tabIndex={-1} style={{ margin: 0 }}>
        Your cart
      </h3>
      {items.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span>
            {item.name} <span style={{ color: "var(--plop-on-soft)" }}>₱{item.price}</span>
          </span>
          <NumberStepper
            ref={(el) => {
              rows.current[item.id] = el;
            }}
            label={`Quantity of ${item.name}`}
            hideLabel
            size="sm"
            min={1}
            max={9}
            value={qty[item.id]}
            onValueChange={(n) => setQty((q) => ({ ...q, [item.id]: n }))}
            removeLabel={`Remove ${item.name}`}
            removedMessage={`${item.name} removed`}
            onRemove={() => remove(item.id)}
          />
        </div>
      ))}
      {items.length === 0 ? (
        <Button size="sm" onClick={() => setQty(FULL)} style={{ justifySelf: "start" }}>
          Refill cart
        </Button>
      ) : (
        <p style={{ margin: 0, textAlign: "right" }}>
          Total <strong>₱{total}</strong>
        </p>
      )}
    </div>
  );
}
