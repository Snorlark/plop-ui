import { Avatar, ExternalIcon, PlusIcon, Sheet } from "@plop-ui/react";
import { pageMeta } from "../../_site/meta";
import { CONTRIBUTORS, githubProfile } from "../../_site/contributors";
import { DEMOS, GITHUB } from "../../_site/nav";
import { DemosSoon } from "./DemosSoon";
import styles from "./showcase.module.css";

export const metadata = pageMeta({
  title: "Built with PlopUI",
  description: "Apps and tools made with PlopUI, the hand-drawn React UI kit, and the people who have shipped code to it.",
  path: "/docs/showcase",
});

/** Shown with each maker's permission. Screenshots live in public/showcase/. */
const PROJECTS: Array<{ name: string; by: string; href: string; img: string; tape: "mint" | "periwinkle"; text: string; meta: string }> = [
  {
    name: "Matcha Corner",
    by: "Gio Angelo",
    href: "https://matcha-corner.vercel.app/",
    img: "/showcase/matcha.webp",
    tape: "mint",
    text: "A tiny café for matcha lovers. Pick a drink, collect stamps, then send your order to a friend as a treat link.",
    meta: "App, plays sounds",
  },
  {
    name: "inMODO",
    by: "Gianluca Boccia",
    href: "https://inmodo.app/",
    img: "/showcase/inmodo.webp",
    tape: "periwinkle",
    text: "A visual design tool for websites and native apps. Its starter picker includes a PlopUI idea board, credited and MIT-licensed.",
    meta: "Design tool, starter kit",
  },
];

const host = (href: string) => new URL(href).hostname.replace(/^www\./, "");

export default function ShowcasePage() {
  return (
    <article className={styles.page}>
      <h1 className="doc-h1">Built with PlopUI</h1>
      <p className="doc-lede">Real things people made with the kit, and the people who helped build it.</p>
      <DemosSoon host={host(DEMOS)} className={styles.demos} />

      <section aria-labelledby="projects" className={styles.section}>
        <h2 id="projects" className="doc-h2">Projects</h2>
        <p className={styles.sub}>Made by the community. Each card opens the project in a new tab.</p>
        <ul className={styles.projects}>
          {PROJECTS.map((p, i) => (
            // The title link stretches over the whole card: one focus stop, one short name.
            <li key={p.name}>
              <Sheet tape={p.tape} tilt={i % 2 ? 0.5 : -0.5} className={styles.project}>
                <img src={p.img} alt="" width={960} height={600} loading="lazy" className={styles.shot} />
                <h3>
                  <a href={p.href} target="_blank" rel="noopener">
                    {p.name}
                    <span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                </h3>
                <p className={styles.by}>by {p.by}</p>
                <p className={styles.desc}>{p.text}</p>
                <p className={styles.meta}>
                  <span>{p.meta}</span>
                  <span className={styles.go} aria-hidden="true">
                    {host(p.href)} <ExternalIcon />
                  </span>
                </p>
              </Sheet>
            </li>
          ))}
          <li>
            <div className={`${styles.project} ${styles.add}`}>
              <span className={styles.plus} aria-hidden="true">
                <PlusIcon />
              </span>
              <h3>
                <a href={`${GITHUB}/issues/new?title=${encodeURIComponent("Showcase: ")}`}>Your project here</a>
              </h3>
              <p>Built something with PlopUI? Send us the link and one line about it.</p>
            </div>
          </li>
        </ul>
      </section>

      <section aria-labelledby="contributors" className={styles.section}>
        <h2 id="contributors" className="doc-h2">Contributors</h2>
        <p className={styles.sub}>
          Everyone who has shipped code to PlopUI. Thank you! Want to join them? <a href={`${GITHUB}/labels/good%20first%20issue`}>Pick a first issue</a>.
        </p>
        <ul className={styles.people}>
          {CONTRIBUTORS.map((c) => (
            <li key={c.login}>
              <a href={githubProfile(c.login)} className={styles.person}>
                <span aria-hidden="true">
                  <Avatar name={c.login} size="sm" />
                </span>
                <span>
                  <strong>@{c.login}</strong>
                  {c.work}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
