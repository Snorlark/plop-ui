import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "../_site/SiteFooter";
import { SiteHeader } from "../_site/SiteHeader";
import { PlaygroundTools } from "./PlaygroundTools";
import styles from "./tools.module.css";
import { pageMeta } from "../_site/meta";

export const metadata: Metadata = pageMeta({
  title: "Playground",
  description: "Stick real PlopUI components on a board, letter anything in Sketchpop, or tweak every prop, then copy the code or export an image.",
  path: "/playground",
});

export default function PlaygroundPage() {
  return (
    <div className="site site--docs">
      <SiteHeader />
      <main id="main" className="pg-page">
        <h1 className="doc-h1">Playground</h1>
        <p className="doc-lede">Play with the real components, then take your work away as code, HTML or an image.</p>
        <Suspense fallback={<p className={styles.fallback}>Loading the playground…</p>}>
          <PlaygroundTools />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
