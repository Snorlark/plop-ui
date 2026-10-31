import { Avatar, ButtonLink, Callout, Sheet, StickyNote, Tag, TicketCard, WordSticker, type WordStickerTone } from "@plop-ui/react";
import Link from "next/link";
import { CopyCommand } from "../../_home/CopyCommand";
import { pageMeta } from "../../_site/meta";
import { GITHUB } from "../../_site/nav";
import { SITE_URL } from "../../_site/site";
import styles from "./what.module.css";

export const metadata = pageMeta({
  title: "What is PlopUI?",
  description:
    "PlopUI (also written Plop UI or plop-ui) is an open source, hand-drawn React UI component library: wobbly stickers, washi tape and a hand-lettered font, built on native elements and accessible to WCAG AA.",
  path: "/docs/what-is-plopui",
});

/** Who it suits, one sticky note each. */
const FOR: Array<{ tone: "mustard" | "mint" | "pink"; title: string; text: string }> = [
  { tone: "mustard", title: "Creative tools", text: "Sketchbooks, note apps, moodboards: anything people make things in." },
  { tone: "mint", title: "Learning and play", text: "Kids' products, study apps and games, where warmth beats polish." },
  { tone: "pink", title: "Side projects", text: "Portfolios, launch pages and weekend builds that should feel like yours." },
];

/** What sets it apart. Every line is something the kit does today. */
const DIFFERENT: Array<{ mark: string; tone: WordStickerTone; title: string; text: string }> = [
  { mark: "Tab", tone: "mustard", title: "Native elements first", text: "A button is a real <button>, a checkbox a real checkbox. The drawing sits on top, never instead." },
  { mark: "AA", tone: "mint", title: "Accessible to WCAG AA", text: "Every interactive piece works with a keyboard and has a test for it. Status never relies on color alone." },
  { mark: "Seed", tone: "periwinkle", title: "Seeded, not random", text: "Every tilt and wobble comes from a seed, so the server and the browser draw the same crooked line." },
  { mark: "SSR", tone: "tomato", title: "Built for the App Router", text: "Static pieces stay Server Components. The package never imports next/*, so any React 19 app works." },
  { mark: "--plop", tone: "bubblegum", title: "Tokens, not hex", text: "Colors, type and motion are CSS variables from @plop-ui/tokens, with measured contrast." },
  { mark: "Calm", tone: "ink", title: "Kind to motion", text: "With reduced motion on, every animation stops. State changes still show, just instantly." },
];

const PACKAGES: Array<{ name: string; meta: string; text: string; href: string }> = [
  { name: "@plop-ui/react", meta: "Components and hooks", text: "Every component, the buddy cast, seeded randomness and onColor().", href: "/docs/components/button" },
  { name: "@plop-ui/tokens", meta: "CSS variables + typed JS", text: "Colors with contrast roles, type, motion and five paper surfaces.", href: "/docs/tokens" },
  { name: "@plop-ui/fonts", meta: "Sketchpop, SIL OFL", text: "The marker lettering family, light to black, upright and italic.", href: "/docs/getting-started" },
];

