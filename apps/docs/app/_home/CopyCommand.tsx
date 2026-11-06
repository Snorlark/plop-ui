"use client";

import { CheckIcon, CopyIcon, IconButton, toast } from "@plop-ui/react";
import { useEffect, useState } from "react";
import { stamp } from "../_site/pass";

/** The install command with a copy sticker. The icon turns into a tick for a moment after copying. */
export function CopyCommand({ command = "npm i @plop-ui/react", what = "install command" }: { command?: string; what?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <span className="home-npm">
      <code>{command}</code>
      <IconButton
        size="sm"
        variant={copied ? "mint" : "mustard"}
        tilt={4}
        label={copied ? `Copied ${what}` : `Copy ${what}`}
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            stamp("install");
            toast.success("Copied to clipboard!", { buddy: true });
          } catch {
            toast.error("Couldn't copy. Select it instead.", { buddy: true });
          }
        }}
      />
    </span>
  );
}
