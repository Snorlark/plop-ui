"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@plop-ui/react";

/** Button: the hero sticker. Peels on hover, squishes on press, springs back. */
export function ButtonExample() {
  const [cancelling, setCancelling] = useState(false);
  return (
    <>
      <Button variant="ink" size="lg" buddy>
        Post sketch
      </Button>
      {/* buddy="peek": the buddy pops up on hover or focus. Pass as={Link} to use your router's link. */}
      <ButtonLink href="/start" size="lg" buddy="peek">
        Get started
      </ButtonLink>

      <Button shadow="stripes">Crayon shadow</Button> {/* or "solid", "outline", "none"; default "soft" */}
      <Button variant="mint" burst>
        Mark as shipped
      </Button>
      <Button burst="stars">You did it</Button> {/* "confetti" | "stars" | "sparkle" | "hearts" */}
      <Button burst="zap">Try again</Button> {/* went wrong, shakes too: "poof" | "zap" | "drops" */}

      <Button variant="periwinkle">Add note</Button>
      <Button
        variant="tomato"
        loading={cancelling}
        onClick={() => {
          setCancelling(true);
          setTimeout(() => setCancelling(false), 1500);
        }}
      >
        Delete draft
      </Button>
      <Button variant="plain">Skip for now</Button>
    </>
  );
}
