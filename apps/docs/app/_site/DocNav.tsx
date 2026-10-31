"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_NAV, neighbors } from "./nav";

function Links() {
  const path = usePathname();
  return (
    <>
      {DOC_NAV.map((section) => (
        <div key={section.group} className="doc-nav__group">
          <div className="doc-nav__label">{section.group}</div>
          <ul>
            {section.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>
                  {l.label}
                </Link>
                {l.sub && (
                  <ul className="doc-nav__sub">
                    {l.sub.map((x) => (
                      <li key={x.href}>
                        <Link href={x.href}>{x.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/** Desktop sidebar plus a "Browse the docs" disclosure on phones. */
export function DocNav() {
  return (
    <>
      <nav aria-label="Docs" className="doc-nav">
        <Links />
      </nav>
      <details className="doc-nav-mobile">
        <summary>Browse the docs</summary>
        <nav aria-label="Docs (compact)" className="doc-nav">
          <Links />
        </nav>
      </details>
    </>
  );
}

/** Previous / next links in reading order. */
export function DocPager() {
  const path = usePathname();
  const { prev, next } = neighbors(path);
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next" className="doc-pager">
      {prev ? (
        <Link href={prev.href}>
          <span>Previous</span>
          <strong>{prev.label}</strong>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className="doc-pager__next">
          <span>Next</span>
          <strong>{next.label}</strong>
        </Link>
      )}
    </nav>
  );
}

/** "Section / Page" above the title. */
export function Breadcrumb() {
  const path = usePathname();
  const section = DOC_NAV.find((s) => s.links.some((l) => l.href === path));
  const page = section?.links.find((l) => l.href === path);
  if (!section || !page) return null;
  return (
    <div className="doc-crumb">
      {section.group} / {page.label}
    </div>
  );
}
