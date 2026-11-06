import { Avatar, ButtonLink, Sheet, Tag } from "@plop-ui/react";
import { pageMeta } from "../../_site/meta";
import { CONTRIBUTORS, githubProfile } from "../../_site/contributors";
import { GITHUB } from "../../_site/nav";
import styles from "./showcase.module.css";

export const metadata = pageMeta({
  title: "Built with PlopUI",
  description: "Apps and tools made with PlopUI, the hand-drawn React UI kit, and the people who have shipped code to it.",
  path: "/docs/showcase",
});

/** Shown with each maker's permission. Screenshots live in public/showcase/. */
const PROJECTS: Array<{ name: string; by: string; href: string; img: string; tone: "mint" | "periwinkle"; text: string; tags: string[] }> = [
  {
    name: "Matcha Corner",
    by: "Gio Angelo",
    href: "https://matcha-corner.vercel.app/",
    img: "/showcase/matcha.webp",
    tone: "mint",
    text: "A tiny café for matcha lovers. Pick a drink, collect stamps, then send your order to a friend as a treat link.",
    tags: ["App", "Sound on"],
  },
  {
    name: "inMODO",
    by: "Gianluca Boccia",
    href: "https://inmodo.app/",
    img: "/showcase/inmodo.webp",
    tone: "periwinkle",
    text: "A visual design tool for websites and native apps. Its starter picker includes a PlopUI idea board, credited and MIT-licensed.",
    tags: ["Design tool", "Starter kit"],
  },
];

export default function ShowcasePage() {
  return (
    <article className={styles.page}>
      <h1 className="doc-h1">Built with PlopUI</h1>
      <p className="doc-lede">Real things people made with the kit, and the people who helped build it.</p>

      <section aria-labelledby="projects" className={styles.section}>
        <h2 id="projects" className="doc-h2">Projects</h2>
        <ul className={styles.projects}>
          {PROJECTS.map((p, i) => (
            <li key={p.name}>
              <Sheet tape={p.tone} tilt={i % 2 ? 0.6 : -0.6} className={styles.project}>
                <img src={p.img} alt={`${p.name}, home screen`} width={960} height={600} loading="lazy" className={styles.shot} />
                <h3>{p.name}</h3>
                <p className={styles.by}>by {p.by}</p>
                <p>{p.text}</p>
                <div className={styles.tags}>
                  {p.tags.map((t, j) => (
                    <Tag key={t} tone={j ? "mustard" : p.tone} tilt={j ? 2 : -2}>
                      {t}
                    </Tag>
                  ))}
                </div>
                <ButtonLink href={p.href} size="sm" variant="ink" tilt={-1} target="_blank" rel="noopener">
                  Visit {p.name}
                </ButtonLink>
              </Sheet>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Made something with PlopUI? <a href={`${GITHUB}/issues/new?title=${encodeURIComponent("Showcase: ")}`}>Open an issue</a> with a link and a
          line about it.
        </p>
      </section>

      <section aria-labelledby="contributors" className={styles.section}>
        <h2 id="contributors" className="doc-h2">Contributors</h2>
        <p className={styles.note}>Everyone who has shipped code to PlopUI. Thank you!</p>
        <ul className={styles.people}>
          {CONTRIBUTORS.map((c) => (
            <li key={c.login}>
              <a href={githubProfile(c.login)} className={styles.person}>
                <Avatar name={c.login} size="lg" />
                <span>
                  <strong>@{c.login}</strong>
                  {c.work}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div>
          <ButtonLink href={`${GITHUB}/labels/good%20first%20issue`} variant="mustard" tilt={1}>
            Find a first issue
          </ButtonLink>
        </div>
      </section>
    </article>
  );
}
