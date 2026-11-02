"use client";

import type { CSSProperties } from "react";
import { Buddy, Button, Heading, type BuddyMood } from "@plop-ui/react";

export interface EmptyStateBlockProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  mood?: BuddyMood;
}

/** An empty state with a buddy, a short message and one clear next step, for lists and boards with nothing in them yet. */
export function EmptyStateBlock({
  title = "Nothing here yet",
  message = "Your sketchbook is empty. Start with one quick doodle; it doesn't have to be good.",
  actionLabel = "Post your first sketch",
  onAction,
  mood = "preview",
}: EmptyStateBlockProps) {
  return (
    <section style={wrap} aria-labelledby="plop-empty-title">
      <Buddy mood={mood} size="lg" />
      <Heading level={3} id="plop-empty-title">
        {title}
      </Heading>
      <p style={text}>{message}</p>
      <Button variant="ink" burst onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
}

const wrap: CSSProperties = { display: "grid", justifyItems: "center", gap: 14, padding: "40px 24px", textAlign: "center", maxWidth: 420, margin: "0 auto" };
const text: CSSProperties = { margin: "0 0 10px", color: "var(--plop-on-soft)" };
