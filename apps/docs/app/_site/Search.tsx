"use client";

import { CommandPalette, CuttingMatIcon, ExternalIcon, PaperIcon, PlusIcon, toast, useIsMac, type SearchGroup, type SearchItem } from "@plop-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFeedback } from "../_kit/Providers";
import { stamp } from "./pass";
import { DOC_NAV, GITHUB } from "./nav";

const Doc = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3.6 C 9 3.3, 11.8 3.4, 14.4 3.6 L 18.6 7.8 C 18.9 11.8, 18.8 16.4, 18.4 20.4 C 14.4 20.8, 10 20.7, 6 20.4 C 5.6 14.8, 5.6 9.2, 6 3.6 Z M8.8 12.2 C 10.8 12, 13 12.3, 15.4 12" />
  </svg>
);
const Sticker = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 8 C 5 5.5, 6.5 4.5, 9 4.5 L 16 4.4 C 18.5 4.4, 19.6 5.6, 19.6 8 L 19.7 15 C 19.7 17.6, 18.5 18.8, 16 18.8 L 9 18.9 C 6.4 18.9, 5 17.6, 5 15 Z" />
  </svg>
);

/**
 * The site's search: a sticker-field button in the header that opens the kit's
 * CommandPalette (⌘K / Ctrl K, or "/"). Finds every component and docs page,
 * and has quick actions before you type.
 */
export function Search() {
  const router = useRouter();
  const mac = useIsMac();
  const [open, setOpen] = useState(false);
  const { surface, setSurface } = useFeedback();

  // "/" opens it too, unless someone's typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const groups: SearchGroup[] = useMemo(
    () =>
      DOC_NAV.map((s) => ({
        id: s.group,
        label: s.group === "Getting started" ? "Docs" : s.group,
        items: s.links.flatMap((l) => [l, ...(l.sub ?? []).map((x) => ({ ...x, label: `${l.label}: ${x.label}`, keywords: l.keywords }))]).map((l) => ({ id: l.href, title: l.label, sub: l.href.startsWith("/docs/components/") ? "Component" : l.href, keywords: l.keywords, lead: l.href.startsWith("/docs/components/") ? <Sticker /> : <Doc /> })),
      })),
    [],
  );

  const actions: SearchGroup[] = useMemo(
    () => [
      {
        id: "actions",
        label: "Quick actions",
        items: [
          { id: "browse", title: "Browse components", sub: "Every piece on one page", lead: <Sticker /> },
          { id: "/playground", title: "Open the playground", sub: "Stick, letter, tweak", lead: <PlusIcon /> },
          { id: "surface", title: surface === "mat" ? "Back to paper" : "Lay it on the cutting mat", sub: "The site's light and dark look", lead: surface === "mat" ? <PaperIcon /> : <CuttingMatIcon /> },
          { id: "install", title: "Copy the install command", sub: "npm i @plop-ui/react", lead: <Doc /> },
          { id: "github", title: "Open GitHub", sub: "Star it, read it, fork it", lead: <ExternalIcon /> },
        ],
      },
    ],
    [surface],
  );

  const onSelect = async (item: SearchItem) => {
    if (item.id === "browse") return router.push("/docs/components/button");
    if (item.id === "surface") return setSurface(surface === "mat" ? "poster" : "mat");
    if (item.id === "github") {
      stamp("github");
      window.open(GITHUB, "_blank", "noopener");
      return;
    }
    if (item.id === "install") {
      try {
        await navigator.clipboard.writeText("npm i @plop-ui/react");
        stamp("install");
        toast.success("Copied to clipboard!", { buddy: true });
      } catch {
        toast.error("Couldn't copy. Select it instead.", { buddy: true });
      }
      return;
    }
    router.push(item.id);
  };

  return (
    <>
      <button type="button" className="site-search" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="site-search__lens">
          <path d="M10.6 3.8 C 14.6 3.6, 17.4 6.4, 17.2 10.4 C 17 14.2, 14.2 16.9, 10.4 16.8 C 6.6 16.7, 3.9 14, 4 10.2 C 4.1 6.6, 6.8 3.9, 10.6 3.8 Z" />
          <path d="M15.4 15.6 C 17.2 17.2, 18.8 18.8, 20.6 20.8" strokeWidth="3.2" />
        </svg>
        <span className="site-search__text">Search…</span>
        <span className="site-search__keys" aria-hidden="true">
          <kbd>{mac ? "⌘" : "Ctrl"}</kbd>
          <kbd>K</kbd>
        </span>
        <span className="vh">Search the docs ({mac ? "Command" : "Control"} K)</span>
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} groups={groups} emptyGroups={actions} onSelect={onSelect} recentKey="plop-site-recent" placeholder="Search components, docs and actions" />
    </>
  );
}
