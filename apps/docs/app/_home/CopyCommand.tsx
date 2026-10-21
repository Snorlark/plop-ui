"use client";

import { toast } from "@plop-ui/react";

/** The install command with a copy button. */
export function CopyCommand({ command = "npm i @plop-ui/react" }: { command?: string }) {
  return (
    <span className="home-npm">
      <code>{command}</code>
      <button
        type="button"
        aria-label="Copy install command"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            toast.success("Copied to clipboard");
          } catch {
            toast.error("Couldn't copy. Select it instead.");
          }
        }}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 9 C 9 8, 9.5 7.5, 10.5 7.5 L 19 7.5 C 20 7.5, 20.5 8, 20.5 9 L 20.5 19 C 20.5 20, 20 20.5, 19 20.5 L 10.5 20.5 C 9.5 20.5, 9 20, 9 19 Z" />
          <path d="M5 15.5 C 4 15.5, 3.5 15, 3.5 14 L 3.5 5 C 3.5 4, 4 3.5, 5 3.5 L 14 3.5 C 15 3.5, 15.5 4, 15.5 5" />
        </svg>
      </button>
    </span>
  );
}
