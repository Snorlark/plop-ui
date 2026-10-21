"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { ALL_LINKS } from "./nav";

/** Filters the docs pages as you type. Enter opens the first match; Escape clears. */
export function Search() {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return ALL_LINKS.filter((l) => `${l.label} ${l.keywords ?? ""}`.toLowerCase().includes(needle)).slice(0, 8);
  }, [q]);

  return (
    <div className="site-search">
      <label className="site-search__box">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 L 21 21" />
        </svg>
        <span className="vh">Search the docs</span>
        <input
          type="search"
          placeholder="Search components"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) {
              router.push(results[0].href);
              setQ("");
            }
            if (e.key === "Escape") setQ("");
          }}
          aria-controls={results.length ? id : undefined}
          aria-describedby={`${id}-count`}
        />
      </label>
      <span className="vh" id={`${id}-count`} aria-live="polite">
        {q ? `${results.length} result${results.length === 1 ? "" : "s"}` : ""}
      </span>
      {results.length > 0 && (
        <ul className="site-search__results" id={id}>
          {results.map((r) => (
            <li key={r.href}>
              <Link href={r.href} onClick={() => setQ("")}>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {q && results.length === 0 && <p className="site-search__empty">Nothing matches “{q}”.</p>}
    </div>
  );
}
