import { Buddy, Radio, RadioGroup, Sheet, Tag, WordSticker } from "@plop-ui/react";
import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { entries, headline, minors, pendingNotes, releaseTrains, PACKAGES, type Item, type Minor, type Train } from "../_site/changelog";
import { GITHUB } from "../_site/nav";
import { SiteFooter } from "../_site/SiteFooter";
import { SiteHeader } from "../_site/SiteHeader";
import { pageMeta } from "../_site/meta";
import { Fold, ReleaseJump, ReleaseTimeline, type NavRelease } from "./ReleaseNav";
import styles from "./changelog.module.css";

export const metadata: Metadata = pageMeta({
  title: "Changelog",
  description: "What's new in PlopUI: every release of @plop-ui/react, @plop-ui/tokens and @plop-ui/fonts, plus what's coming in the next one.",
  path: "/changelog",
});

/** The newest minor versions start open; older ones fold behind a button. */
const OPEN = 2;

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

const anchor = (version: string) => `v${version.replace(/\W+/g, "-")}`;
const day = (iso?: string, year = true) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}), timeZone: "UTC" }) : undefined;

function Change({ item }: { item: Item }) {
  return (
    <>
      <p>{inline(item.text)}</p>
      {item.list.length > 0 && (
        <ul className={styles.sub}>
          {item.list.map((x, i) => (
            <li key={i}>{inline(x)}</li>
          ))}
        </ul>
      )}
      {item.after.map((x, i) => (
        <p key={i}>{inline(x)}</p>
      ))}
    </>
  );
}

/** One release (0.3.5): its version and date, then its changes as plain lines. */
function Release({ t, many }: { t: Train; many: boolean }) {
  const list = entries(t);
  const quiet = t.packages.filter((p) => p.sections.length === 0 && p.bumpedTo.length > 0);
  return (
    <div id={anchor(t.version)} className={styles.release} data-pkgs={t.packages.map((p) => p.pkg).join(" ")}>
      {many && (
        <h3 className={styles.releaseTitle}>
          {t.version}
          {t.date && <span>{day(t.date, false)}</span>}
        </h3>
      )}
      <ul className={styles.items}>
        {list.map((e, i) => (
          <li key={i} data-pkgs={e.pkgs.join(" ")}>
            {e.kind === "breaking" && (
              <Tag tone="tomato" tilt={-1}>
                Breaking
              </Tag>
            )}
            <Change item={e.item} />
            <span className={styles.itemPkgs}>{e.pkgs.map((p) => `@plop-ui/${p}`).join(" · ")}</span>
          </li>
        ))}
      </ul>
      {quiet.map((p) => (
        <p key={p.pkg} className={styles.quiet} data-pkgs={p.pkg}>
          @plop-ui/{p.pkg} {p.version} only moves to {p.bumpedTo.map((d) => d.replace(/@(?=\d)/, " ")).join(", ")}.
        </p>
      ))}
    </div>
  );
}

function MinorCard({ m, index }: { m: Minor; index: number }) {
  const id = anchor(m.minor);
  const latest = index === 0;
  const count = m.trains.reduce((n, t) => n + entries(t).length, 0);
  const releases = m.trains.map((t) => <Release key={t.version} t={t} many={m.trains.length > 1} />);
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={styles.minor} data-pkgs={m.pkgs.join(" ")}>
      <Sheet tape={latest ? "mustard" : "none"} tilt={latest ? -0.4 : 0} className={styles.card}>
        {latest && <Buddy mood="congrats" size="sm" className={styles.buddy} />}
        <header className={styles.head}>
          <h2 id={`${id}-h`} className={styles.title}>
            <WordSticker tone={latest ? "mustard" : "paper"} size={latest ? 44 : 36} tilt={-3}>
              {m.minor}
            </WordSticker>
          </h2>
          <p className={styles.when}>
            {day(m.date)}
            {m.trains.length > 1 && ` · ${m.trains.length} releases`}
          </p>
        </header>
        {index < OPEN ? (
          <div className={styles.body}>{releases}</div>
        ) : (
          <>
            <p className={styles.headline}>{headline(m.trains.at(-1)!)}</p>
            <Fold id={id} count={count}>
              {releases}
            </Fold>
          </>
        )}
      </Sheet>
    </section>
  );
}

export default async function ChangelogPage() {
  const trains = await releaseTrains();
  const groups = minors(trains);
  const pending = pendingNotes();
  const latest = PACKAGES.map((pkg) => ({ pkg, version: trains.find((t) => t.packages.some((p) => p.pkg === pkg))?.version })).filter((x) => x.version);
  const nav: NavRelease[] = groups.map((m) => ({ id: anchor(m.minor), label: m.minor, date: day(m.date, false), pkgs: m.pkgs }));

  return (
    <div className="site site--docs">
      <SiteHeader />
      <div className={styles.shell}>
        <ReleaseTimeline releases={nav} />
        <main id="main" className={styles.main}>
          <h1 className="doc-h1">Changelog</h1>
          <p className={`doc-lede ${styles.lede}`}>What changed in each release, newest first.</p>
          <p className={styles.stats}>
            Latest:{" "}
            {latest.map((l, i) => (
              <Fragment key={l.pkg}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <span className={styles.nowrap}>
                  {l.pkg} <strong>{l.version}</strong>
                </span>
              </Fragment>
            ))}
          </p>

          <div className={styles.tools}>
            {/* Real radio buttons: the :has() rules in the CSS do the filtering, so it works before JavaScript loads. */}
            <RadioGroup legend="Show" name="changelog-pkg" defaultValue="all" vertical={false} className={styles.filter}>
              <Radio value="all">Everything</Radio>
              {PACKAGES.map((p) => (
                <Radio key={p} value={p}>
                  {p}
                </Radio>
              ))}
            </RadioGroup>
            <ReleaseJump releases={nav} />
          </div>

          {pending.length > 0 && (
            <section id="next" aria-labelledby="next-h" className={styles.next} data-pkgs={[...new Set(pending.flatMap((n) => n.packages))].join(" ")}>
              <Buddy mood="preview" size="sm" className={styles.buddy} />
              <h2 id="next-h" className={styles.nextTitle}>
                Coming next
              </h2>
              <ul className={styles.items}>
                {pending.map((n, i) => (
                  <li key={i} data-pkgs={n.packages.join(" ")}>
                    <Change item={n.item} />
                    <span className={styles.itemPkgs}>{n.packages.map((p) => `@plop-ui/${p}`).join(" · ")}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {groups.length === 0 ? <p>No release on npm yet.</p> : groups.map((m, i) => <MinorCard key={m.minor} m={m} index={i} />)}

          <p className={styles.foot}>
            Also on <a href={`${GITHUB}/releases`}>GitHub Releases</a>. Before 1.0, a minor version can break things, and always says how to move over.
          </p>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
