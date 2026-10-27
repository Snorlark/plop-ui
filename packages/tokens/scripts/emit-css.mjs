// Builds dist/tokens.css from the compiled token object, so CSS and JS share one source.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tokens } from "../dist/index.js";

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const decl = (name, value) => `  --plop-${name}: ${value};`;
const lines = [];
const push = (...l) => lines.push(...l);

const { color, onFill, font, fontWeight, fontSize, radius, roundness, stroke, hatch, motion, surfaces, surfacePattern } = tokens;

push("/* @plop-ui/tokens — generated from src/tokens.ts. Do not edit by hand. */", "", ":root {");
for (const [k, v] of Object.entries(color)) push(decl(kebab(k), v));
for (const [k, v] of Object.entries(onFill)) push(decl(`on-fill-${k}`, v.text));
push(decl("fill-ink", "var(--plop-ink)"), decl("fill-plain", "var(--plop-paper)"));
for (const k of ["tomato", "mustard", "bubblegum", "periwinkle", "mint"]) push(decl(`fill-${k}`, `var(--plop-${k})`));
for (const [k, v] of Object.entries(font)) push(decl(`font-${k}`, v));
for (const [k, v] of Object.entries(fontWeight)) push(decl(`weight-${k}`, String(v)));
for (const [k, v] of Object.entries(fontSize)) push(decl(`text-${k}`, `${v}px`));
// Every px length in a radius follows --plop-roundness, so one number makes the whole kit sharper or softer.
push(decl("roundness", String(roundness)));
const radiusDecls = Object.entries(radius).map(([k, v]) => decl(`radius-${k}`, v.replace(/(\d+(?:\.\d+)?)px/g, "calc($1px * var(--plop-roundness))")));
push(...radiusDecls);
push(decl("stroke", stroke.default), decl("stroke-sm", stroke.sm), decl("stroke-illustration", stroke.illustration));
push(decl("hatch-offset-x", hatch.offsetX), decl("hatch-offset-y", hatch.offsetY));
push(
  decl("ease-spring", motion.spring),
  decl("duration-spring", motion.springDuration),
  decl("ease-squish", motion.squish),
  decl("duration-squish", motion.squishDuration),
  decl("boil-interval", motion.boilInterval),
);
push("}", "");
// A custom property resolves var() where it's declared, so a PlopProvider with its own roundness declares the radii again.
push("[data-plop-roundness] {", ...radiusDecls, "}", "");

const modeKeys = ["bg", "lineA", "lineB", "on", "onSoft", "focus", "hatch", "glow"];
for (const [name, s] of Object.entries(surfaces)) {
  const sel = name === "poster" ? ':root, [data-plop-surface="poster"]' : `[data-plop-surface="${name}"]`;
  push(`${sel} {`);
  for (const k of modeKeys) push(decl(`${kebab(k)}-l`, s.light[k]), decl(`${kebab(k)}-d`, s.dark[k]));
  const p = surfacePattern[name];
  push(decl("surface-image", p.image), decl("surface-size", p.size), decl("surface-position", p.position ?? "0 0"));
  push("}", "");
}

const resolve = (mode) => modeKeys.map((k) => decl(kebab(k), `var(--plop-${kebab(k)}-${mode})`));
// Declared on every surface element (not just :root) so it picks up that element's own hatch color.
const shadowHatch = decl("shadow-hatch", `repeating-linear-gradient(-45deg, var(--plop-hatch) 0 ${hatch.on}, transparent ${hatch.on} calc(${hatch.on} + ${hatch.off}))`);
push(":root, [data-plop-surface] {", ...resolve("l"), shadowHatch, "  color-scheme: light;", "}", "");
push('[data-plop-theme="dark"], [data-plop-theme="dark"] [data-plop-surface] {', ...resolve("d"), "  color-scheme: dark;", "}", "");
push(
  "@media (prefers-color-scheme: dark) {",
  '  :root:not([data-plop-theme="light"]),',
  '  [data-plop-surface]:not([data-plop-theme="light"]):not([data-plop-theme="light"] *) {',
  ...resolve("d").map((l) => "  " + l),
  "    color-scheme: dark;",
  "  }",
  "}",
  "",
);

push(
  "/* Paint any element as the active surface: the PlopProvider root, or <body>. */",
  ".plop-surface {",
  "  background-color: var(--plop-bg);",
  "  background-image: var(--plop-surface-image);",
  "  background-size: var(--plop-surface-size);",
  "  background-position: var(--plop-surface-position);",
  "  color: var(--plop-on);",
  "  font-family: var(--plop-font-body);",
  "  font-size: var(--plop-text-body);",
  "  font-feature-settings: \"calt\" 1;",
  "  -webkit-font-smoothing: antialiased;",
  "}",
  "",
);

push(
  "/* Reset any element to \"printed on paper\": cards, sheets and panels that stay light on every surface. */",
  ".plop-paper {",
  "  --plop-on: var(--plop-ink);",
  "  --plop-on-soft: var(--plop-ink-soft);",
  "  --plop-focus: var(--plop-ink);",
  "  --plop-hatch: var(--plop-ink);",
  shadowHatch,
  "  background-color: var(--plop-sheet);",
  "  color: var(--plop-ink);",
  "  color-scheme: light;",
  "}",
  "",
);

const out = fileURLToPath(new URL("../dist/tokens.css", import.meta.url));
writeFileSync(out, lines.join("\n"));
console.log(`wrote ${out}`);
