"use client";

import type { ElementType, ReactNode } from "react";
import { Button, ButtonLink } from "../Button/Button.js";
import type { Seed } from "../seed.js";

interface ControlProps {
  className?: string;
  page: number;
  label: string;
  current: boolean;
  loading: boolean;
  loadingLabel: string;
  disabled: boolean;
  href?: string;
  as?: ElementType;
  onPageChange?: (page: number) => void;
  seed: Seed;
  rel?: "prev" | "next";
  children: ReactNode;
}

/** Uses the same paper edge, ink, keyboard press and reduced-motion handling as Button. */
export function PaginationControl({ className, page, label, current, loading, loadingLabel, disabled, href, as, onPageChange, seed, rel, children }: ControlProps) {
  const shared = {
    size: "sm" as const, variant: current ? "ink" as const : "plain" as const,
    seed, shadow: "soft" as const, className,
    "aria-label": label, "aria-current": current ? "page" as const : undefined,
  };
  // A loading page is mid-fetch, so it is a busy button, not a link to follow again.
  if (href !== undefined && !loading) return <ButtonLink {...shared} href={href} as={as} rel={rel} onClick={(event) => {
    if (!current && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onPageChange?.(page);
  }}>{children}</ButtonLink>;
  return <Button {...shared} type="button" disabled={disabled} loading={loading} loadingLabel={loadingLabel} onClick={() => { if (!current) onPageChange?.(page); }}>{children}</Button>;
}
