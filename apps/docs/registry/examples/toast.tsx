"use client";

import { Button, toast } from "@plop-ui/react";

/** Toast: call toast() from anywhere. <PlopProvider> already shows them, so there's no <Toaster /> to add. */
export function ToastExample() {
  return (
    <>
      <Button onClick={() => toast.success("Sketch posted")}>Success</Button>
      <Button variant="tomato" onClick={() => toast.error("Couldn't post. Saved for later.")}>
        Error
      </Button>
      <Button variant="plain" onClick={() => toast("Rosa liked your sketch", { duration: 6000 })}>
        Info
      </Button>

      {/* A burst when it lands (off by default): true picks confetti for success, a poof and a shake for error. */}
      <Button variant="mint" onClick={() => toast.success("All done!", { burst: true, buddy: "congrats" })}>
        Celebrate
      </Button>
      <Button variant="tomato" onClick={() => toast.error("Couldn't post", { burst: "zap" })}>
        Zap
      </Button>

      {/* Behind a live toast: <PlopProvider toastBackdrop="solid" | "dots" | "none">. */}
    </>
  );
}
