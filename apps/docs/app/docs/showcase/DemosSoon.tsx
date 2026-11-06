"use client";

import { Buddy, Button, Callout, Heading, Sheet } from "@plop-ui/react";
import { useId, useRef } from "react";
import styles from "./showcase.module.css";

/**
 * The small "Looking for our own demo apps?" Callout. Its demo.plopui.com sticker, while that site isn't live,
 * opens a "Plop-ing soon!" note in the middle of the screen. The <dialog> sits beside the Callout, not in it,
 * so the Callout's styles never reach it. A native <dialog> traps focus, closes on Escape and hands focus back.
 */
export function DemosSoon({ host, className }: { host: string; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  return (
    <>
      <Callout
        tone="info"
        headingLevel={2}
        title="Looking for our own demo apps?"
        className={className}
        action={
          <Button size="sm" variant="plain" tilt={-1} burst={false} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
            {host}
          </Button>
        }
      />
      <dialog
        ref={dialog}
        aria-labelledby={title}
        className={styles.soon}
      >
        <Sheet tape="mint" tilt={-1} className={styles.soonSheet}>
          <Buddy mood="thinking" size="lg" />
          <span id={title}>
            <Heading level={2} scribble={false} writeOn={false}>
              Plop-ing soon!
            </Heading>
          </span>
          <p>Our demo apps are still drying on the page. Fresh ink smudges, so we&apos;re giving it a minute.</p>
          <Button variant="ink" tilt={1} onClick={() => dialog.current?.close()}>
            I&apos;ll wait
          </Button>
        </Sheet>
      </dialog>
    </>
  );
}
