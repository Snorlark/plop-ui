import { Heading } from "@plop-ui/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropsTable } from "../../../_components/PropsTable";
import { Sheet } from "../../../_components/Sheet";
import { KitDemo } from "../../../_kit/demos";
import { COMPONENT_DOCS } from "./registry";

export function generateStaticParams() {
  return Object.keys(COMPONENT_DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = COMPONENT_DOCS[(await params).slug];
  return { title: doc?.title ?? "Component" };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = COMPONENT_DOCS[slug];
  if (!doc) notFound();
  return (
    <>
      <Heading level={1}>{doc.title}</Heading>
      <p className="lede">{doc.lede}</p>
      <Sheet>
        <KitDemo slug={slug} />
      </Sheet>
      <pre tabIndex={0}>
        <code>{doc.code}</code>
      </pre>
      <h2>Props</h2>
      {doc.tables.map((t) => (
        <section key={t.of}>
          {doc.tables.length > 1 && (
            <h3>
              <code>{t.of}</code>
            </h3>
          )}
          <PropsTable of={t.of} inheritedFrom={t.inheritedFrom} />
        </section>
      ))}
      <h2>Accessibility</h2>
      <ul>
        {doc.a11y.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </>
  );
}
