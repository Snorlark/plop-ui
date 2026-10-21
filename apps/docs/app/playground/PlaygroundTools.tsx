"use client";

import { Tab, TabList, TabPanel, Tabs } from "@plop-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LetteringStudio } from "./LetteringStudio";
import { Playground } from "./Playground";
import { StickerBoard } from "./StickerBoard";
import styles from "./tools.module.css";

type Tool = "board" | "lettering" | "tweak";

const TOOLS: Array<{ id: Tool; label: string; blurb: string }> = [
  { id: "board", label: "Sticker board", blurb: "Stick real components on paper and copy the layout." },
  { id: "lettering", label: "Lettering", blurb: "Type in Sketchpop, decorate it, export it." },
  { id: "tweak", label: "Tweak a component", blurb: "Every prop of one component, on every paper." },
];

/**
 * Three tools, one at a time: fewer choices on screen means a faster first
 * step (Hick's law). The chosen tool lives in the address, so a link opens it.
 */
export function PlaygroundTools() {
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
            {t.label}
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
