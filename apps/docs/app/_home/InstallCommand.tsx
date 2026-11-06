"use client";

import { useState } from "react";
import { CopyCommand } from "./CopyCommand";

const COMMANDS = { npm: "npm i @plop-ui/react", shadcn: "npx shadcn add @plopui/button" } as const;

/** The hero's install box. Hick's law: one command up front, shadcn one quiet link away. */
export function InstallCommand() {
  const [tool, setTool] = useState<keyof typeof COMMANDS>("npm");
  const other = tool === "npm" ? "shadcn" : "npm";
  return (
    <span className="home-install">
      <CopyCommand command={COMMANDS[tool]} what={`${tool} command`} />
      <button type="button" className="home-install__alt" onClick={() => setTool(other)}>
        Using {other}?
      </button>
    </span>
  );
}
