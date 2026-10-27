import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "../_site/SiteFooter";
import { SiteHeader } from "../_site/SiteHeader";
import { PlaygroundTools } from "./PlaygroundTools";

export const metadata: Metadata = {
  title: "Playground",
  description: "Stick real PlopUI components on a board, letter anything in Sketchpop, or tweak every prop, then copy the code or export an image.",
};

export default function PlaygroundPage() {
  return (
    <div className="site site--docs">
      <SiteHeader />
      <main id="main" className="pg-page">
        {/* One slim line, so the board gets the screen. */}
        <div className="pg-head">
          <h1 className="pg-h1">Playground</h1>
          <p className="pg-lede">Play with the real components, then take your work away as code, HTML or an image.</p>
        </div>
        <Suspense fallback={<p>Loading the playground…</p>}>
          <PlaygroundTools />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
