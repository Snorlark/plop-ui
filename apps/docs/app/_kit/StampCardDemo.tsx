"use client";

import { Button, StampCard } from "@plop-ui/react";
import { useState } from "react";

const TOTAL = 8;

/** The café's own stamp: a matcha cup, drawn in currentColor so it takes the ink. */
const cup = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M10 17h25l-2.6 19.5c-.3 2.4-2.3 4.2-4.7 4.2H17.4c-2.4 0-4.4-1.8-4.7-4.2Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M35 21.5c4.4-.6 6.6 1.6 6.1 4.6-.5 3-3.4 4.6-7.4 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M13.4 24.5c5.6 1.8 13.6 1.8 20 0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M19 6.5c-2 2.6 2 4.4 0 7M26 6.5c-2 2.6 2 4.4 0 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/** A café loyalty card with a custom stamp: each "Buy a matcha" thunks the next cup onto the card. */
export function StampCardDemo() {
  const [filled, setFilled] = useState(3);
  const full = filled >= TOTAL;
  return (
    <div style={{ display: "grid", gap: 28, width: "100%" }}>
      <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
        <StampCard total={TOTAL} filled={filled} title="Matcha Corner" stamp={cup} ink="leaf" seed="matcha-corner" />
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <Button size="sm" variant={full ? "mustard" : "ink"} onClick={() => setFilled(full ? 0 : filled + 1)}>
            {full ? "Redeem and start a new card" : "Buy a matcha"}
          </Button>
          {/* Polite, so the stamp count is spoken after each purchase without moving focus. */}
          <span role="status" style={{ color: "var(--plop-on-soft)" }}>
            {full ? "Your next matcha is free!" : `${TOTAL - filled} more for a free matcha`}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        <StampCard total={6} filled={4} title="Hojicha Club" seed="hojicha-club" />
        <StampCard total={10} filled={10} title="Mixed inks" seed="mixed-inks" />
      </div>
    </div>
  );
}
