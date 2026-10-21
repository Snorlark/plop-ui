// Fails the build if a class name used by the compiled JS is missing from dist/styles.css,
// i.e. if the JS pass and the CSS pass ever disagree on generated CSS Module names.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist", import.meta.url).pathname;
const css = readFileSync(join(dist, "styles.css"), "utf8");
const missing = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".js")) {
      const code = readFileSync(p, "utf8");
      // esbuild emits CSS Module maps as `{ key: "File_class", ... }` objects.
      for (const [, cls] of code.matchAll(/:\s*"([A-Za-z][\w-]*_[\w-]+)"/g)) {
        if (!css.includes(`.${cls}`) && !css.includes(`@keyframes ${cls}`)) missing.push(`${name}: ${cls}`);
      }
    }
  }
})(dist);
if (missing.length) {
  console.error("Class names missing from styles.css:\n" + missing.join("\n"));
  process.exit(1);
}
console.log("check-css: every class used in JS exists in styles.css");
