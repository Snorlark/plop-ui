import { Avatar } from "@plop-ui/react";
import Link from "next/link";
import { GITHUB } from "./nav";
import { Wordmark } from "./Wordmark";

const COLUMNS: Array<[string, Array<[string, string]>]> = [
  ["Product", [["Components", "/docs/components/button"], ["Playground", "/playground"], ["Surfaces", "/docs/surfaces"], ["Tokens", "/docs/tokens"]]],
  ["Resources", [["Documentation", "/docs/getting-started"], ["Next.js guide", "/docs/nextjs"], ["Every piece", "/kit"], ["Changelog", `${GITHUB}/releases`]]],
  ["Community", [["GitHub", GITHUB], ["npm", "https://www.npmjs.com/package/@plop-ui/react"], ["Contributing", `${GITHUB}/blob/main/TASKS.md`], ["Roadmap", `${GITHUB}/blob/main/PRD.md`]]],
  ["Legal", [["License", `${GITHUB}/blob/main/LICENSE`], ["Sketchpop font (OFL 1.1)", `${GITHUB}/blob/main/packages/fonts/OFL.txt`], ["Accessibility", "/docs/accessibility"]]],
];

const CREW = ["Rosa Santos", "Jun Reyes", "Mika Tan", "Ben Ocampo", "Tess Mercado"];

function Item({ label, href }: { label: string; href: string }) {
  return href.startsWith("/") ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>;
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__find">
          <span>Find PlopUI on</span>
          <a href={GITHUB} aria-label="GitHub" className="site-footer__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
            </svg>
          </a>
          <a href="https://www.npmjs.com/package/@plop-ui/react" aria-label="npm" className="site-footer__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h18v7H12v2H8v-2H3z M7 11v4 M12 11v2 M16 11v4 M19 11v4" />
            </svg>
          </a>
        </div>
        <div className="site-footer__cols">
          {COLUMNS.map(([title, links]) => (
            <div key={title} className="site-footer__col">
              <span className="site-footer__title">{title}</span>
              {links.map(([label, href]) => (
                <Item key={label} label={label} href={href} />
              ))}
            </div>
          ))}
          <div className="site-footer__mark">
            <Wordmark size={34} />
          </div>
        </div>
        <div className="site-footer__legal">
          <span>Copyright 2026 Lark Sigmuond Babao. Made in the Philippines.</span>
          <span>Lettering in Sketchpop, a hand-drawn font by Lark Sigmuond Babao, under the SIL Open Font License 1.1.</span>
        </div>
      </div>
      <div className="site-footer__giant" aria-hidden="true">
        <div className="site-footer__crowd">
          {CREW.map((n, i) => (
            <Avatar key={n} name={n} size="lg" tilt={[-6, 5, -3, 7, -5][i]} />
          ))}
        </div>
        <div className="site-footer__word">PlopUI</div>
      </div>
    </footer>
  );
}
