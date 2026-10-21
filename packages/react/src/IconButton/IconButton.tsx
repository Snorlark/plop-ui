"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Sticker, type StickerOwnProps } from "../internal/Sticker.js";

export interface IconButtonProps
  extends StickerOwnProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  ref?: Ref<HTMLButtonElement>;
  /** The icon. Decorative: it is hidden from screen readers. */
  icon: ReactNode;
  /** What the button does, e.g. "Start SOS call". Required: it becomes the accessible name. */
  label: string;
}

/** A round sticker with just an icon. `label` is required, so it can never ship without a name. */
export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <Sticker {...props} round aria-label={label}>
      <span aria-hidden="true" style={{ display: "contents" }}>
        {icon}
      </span>
    </Sticker>
  );
}
