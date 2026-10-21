"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GITHUB } from "./nav";

const NAV = [
  { href: "/docs/getting-started", label: "Docs", match: (p: string) => p.startsWith("/docs") && !p.startsWith("/docs/components") && p !== "/docs/nextjs" },
  { href: "/docs/components/button", label: "Components", match: (p: string) => p.startsWith("/docs/components") },
  { href: "/playground", label: "Playground", match: (p: string) => p.startsWith("/playground") },
  { href: "/docs/nextjs", label: "Next.js guide", match: (p: string) => p === "/docs/nextjs" },
];

/** The main nav; marks the section you're in. */
export function MainNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="site-header__nav">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={n.match(path) ? "page" : undefined}>
          {n.label}
        </Link>
      ))}
      <a href={GITHUB}>GitHub</a>
    </nav>
  );
}
