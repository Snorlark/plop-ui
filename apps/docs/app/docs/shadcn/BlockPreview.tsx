"use client";

import { EmptyStateBlock } from "../../../registry/blocks/empty-state";
import { SettingsPanel } from "../../../registry/blocks/settings-panel";
import { SignupCard } from "../../../registry/blocks/signup-card";

/** The blocks rendered live from the same files the registry ships, so the preview is exactly what you install. */
const BLOCKS = {
  "settings-panel": SettingsPanel,
  "signup-card": SignupCard,
  "empty-state": EmptyStateBlock,
} as const;

export function BlockPreview({ name }: { name: string }) {
  const Block = BLOCKS[name as keyof typeof BLOCKS];
  if (!Block) return null;
  return (
    <div className="registry-preview" aria-label={`Live preview: ${name}`} role="group">
      <Block />
    </div>
  );
}
