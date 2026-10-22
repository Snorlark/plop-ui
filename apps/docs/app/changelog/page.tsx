import { Tag, type TagTone } from "@plop-ui/react";
import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { pendingNotes, releases, PACKAGES, type Pkg } from "../_site/changelog";
import { GITHUB } from "../_site/nav";
import { SiteFooter } from "../_site/SiteFooter";
import { SiteHeader } from "../_site/SiteHeader";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in PlopUI: every release of @plop-ui/react, @plop-ui/tokens and @plop-ui/fonts, plus what's coming in the next one.",
};

const TONE: Record<Pkg, TagTone> = { react: "periwinkle", tokens: "mustard", fonts: "bubblegum" };

/** Just enough markdown for changelog lines: `code`, **bold** and [links](url). */
function inline(text: string): ReactNode {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={i} href={link[2]}>{link[1]}</a>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const pkgTags = (pkgs: Pkg[]) => pkgs.map((p) => <Tag key={p} tone={TONE[p]} tilt={0}>{`@plop-ui/${p}`}</Tag>);

export default function ChangelogPage() {
  const pending = pendingNotes();
  const newer = (a: string, b: string) => b.localeCompare(a, undefined, { numeric: true });
  const released = PACKAGES.flatMap((pkg) => releases(pkg).map((r) => ({ pkg, ...r }))).sort((a, b) => newer(a.version, b.version));
  return (
    <div className="site site--docs">
      <SiteHeader />
      <main id="main" className="doc-main content legal-page changelog">
        <h1 className="doc-h1">Changelog</h1>
        <p className="lede">
          Every change to the published packages, newest first. Versions follow semver; before 1.0, breaking changes land in minor versions and always come with a
          migration note.
        </p>

        {pending.length > 0 && (
          <section aria-labelledby="next-release">
            <h2 id="next-release">Coming in the next release</h2>
            <ul className="changelog__list">
              {pending.map((n, i) => (
                <li key={i}>
                  <span className="changelog__tags">{pkgTags(n.packages)}</span>
                  <p>{inline(n.text)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {released.length === 0 ? (
          <p>
            No release on npm yet. The first one, <strong>0.1.0</strong>, will include everything above.
          </p>
        ) : (
          released.map((r) => (
            <section key={`${r.pkg}@${r.version}`} aria-labelledby={`v-${r.pkg}-${r.version}`}>
              <h2 id={`v-${r.pkg}-${r.version}`}>
                {r.version} <span className="changelog__tags">{pkgTags([r.pkg])}</span>
              </h2>
              {r.sections.map((s) => (
                <Fragment key={s.title}>
                  <h3>{s.title}</h3>
                  <ul className="changelog__list">
                    {s.items.map((item, i) => (
                      <li key={i}>
                        <p>{inline(item)}</p>
                      </li>
                    ))}
                  </ul>
                </Fragment>
              ))}
            </section>
          ))
        )}

        <p>
          <small>
            Release notes also go up on <a href={`${GITHUB}/releases`}>GitHub Releases</a>.
          </small>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
