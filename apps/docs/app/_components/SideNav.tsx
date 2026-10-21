"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";

export function SideNav() {
  const path = usePathname();
  return (
    <nav aria-label="Docs">
      <ul className="nav">
        {NAV.map((section) => (
          <li key={section.group}>
            <div className="nav__group">{section.group}</div>
            <ul className="nav">
              {section.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileNav() {
  const path = usePathname();
  return (
    <nav className="mnav" aria-label="Docs (compact)">
      {NAV.flatMap((s) => s.links).map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
