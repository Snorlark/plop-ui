"use client";

import { ArrowDownIcon, IconButton } from "@plop-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { DOC_NAV, neighbors } from "./nav";

function Links() {
  const path = usePathname();
  // Rendered twice (sidebar and phone disclosure), so ids get a per-copy prefix.
  const uid = useId();
  // A page's sections start open on that page and folded everywhere else; a press remembers the choice.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  return (
    <>
      {DOC_NAV.map((section) => (
        <div key={section.group} className="doc-nav__group">
          <div className="doc-nav__label">{section.group}</div>
          <ul>
            {section.links.map((l) => {
              const open = toggled[l.href] ?? path === l.href;
              const listId = `${uid}-${l.href.replace(/\W+/g, "-")}`;
              return (
                <li key={l.href}>
                  <span className="doc-nav__row">
                    <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>
                      {l.label}
                    </Link>
                    {l.sub && (
                      <span className="doc-nav__toggle" data-open={open ? "" : undefined}>
                        <IconButton
                          size="sm"
                          variant="plain"
                          shadow="none"
                          tilt={0}
                          burst={false}
                          icon={<ArrowDownIcon />}
                          label={`${open ? "Hide" : "Show"} ${l.label} sections`}
                          aria-expanded={open}
                          aria-controls={listId}
                          onClick={() => setToggled((t) => ({ ...t, [l.href]: !open }))}
                        />
                      </span>
                    )}
                  </span>
                  {l.sub && (
                    // Folded lists use `hidden`: the links stay in the HTML for search engines.
                    <ul id={listId} className="doc-nav__sub" hidden={!open}>
                      {l.sub.map((x) => (
                        <li key={x.href}>
                          <Link href={x.href}>{x.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
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
