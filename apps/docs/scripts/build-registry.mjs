// Builds the shadcn-compatible registry (public/r/*.json) so `npx shadcn add <url>` can install PlopUI.
//
// Every item installs the real npm packages (@plop-ui/react, @plop-ui/fonts) and depends on `plop-setup`, which
// adds the styles and the provider once. Component items drop an editable example file generated from the code
// example on that component's docs page (app/_site/registry.ts), so the registry can't drift from the docs.
// Blocks (whole screens) live in registry/blocks/*.tsx. Decision: docs/decisions/0029-shadcn-registry.md
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "public/r");
/** Where the registry is served; items point at each other with absolute URLs. Override for local testing. */
const BASE = (process.env.REGISTRY_URL ?? "https://plopui.com").replace(/\/$/, "");
const SCHEMA_ITEM = "https://ui.shadcn.com/schema/registry-item.json";
const PACKAGES = ["@plop-ui/react", "@plop-ui/fonts"];
const SETUP = `${BASE}/r/plop-setup.json`;

const pascal = (slug) => slug.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const indent = (text, by) => text.replace(/^(?=.)/gm, " ".repeat(by));

/** The component docs, read from registry.ts: { slug, title, group, lede, code }. */
function readDocs() {
  const src = readFileSync(join(ROOT, "app/_site/registry.ts"), "utf8");
  const docs = [];
  const entry = /^ {2}"?([a-z-]+)"?: \{\n([\s\S]*?)\n {2}\},$/gm;
  let m;
  while ((m = entry.exec(src))) {
    const body = m[2];
    const field = (name) => body.match(new RegExp(`^ {4}${name}: "((?:[^"\\\\]|\\\\.)*)",`, "m"))?.[1]?.replace(/\\"/g, '"');
    const code = body.match(/^ {4}code: `([\s\S]*?)`,$/m)?.[1];
    if (!code) throw new Error(`build-registry: no code example for "${m[1]}"`);
    docs.push({ slug: m[1], title: field("title"), group: field("group"), lede: field("lede"), code: code.replace(/\\`/g, "`").replace(/\\\$/g, "$") });
  }
  return docs;
}

/**
 * A docs snippet (imports + JSX) as a typed, editable component file. Some docs snippets are illustrative
 * (bare toast() calls, sample data in comments); those get a hand-written file in registry/examples/<slug>.tsx.
 */
function exampleFile({ slug, title, code }) {
  try {
    return readFileSync(join(ROOT, "registry/examples", `${slug}.tsx`), "utf8");
  } catch {
    // no override: generate it from the docs snippet
  }
  const lines = code.trim().split("\n");
  const imports = lines.filter((l) => /^import\s/.test(l));
  const jsx = lines.filter((l) => !/^import\s/.test(l)).join("\n").trim();
  return `"use client";

${imports.join("\n")}

/** ${title}: the example from ${BASE}/docs/components/${slug}. Edit it freely; the component comes from npm. */
export function ${pascal(slug)}Example() {
  return (
    <>
${indent(jsx, 6)}
    </>
  );
}
`;
}

const setupFile = `// Loads PlopUI's styles and fonts once and re-exports the provider. Wrap your root layout in <PlopProvider>.
import "@plop-ui/react/styles.css";
import "@plop-ui/fonts/fonts.css";

export { PlopProvider } from "@plop-ui/react";
`;

const item = (name, fields) => ({ $schema: SCHEMA_ITEM, name, ...fields });
const file = (target, content, type = "registry:component") => ({ path: `registry/plopui/${basename(target)}`, type, target, content });

const docs = readDocs();
const items = [
  item("plop-setup", {
    type: "registry:lib",
    title: "PlopUI setup",
    description: "Installs @plop-ui/react and @plop-ui/fonts, loads their styles once, and gives you <PlopProvider>.",
    dependencies: PACKAGES,
    files: [file("components/plop/plop-provider.tsx", setupFile, "registry:lib")],
    docs: "Wrap your root layout once: import { PlopProvider } from \"@/components/plop/plop-provider\" and put <PlopProvider> around {children}. Docs: https://plopui.com/docs/getting-started",
  }),
  ...docs.map((d) =>
    item(d.slug, {
      type: "registry:component",
      title: d.title,
      description: d.lede,
      categories: [d.group.toLowerCase()],
      dependencies: PACKAGES,
      registryDependencies: [SETUP],
      files: [file(`components/plop/${d.slug}-example.tsx`, exampleFile(d))],
      docs: `Example: components/plop/${d.slug}-example.tsx. Docs: ${BASE}/docs/components/${d.slug}`,
    }),
  ),
];

// Blocks: whole screens written by hand in registry/blocks/<name>.tsx, with a one-line description comment on top.
const blocksDir = join(ROOT, "registry/blocks");
let blockFiles = [];
try {
  blockFiles = readdirSync(blocksDir).filter((f) => f.endsWith(".tsx"));
} catch {
  // no blocks yet
}
for (const f of blockFiles) {
  const name = f.replace(/\.tsx$/, "");
  const content = readFileSync(join(blocksDir, f), "utf8");
  const description = content.match(/\/\*\* ([^*]+?) \*\//)?.[1] ?? name;
  items.push(
    item(name, {
      type: "registry:block",
      title: name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
      description,
      categories: ["blocks"],
      dependencies: PACKAGES,
      registryDependencies: [SETUP],
      files: [file(`components/plop/${f}`, content)],
    }),
  );
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const it of items) writeFileSync(join(OUT, `${it.name}.json`), JSON.stringify(it, null, 2) + "\n");
writeFileSync(
  join(OUT, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "plopui",
      homepage: "https://plopui.com",
      items: items.map(({ $schema: _schema, files, ...rest }) => ({ ...rest, files: files.map(({ content: _content, ...f }) => f) })),
    },
    null,
    2,
  ) + "\n",
);
console.log(`build-registry: ${items.length} items (${docs.length} components, ${blockFiles.length} blocks) → public/r, base ${BASE}`);
