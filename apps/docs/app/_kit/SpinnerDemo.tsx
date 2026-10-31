"use client";

import { Button, Spinner, toast, type SpinnerKind } from "@plop-ui/react";
import { useEffect, useRef, useState } from "react";

const KINDS: Array<{ kind: SpinnerKind; name: string; use: string }> = [
  { kind: "ink", name: "Ink loop", use: "The default. A marker circle that never closes neatly." },
  { kind: "dots", name: "Hopping dots", use: "Inline, in buttons and chat." },
  { kind: "scribble", name: "Scribble", use: "Drawing, writing, generating." },
  { kind: "sticker", name: "Coin-flip sticker", use: "Rewards, unlocks, the fun waits." },
  { kind: "buddy", name: "Hum", use: "Full-page waits and empty states." },
];

const tile = {
  display: "grid",
  justifyItems: "center",
  alignContent: "center",
  gap: 14,
  minHeight: 150,
  padding: "18px 12px",
  textAlign: "center",
  border: "2px dashed var(--plop-line-a)",
  borderRadius: "14px 10px 15px 11px",
} as const;

/** Every kind, the sizes, and a Button that loads with it. */
export function SpinnerDemo() {
  const [sending, setSending] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = () => {
    setSending(true);
    timer.current = window.setTimeout(() => {
      setSending(false);
      toast.success("Sent!", { buddy: true });
    }, 1800);
  };

  return (
    <div className="stack" style={{ gap: 36 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
        {KINDS.map((k) => (
          <div key={k.kind} style={tile}>
            <Spinner kind={k.kind} size="lg" label={`Loading, ${k.name}`} seed={k.kind} />
            <div>
              <b style={{ display: "block", fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 13 }}>{k.name}</b>
              <small style={{ color: "var(--plop-on-soft)" }}>{k.use}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 28, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <Spinner size="sm" seed="s" />
        <Spinner size="md" seed="m" />
        <Spinner size="lg" seed="l" />
        <Spinner style={{ color: "var(--plop-tomato)" }} seed="t" />
        <Spinner style={{ color: "var(--plop-leaf)" }} seed="g" />
        <Spinner kind="dots" showLabel label="Saving your board" />
        <Spinner kind="sticker" tone="bubblegum" seed="b" />
      </div>
      <div className="row" style={{ gap: 20, justifyContent: "center" }}>
        <Button variant="ink" loading={sending} loadingLabel="Sending" onClick={send} seed="spin-send">
          Send report
        </Button>
      </div>
    </div>
  );
}
