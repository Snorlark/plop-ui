import Link from "next/link";
import styles from "./footer.module.css";
import { LazyScene } from "./LazyScene";
import { FooterFactory } from "./FooterFactory";
import { GITHUB } from "./nav";
import { Wordmark } from "./Wordmark";

/** Descriptive link text on purpose: it tells search engines (and screen reader link lists) what each page is. */
const COLUMNS: Array<[string, Array<[string, string]>]> = [
  [
    "Components",
    [
      ["Button", "/docs/components/button"],
      ["Search & command palette", "/docs/components/search"],
      ["Avatar", "/docs/components/avatar"],
      ["Toast notifications", "/docs/components/toast"],
      ["Every component", "/docs/components/button"],
    ],
  ],
  [
    "Guides",
    [
      ["Install PlopUI", "/docs/getting-started"],
      ["Using with Next.js", "/docs/nextjs"],
      ["Design tokens", "/docs/tokens"],
      ["Accessibility", "/docs/accessibility"],
    ],
  ],
  [
    "Community",
    [
      ["GitHub repository", GITHUB],
      ["npm package", "https://www.npmjs.com/package/@plop-ui/react"],
      ["Contributing guide", `${GITHUB}/blob/main/CONTRIBUTING.md`],
      ["Sticker playground", "/playground"],
      ["Changelog", "/changelog"],
    ],
  ],
  [
    "Legal",
    [
      ["Privacy policy", "/privacy"],
      ["MIT license", `${GITHUB}/blob/main/LICENSE`],
      ["Font license (OFL)", `${GITHUB}/blob/main/packages/fonts/OFL.txt`],
    ],
  ],
];

function Item({ label, href }: { label: string; href: string }) {
  return href.startsWith("/") ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>;
}

/**
 * The site footer: the big PlopUI sticker, a short description for people and search engines, four
 * short link columns, and the sticker factory scene. Arriving here is
 * scroll-driven CSS: the logo slaps on, the links slide up, and the factory
 * pops up station by station like a pop-up book while the scene drifts up
 * slower than the page (parallax). Without scroll timelines, or with reduced
 * motion, it just sits finished.
 */
export function SiteFooter() {
  return (
    <footer className={styles.foot} aria-label="Site footer" data-pausable>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Link href="/" aria-label="PlopUI home" className={`${styles.logo} logo-sticker`}>
            <Wordmark size={96} />
          </Link>
          <p className={styles.tagline}>
            PlopUI (also written Plop UI or plop-ui) is a hand-drawn React UI component library, imperfect on purpose. It breaks the
            visual rulebook, never the accessibility one: WCAG AA and server-rendered with Next.js.
          </p>
        </div>
        <nav className={styles.cols} aria-label="Footer">
          {COLUMNS.map(([title, links]) => (
            <div key={title} className={styles.col}>
              <h2 className={styles.colTitle}>{title}</h2>
              <ul>
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Item label={label} href={href} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <FooterFactory>
        <LazyScene src="/scenes/factory.svg" viewBox="0 0 1440 380" preserveAspectRatio="xMidYMax slice" />
      </FooterFactory>

      <p className={styles.legal}>
        <small>
          © 2026 PlopUI by Lark Sigmuond Babao. Lettered in Sketchpop.
        </small>
      </p>
    </footer>
  );
}
