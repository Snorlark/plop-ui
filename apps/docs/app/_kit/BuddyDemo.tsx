"use client";

import { Buddy, BUDDY_CAST, BuddyPeek, Button, Callout, Toast, TicketCard, toast, type BuddyMood } from "@plop-ui/react";

const MOODS = Object.keys(BUDDY_CAST) as BuddyMood[];

/** The cast, then the characters at work on a toast, a callout and a card. */
export function BuddyDemo() {
  return (
    <div className="stack" style={{ gap: 44 }}>
      <ul className="buddy-cast">
        {MOODS.map((mood) => (
          <li key={mood}>
            <Buddy mood={mood} size="lg" />
            <strong>{BUDDY_CAST[mood].name}</strong>
            <code>mood=&quot;{mood}&quot;</code>
            <span>{BUDDY_CAST[mood].purpose}</span>
          </li>
        ))}
      </ul>

      <div className="buddy-attached">
        <Toast kind="success" buddy>
          Copied to clipboard
        </Toast>
        <Toast kind="error" buddy>
          Couldn&apos;t send. Saved for later.
        </Toast>
        <Toast kind="success" buddy="congrats">
          Zine finished. Nice work!
        </Toast>
      </div>

      <div className="buddy-attached">
        <Callout tone="warn" title="Last update 12 min ago" buddy>
          Drafts may be out of date. Pull to refresh.
        </Callout>
        <BuddyPeek mood="preview" side="end">
          <TicketCard meta="#1042 · Draft" title="Cat in a teacup, take two" stub="Preview">
            Not posted yet. Give it a title before you publish.
          </TicketCard>
        </BuddyPeek>
      </div>

      <div className="row" style={{ gap: 40, justifyContent: "center", paddingTop: 50 }}>
        <Button variant="tomato" buddy buddyMood="error" onClick={() => toast.error("Still offline", { buddy: true })}>
          Retry
        </Button>
        <Button variant="mint" buddy buddyMood="congrats" onClick={() => toast.success("Zine finished. Nice work!", { buddy: "congrats" })}>
          Finish the zine
        </Button>
        <Button variant="plain" buddy="peek" buddyMood="preview">
          Preview draft
        </Button>
      </div>

      <div className="row" style={{ gap: 14, justifyContent: "center" }}>
        <Button size="sm" variant="mint" onClick={() => toast.success("Sketch posted", { buddy: true })}>
          Success toast
        </Button>
        <Button size="sm" variant="tomato" onClick={() => toast.error("Couldn't reach the server", { buddy: true })}>
          Error toast
        </Button>
        <Button size="sm" variant="mustard" onClick={() => toast("Every page is filled", { buddy: "congrats" })}>
          Congrats toast
        </Button>
        <Button size="sm" variant="plain" onClick={() => toast("Syncing offline sketches…", { buddy: "thinking" })}>
          Thinking toast
        </Button>
      </div>
    </div>
  );
}
