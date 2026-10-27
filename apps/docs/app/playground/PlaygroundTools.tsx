"use client";

import { Tab, TabList, TabPanel, Tabs } from "@plop-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LetteringStudio } from "./LetteringStudio";
import { Playground } from "./Playground";
import { StickerBoard } from "./StickerBoard";
import styles from "./tools.module.css";

type Tool = "board" | "lettering" | "tweak";

const TOOLS: Array<{ id: Tool; label: string; short: string; blurb: string }> = [
  { id: "board", label: "Sticker board", short: "Board", blurb: "Stick real components on paper and copy the layout." },
  { id: "lettering", label: "Lettering", short: "Lettering", blurb: "Type in Sketchpop, decorate it, export it." },
  { id: "tweak", label: "Tweak a component", short: "Tweak", blurb: "Every prop of one component, on every paper." },
];

/**
 * Three tools, one at a time: fewer choices on screen means a faster first
 * step (Hick's law). The chosen tool lives in the address, so a link opens it.
 */
const PHONE = "(max-width: 640px)";
const onResize = (cb: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function PlaygroundTools() {
  // Short tab names on phones keep the three tabs on one row (the server renders the long ones).
  const narrow = useSyncExternalStore(onResize, () => window.matchMedia(PHONE).matches, () => false);
  const params = useSearchParams();
  const initial: Tool = params.get("tool") === "lettering" ? "lettering" : params.get("tool") === "tweak" || params.get("c") ? "tweak" : "board";
  const [tool, setTool] = useState<Tool>(initial);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tool", tool);
    if (tool !== "tweak") ["c", "surface", "theme"].forEach((k) => url.searchParams.delete(k));
    window.history.replaceState(null, "", url);
  }, [tool]);

  return (
    <Tabs value={tool} onValueChange={(v) => setTool(v as Tool)} className={styles.tools}>
      <TabList label="Playground tools">
        {TOOLS.map((t) => (
          <Tab key={t.id} value={t.id}>
            {narrow ? t.short : t.label}
          </Tab>
        ))}
      </TabList>
      {TOOLS.map((t) => (
        <TabPanel key={t.id} value={t.id} className={styles.toolPanel}>
          <p className={styles.blurb}>{t.blurb}</p>
          {tool === t.id && (t.id === "board" ? <StickerBoard /> : t.id === "lettering" ? <LetteringStudio /> : <Playground />)}
        </TabPanel>
      ))}
    </Tabs>
  );
}
