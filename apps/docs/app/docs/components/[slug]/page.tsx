import { Tag } from "@plop-ui/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropsTable } from "../../../_components/PropsTable";
import { LoadingShowcase } from "../../../_kit/LoadingShowcase";
import { githubProfile } from "../../../_site/contributors";
import { ExampleTabs } from "../../../_site/ExampleTabs";
import { COMPONENT_DOCS } from "../../../_site/registry";
import { pageMeta } from "../../../_site/meta";

export function generateStaticParams() {
  return Object.keys(COMPONENT_DOCS).map((slug) => ({ slug }));
}

/** Search results cut descriptions past 160 chars: keep the whole sentences that fit, else cut at a word. */
function metaDescription(lede: string) {
  if (lede.length <= 160) return lede;
  let out = "";
  for (const sentence of lede.split(/(?<=[.!?])\s/)) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > 160) break;
    out = next;
  }
  return out.length >= 50 ? out : `${lede.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const doc = COMPONENT_DOCS[slug];
  if (!doc) return { title: "Component" };
  // "Button: hand-drawn React component · PlopUI": people search "react <component> component".
  return pageMeta({ title: `${doc.title}: hand-drawn React component`, description: metaDescription(doc.lede), path: `/docs/components/${slug}` });
}

const BADGE_TONES = ["periwinkle", "mint", "mustard"] as const;

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = COMPONENT_DOCS[slug];
  if (!doc) notFound();
  return (
    <>
      <h1 className="doc-h1">{doc.title}</h1>
      <p className="doc-lede">{doc.lede}</p>
      <div className="doc-badges">
        {doc.badges.map((b, i) => (
          <Tag key={b} tone={BADGE_TONES[i % 3]} tilt={[-2, 2, -1][i % 3]}>
            {b}
          </Tag>
        ))}
      </div>
      {doc.contributors && (
        <p className="doc-credit">
          Contributed by{" "}
          {doc.contributors.map((login, i) => (
            <span key={login}>
              {i > 0 && ", "}
              <a href={githubProfile(login)}>@{login}</a>
            </span>
          ))}
          . <Link href="/docs/showcase#contributors">Meet the contributors</Link>
        </p>
      )}

      {/* the demo can hold headings (Callout, Card titles): give it an h2 so the outline never skips from h1 to h3 */}
      <h2 className="vh">Live example</h2>
      {slug === "loading" ? <LoadingShowcase /> : <ExampleTabs slug={slug} code={doc.code} />}
      {slug !== "breadcrumb" && <p className="doc-try">
        Change every prop live in the <Link href={`/playground?c=${slug === "loading" ? "spinner" : slug}`}>playground</Link>.
      </p>}

      <h2 className="doc-h2">Props</h2>
      {doc.tables.length > 3
        ? // Pages covering many components (Loading) fold each table away, so the page stays short.
          doc.tables.map((t) => (
            <details key={t.of} className="doc-props doc-props--fold">
              <summary>
                <code>{t.of}</code>
              </summary>
              <PropsTable of={t.of} inheritedFrom={t.inheritedFrom} />
            </details>
          ))
        : doc.tables.map((t) => (
            <section key={t.of} className="doc-props">
              {doc.tables.length > 1 && (
                <h3 className="doc-h3">
                  <code>{t.of}</code>
                </h3>
              )}
              <PropsTable of={t.of} inheritedFrom={t.inheritedFrom} />
            </section>
          ))}

      <h2 className="doc-h2">Use it well</h2>
      <div className="doc-dodont">
        <div className="doc-dodont__do">
          <span>Do</span>
          <span>{doc.do}</span>
        </div>
        <div className="doc-dodont__dont">
          <span>Don&apos;t</span>
          <span>{doc.dont}</span>
        </div>
      </div>

      <h2 className="doc-h2">Accessibility</h2>
      <ul className="doc-list">
        {doc.a11y.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </>
  );
}
