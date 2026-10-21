import { Tag } from "@plop-ui/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropsTable } from "../../../_components/PropsTable";
import { ExampleTabs } from "../../../_site/ExampleTabs";
import { COMPONENT_DOCS } from "../../../_site/registry";

export function generateStaticParams() {
  return Object.keys(COMPONENT_DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = COMPONENT_DOCS[(await params).slug];
  return { title: doc?.title ?? "Component", description: doc?.lede };
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

      <ExampleTabs slug={slug} code={doc.code} />
      <p className="doc-try">
        Change every prop live in the <Link href={`/playground?c=${slug}`}>playground</Link>.
      </p>

      <h2 className="doc-h2">Props</h2>
      {doc.tables.map((t) => (
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
