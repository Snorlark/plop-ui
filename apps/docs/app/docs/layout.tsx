import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { MobileNav, SideNav } from "../_components/SideNav";
import { SurfaceSwitcher } from "../_components/SurfaceSwitcher";
import { parseSurface, parseTheme, SURFACE_COOKIE, THEME_COOKIE } from "../surface";

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  return (
    <div className="shell">
      <aside className="side" aria-label="Sections">
        <Link className="brand" href="/">
          <Image src="/plop-logo.png" alt="Plop UI" width={992} height={382} priority />
        </Link>
        <SideNav />
      </aside>
      <div>
        <div className="topbar">
          <Link className="topbar__brand" href="/">
            <Image src="/plop-logo.png" alt="Plop UI" width={992} height={382} />
          </Link>
          <SurfaceSwitcher surface={parseSurface(jar.get(SURFACE_COOKIE)?.value)} theme={parseTheme(jar.get(THEME_COOKIE)?.value)} />
        </div>
        <MobileNav />
        <main className="content" id="main">
          {children}
        </main>
        <footer className="foot">Plop! v0.1 · MIT · Sketchpop is SIL OFL 1.1 · Press it like you mean it.</footer>
      </div>
    </div>
  );
}
