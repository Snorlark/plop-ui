import type { Metadata } from "next";
import { Home } from "./_home/Home";
import { SiteFooter } from "./_site/SiteFooter";
import { SiteHeader } from "./_site/SiteHeader";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <div className="site site--home">
      <SiteHeader />
      <Home />
      <SiteFooter />
    </div>
  );
}