/** Shown as open-and-close questions, and given to search engines as FAQPage data. */
const FAQ: Array<{ q: string; a: string }> = [
  { q: "Is PlopUI free?", a: "Yes. The code is MIT-licensed and the Sketchpop font is under the SIL Open Font License, so both are free for personal and commercial projects." },
  { q: "Do I need Next.js?", a: "No. PlopUI works in any React 19 app. Next.js gets extra care: interactive components ship with \"use client\" and static ones stay Server Components." },
  { q: "Is it ready for production?", a: "The components are tested, but PlopUI is still before 1.0, so some names may change. Pin your version and read the changelog when you upgrade." },
  { q: "How is it different from other hand-drawn kits?", a: "Most draw their shapes at runtime with Rough.js or wired-elements. PlopUI ships its own drawn SVG marks, seeds every wobble so server and client match, and starts each component from the native element with keyboard tests and reduced-motion support." },
  { q: "Is PlopUI related to Plop, the code generator?", a: "No. Plop (plopjs.com) is a micro-generator for scaffolding files. PlopUI is a UI component library; the names are just similar." },
];

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  url: `${SITE_URL}/docs/what-is-plopui`,
  mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function WhatIsPlopUI() {
  return (
    <article className={styles.page}>
      <h1 className="doc-h1">What is PlopUI?</h1>
      <p className="doc-lede">
        PlopUI (also written Plop UI or plop-ui) is an open source React component library that looks hand-drawn on purpose: wobbly stickers,
        washi-tape tags and a hand-lettered marker font. It breaks the visual rulebook, never the accessibility one.
      </p>
      <div className="doc-badges">
        <Tag tone="mint" tilt={-2}>Free, MIT</Tag>
        <Tag tone="periwinkle" tilt={2}>React 19</Tag>
        <Tag tone="mustard" tilt={-1}>WCAG AA</Tag>
      </div>

      <div className={styles.actions}>
        <ButtonLink href="/docs/getting-started" variant="ink" tilt={-1}>
          Get started
        </ButtonLink>
        <ButtonLink href="/playground" variant="mustard" tilt={1}>
          Try the Playground
        </ButtonLink>
        <CopyCommand command="npm i @plop-ui/react @plop-ui/fonts" />
      </div>

      <section aria-labelledby="sentence" className={styles.section}>
        <h2 id="sentence" className="doc-h2">In one sentence</h2>
        <Sheet tape="mustard" tilt={-0.6} className={styles.sentence}>
          <p>
            PlopUI is a free, MIT-licensed set of hand-drawn React UI components, built on native HTML elements, tested with a keyboard and
            accessible to WCAG AA, made by Lark Sigmuond Babao.
          </p>
        </Sheet>
      </section>

      <section aria-labelledby="for" className={styles.section}>
        <h2 id="for" className="doc-h2">Who it's for</h2>
        <p className={styles.intro}>Products that should feel made by a person, not generated by a template.</p>
        <ul className={styles.notes}>
          {FOR.map((n, i) => (
            <li key={n.title}>
              <StickyNote tone={n.tone} tilt={[-2, 1.5, -1][i]}>
                <strong className={styles.noteTitle}>{n.title}</strong>
                {n.text}
              </StickyNote>
            </li>
          ))}
        </ul>
        <Callout tone="info" title="Not the right pick for" tilt={0} headingLevel={3}>
          Dense enterprise dashboards where every pixel has to stay quiet. A neutral kit fits those better.
        </Callout>
      </section>

      <section aria-labelledby="different" className={styles.section}>
        <h2 id="different" className="doc-h2">What makes it different</h2>
        <ul className={styles.cards}>
          {DIFFERENT.map((d, i) => (
            <li key={d.title}>
              <Sheet tape="none" tilt={[-0.8, 0.6, -0.4][i % 3]} className={styles.card}>
                <WordSticker tone={d.tone} size={30} tilt={-4}>
                  {d.mark}
                </WordSticker>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </Sheet>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="box" className={styles.section}>
        <h2 id="box" className="doc-h2">What's in the box</h2>
        <ul className={styles.packages}>
          {PACKAGES.map((p, i) => (
            <li key={p.name}>
              <TicketCard title={p.name} meta={p.meta} tilt={[-1, 0.8, -0.6][i]} className={styles.ticket}>
                {p.text} <Link href={p.href}>Read more</Link>
              </TicketCard>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="compare" className={styles.section}>
        <h2 id="compare" className="doc-h2">How it compares</h2>
        <p className={styles.intro}>
          Most hand-drawn React libraries draw their shapes at runtime with <a href="https://roughjs.com">Rough.js</a> or wired-elements, for
          example hand-drawn-ui, Skeci UI, SketchUI and bydefaulthuman. That gives a lovely pencil-sketch look. PlopUI takes another route:
        </p>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="PlopUI compared with Rough.js-style kits">
          <table>
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th scope="col">Rough.js-style kits</th>
                <th scope="col">PlopUI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Shapes</th>
                <td>Generated at runtime</td>
                <td>Its own drawn SVG marks</td>
              </tr>
              <tr>
                <th scope="row">Randomness</th>
                <td>Varies by library</td>
                <td>Seeded, same on server and client</td>
              </tr>
              <tr>
                <th scope="row">Look</th>
                <td>Pencil sketch</td>
                <td>Stickers, tape and marker on paper</td>
              </tr>
              <tr>
                <th scope="row">Foundation</th>
                <td>Varies by library</td>
                <td>Native elements, keyboard tests, reduced motion</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="maker" className={styles.section}>
        <h2 id="maker" className="doc-h2">Who makes it</h2>
        <div className={styles.maker}>
          <Avatar name="Lark Sigmuond Babao" size="xl" tilt={-4} />
          <div>
            <p>
              PlopUI is designed and built by <strong>Lark Sigmuond Babao</strong>, in the open. Issues, ideas and pull requests are welcome,
              and a few are labeled &ldquo;good first issue&rdquo;.
            </p>
            <div className={styles.makerActions}>
              <ButtonLink href={GITHUB} variant="periwinkle" size="sm" tilt={-1}>
                Star it on GitHub
              </ButtonLink>
              <ButtonLink href={`${GITHUB}/issues`} variant="mint" size="sm" tilt={1}>
                Open an issue
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq" className={styles.section}>
        <h2 id="faq" className="doc-h2">Questions</h2>
        <div className={styles.faq}>
          {FAQ.map(({ q, a }) => (
            <details key={q} className={styles.qa}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <p className={styles.plopjs}>
          Looking for Plop, the code generator? It lives at{" "}
          <a href="https://plopjs.com" rel="nofollow">
            plopjs.com
          </a>
          .
        </p>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
    </article>
  );
}
