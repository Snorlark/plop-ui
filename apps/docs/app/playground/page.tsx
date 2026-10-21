import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "../_site/SiteFooter";
import { SiteHeader } from "../_site/SiteHeader";
import { Playground } from "./Playground";

export const metadata: Metadata = {
  title: "Playground",
  description: "Try every Plop! component live: change props, switch surfaces and themes, and copy the code.",
};

export default function PlaygroundPage() {
  return (
    <div className="site site--docs">
      <SiteHeader />
      <main id="main" className="pg-page">
        <h1 className="doc-h1">Playground</h1>
        <p className="doc-lede">Pick a piece, change its props, try it on every paper in light and dark, then copy the code.</p>
        <Suspense fallback={<p>Loading the playground…</p>}>
          <Playground />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
