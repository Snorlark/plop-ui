"use client";

import { Buddy, BuddyPeek, Button, Callout, TicketCard, toast } from "@plop-ui/react";

/** Buddy: the cast on its own, peeking over things, and built into toasts, callouts and buttons. */
export function BuddyExample() {
  return (
    <>
      <Buddy mood="congrats" size="lg" />

      {/* Peek over anything: the head ducks behind it, the hands grip the edge. */}
      <BuddyPeek mood="preview">
        <TicketCard title="Cat in a teacup" meta="#1042 · Draft" />
      </BuddyPeek>

      {/* Built into Toast and Callout: true picks the character for the kind or tone. */}
      <Button onClick={() => toast.success("Copied to clipboard", { buddy: true })}>Copy (Pip)</Button>
      <Button onClick={() => toast("Every page is filled", { buddy: "congrats" })}>Finish (Confetti)</Button>
      <Callout tone="warn" title="Last update 12 min ago" buddy />

      {/* On a Button: pick who peeks over it. */}
      <Button variant="tomato" buddy buddyMood="error">
        Retry
      </Button>
    </>
  );
}
