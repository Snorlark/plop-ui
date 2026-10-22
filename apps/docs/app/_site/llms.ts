import { DOC_NAV, GITHUB } from "./nav";
import { COMPONENT_DOCS } from "./registry";
import { SITE_DESCRIPTION, SITE_URL } from "./site";

const slugOf = (href: string) => href.match(/^\/docs\/components\/(.+)$/)?.[1];

const INTRO = `# PlopUI

> ${SITE_DESCRIPTION}

Install: \`npm i @plop-ui/react @plop-ui/fonts\`, import \`@plop-ui/react/styles.css\` and \`@plop-ui/fonts/fonts.css\` once, and wrap the app in \`<PlopProvider>\`.
Rules of thumb: every interactive component is a native element with keyboard support; color comes from CSS variables (\`--plop-*\`), never hex; status always carries a text label, never color alone. Source: ${GITHUB}
`;

/** llms.txt (https://llmstxt.org): what PlopUI is and a map of its docs, for AI tools. */
export function llmsIndex() {
  const sections = DOC_NAV.map(
    (s) =>
      `## ${s.group}\n\n` +
      s.links
        .map((l) => {
          const doc = COMPONENT_DOCS[slugOf(l.href) ?? ""];
          return `- [${l.label}](${SITE_URL}${l.href})${doc ? `: ${doc.lede}` : ""}`;
        })
        .join("\n"),
  );
  return [INTRO, ...sections, `## Optional\n\n- [Every component with code, in one file](${SITE_URL}/llms-full.txt)\n`].join("\n\n");
}

/** llms-full.txt: every component's summary, example code, do/don't and accessibility notes in one file. */
export function llmsFull() {
  const components = Object.entries(COMPONENT_DOCS).map(
    ([slug, d]) =>
      `## ${d.title}\n\n${d.lede}\n\nDocs: ${SITE_URL}/docs/components/${slug}\n\n\`\`\`tsx\n${d.code}\n\`\`\`\n\nDo: ${d.do}\nDon't: ${d.dont}\n\nAccessibility:\n${d.a11y.map((a) => `- ${a}`).join("\n")}`,
  );
  return [INTRO, ...components].join("\n\n") + "\n";
}
