"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ElementType, ReactNode, Ref } from "react";
import { Sticker, StickerLink, type StickerOwnProps } from "../internal/Sticker.js";
import { Lettering } from "../Lettering/Lettering.js";

export type ButtonVariant = NonNullable<StickerOwnProps["variant"]>;
export type ButtonSize = NonNullable<StickerOwnProps["size"]>;

export interface ButtonProps extends StickerOwnProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  ref?: Ref<HTMLButtonElement>;
  /** Short label; lettered in Sketchpop Bold Italic, uppercase. */
  children: ReactNode;
  /** A little character peeking over the top. Use it on the one action that matters most on a screen. */
  buddy?: boolean;
  /** An icon drawn before the label. */
  iconLeft?: ReactNode;
}

/**
 * The hero sticker. Peels on hover, squishes on press (pointer, Space or
 * Enter), springs back on release. A native `<button>` underneath.
 */
export function Button({ children, iconLeft, buddy = false, ...props }: ButtonProps) {
  return (
    <Sticker {...props} buddy={buddy}>
      {iconLeft}
      <span>
        <Lettering amp={1.8}>{children}</Lettering>
      </span>
    </Sticker>
  );
}

export interface ButtonLinkProps
  extends Omit<StickerOwnProps, "loading" | "loadingLabel">,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  ref?: Ref<HTMLAnchorElement>;
  href: string;
  children: ReactNode;
  /** Your router's link component, e.g. Next.js `Link`. Default `a`. */
  as?: ElementType;
  buddy?: boolean;
  iconLeft?: ReactNode;
}

/** A Button that navigates: the same sticker, rendered as a link. */
export function ButtonLink({ children, iconLeft, buddy = false, ...props }: ButtonLinkProps) {
  return (
    <StickerLink {...props} buddy={buddy}>
      {iconLeft}
      <span>
        <Lettering amp={1.8}>{children}</Lettering>
      </span>
    </StickerLink>
  );
}
