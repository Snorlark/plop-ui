// Builds @plop-ui/react with esbuild. See docs/decisions/0003-esbuild-not-tsup.md.
//
// Pass 1 (JS): every source file becomes its own output module, and imports
// between them stay real imports. That keeps each component's "use client"
// boundary intact: interactive components get the directive, while
// StatusTimeline and a static Tag stay Server Components. CSS Modules compile
// to plain class names inside each file.
//
// Pass 2 (CSS): bundles everything from src/index.ts once and keeps only the
// CSS, as dist/styles.css. Class names are derived from file and class names,
// so both passes agree (scripts/check-css.mjs verifies it).
//
// Types come from `tsc -p tsconfig.build.json`.
import { build, context } from "esbuild";
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const src = join(root, "src");
const dist = join(root, "dist");
const watch = process.argv.includes("--watch");

const sources = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name) && !/\.(test|stories)\.tsx?$/.test(name) && !name.endsWith(".d.ts")) sources.push(p);
  }
})(src);

const usesClient = (file) => /^\s*["']use client["']/.test(readFileSync(file, "utf8"));
const outFor = (file) => join(dist, relative(src, file)).replace(/\.tsx?$/, ".js");

const shared = {
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  jsx: "automatic",
  loader: { ".module.css": "local-css", ".css": "css" },
  external: ["react", "react-dom", "react/jsx-runtime", "@radix-ui/*"],
  logLevel: "warning",
};

/** Pass 1 plugin: leave local TS imports external, so each file stays its own module. */
const externalizeLocal = {
  name: "externalize-local",
  setup(b) {
    b.onResolve({ filter: /^\.\.?\// }, (args) => {
      if (args.kind === "entry-point" || args.path.endsWith(".css") || args.importer.endsWith(".css")) return undefined;
      return { path: args.path, external: true };
    });
  },
};

/** Pass 1 plugin: esbuild drops module directives, so re-add "use client" where the source had it. */
const restoreDirectives = {
  name: "use-client",
  setup(b) {
    b.onEnd((result) => {
      if (result.errors.length) return;
      for (const file of sources) {
        const out = outFor(file);
        // Per-file CSS is replaced by the single stylesheet from pass 2.
        rmSync(out.replace(/\.js$/, ".css"), { force: true });
        rmSync(out.replace(/\.js$/, ".css.map"), { force: true });
        if (!usesClient(file)) continue;
        const code = readFileSync(out, "utf8");
        if (!code.startsWith('"use client"')) writeFileSync(out, `"use client";\n${code}`);
      }
    });
  },
};

const jsOptions = {
  ...shared,
  entryPoints: sources,
  outdir: dist,
  outbase: src,
  sourcemap: true,
  external: [...shared.external, "@plop-ui/tokens", "@plop-ui/tokens/*"],
  plugins: [externalizeLocal, restoreDirectives],
};

const cssOptions = {
  ...shared,
  entryPoints: { styles: join(src, "index.ts") },
  outdir: join(dist, ".css-pass"),
  // Tokens are bundled here on purpose: styles.css ships the token variables too.
  plugins: [
    {
      name: "keep-css-only",
      setup(b) {
        b.onEnd((result) => {
          if (result.errors.length) return;
          const css = readFileSync(join(dist, ".css-pass", "styles.css"), "utf8");
          writeFileSync(join(dist, "styles.css"), css);
          rmSync(join(dist, ".css-pass"), { recursive: true, force: true });
        });
      },
    },
  ],
};

if (watch) {
  await (await context(jsOptions)).watch();
  await (await context(cssOptions)).watch();
} else {
  rmSync(dist, { recursive: true, force: true });
  await build(jsOptions);
  await build(cssOptions);
  console.log("built @plop-ui/react -> dist/");
}
