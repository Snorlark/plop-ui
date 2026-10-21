import type { ReactNode } from "react";
import { Breadcrumb, DocNav, DocPager } from "../_site/DocNav";
import { SiteFooter } from "../_site/SiteFooter";
import { SiteHeader } from "../_site/SiteHeader";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site site--docs">
      <SiteHeader />
      <div className="doc-shell" id="top">
        <DocNav />
        <main className="doc-main content" id="main">
          <Breadcrumb />
          {children}
          <DocPager />
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
