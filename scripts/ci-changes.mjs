// Decides what CI runs for a change, from the files it touches (see docs/ci-cd.md and
// docs/superpowers/specs/2026-10-27-smart-ci-design.md). When in doubt, it runs everything.
//
// CLI: node scripts/ci-changes.mjs --base <git ref>
// Prints the result and, on GitHub Actions, writes check / build_apps / site / e2e / projects to $GITHUB_OUTPUT.
import { execFileSync } from "node:child_process";
import { appendFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const PROJECTS = { full: ["desktop", "phone", "firefox", "safari", "iphone"], light: ["desktop", "phone"], main: ["desktop"], none: [] };
export const BROWSER = { desktop: "chromium", phone: "chromium", firefox: "firefox", safari: "webkit", iphone: "webkit" };

// Levels, weakest first. A change gets the strongest level any of its files reaches.
const LEVELS = ["notes", "changelog", "light", "apps", "full"];
const RESULT = {
  notes: { check: "changeset", buildApps: false, site: false, e2e: "none" },
  changelog: { check: "skip", buildApps: false, site: true, e2e: "none" },
  light: { check: "full", buildApps: false, site: true, e2e: "light" },
  apps: { check: "full", buildApps: true, site: false, e2e: "none" },
  full: { check: "full", buildApps: true, site: true, e2e: "full" },
};
const out = (level, e2e = RESULT[level].e2e) => ({ ...RESULT[level], e2e, projects: PROJECTS[e2e] });

const isChangelog = (p) => /^\.changeset\/[^/]+\.md$/.test(p) || /^packages\/[^/]+\/CHANGELOG\.md$/.test(p);

/** One path's level. `status` is git's A/M/D/R; `demo` is true when an .mdx change touches a live demo. */
function level(path, status, demo) {
  if (isChangelog(path)) return "changelog";
  if (path.startsWith("apps/docs/")) {
    if (path.startsWith("apps/docs/e2e/") || path === "apps/docs/playwright.config.ts") return "full";
    if (path.startsWith("apps/docs/public/")) return "light";
    // A demo edit, or a page added in a new place, moved or removed, can break more than words.
    if (path.endsWith(".mdx")) return demo || status === "D" || status === "R" ? "full" : "light";
    return "full";
  }
  if (path.startsWith("apps/storybook/") || path.startsWith("apps/dispatch-demo/")) return "apps";
  if (path.startsWith("docs/") || path === "LICENSE" || path.endsWith(".md")) return "notes";
  return "full";
}

/**
 * True when a unified diff (with a few lines of context) of an .mdx page touches a live demo: a changed hunk
 * that has an import or a JSX component on a changed or nearby line, so a prop edit inside a multi-line
 * `<Select ... />` counts too.
 */
export function mdxTouchesDemo(diff) {
  return diff
    .split(/^@@.*$/m)
    .slice(1)
    .some((h) => /^[+-]/m.test(h) && /<[A-Z]|^[+-]?\s*import |\/>/m.test(h));
}

/** Same package.json once parsed, ignoring `version` and @plop-ui/* dependency versions (a release bump). */
export function samePackageJson(baseText, headText) {
  const strip = (text) => {
    const pkg = JSON.parse(text);
    delete pkg.version;
    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"])
      for (const name of Object.keys(pkg[field] ?? {})) if (name.startsWith("@plop-ui/")) pkg[field][name] = "*";
    return JSON.stringify(pkg);
  };
  try {
    return strip(baseText) === strip(headText);
  } catch {
    return false;
  }
}

/** What to run. See the spec's tables; anything unclear, including an empty diff, runs everything. */
export function classify({ event, branch, files, demoMdx, versionOnly }) {
  if (event === "push") return { ...out("full", "main") };
  if (event === "schedule" || (event === "workflow_dispatch" && branch === "main") || files.length === 0) return out("full");

  const bump = (f) =>
    (f.status === "M" && /^packages\/[^/]+\/package\.json$/.test(f.path) && versionOnly(f.path)) ||
    (/^packages\/[^/]+\/CHANGELOG\.md$/.test(f.path) && f.status !== "D") ||
    (/^\.changeset\/[^/]+\.md$/.test(f.path) && f.status === "D");
  if (branch === "changeset-release/main" && files.every(bump)) return out("changelog");

  let strongest = 0;
  for (const f of files)
    for (const p of [f.path, f.oldPath].filter(Boolean)) strongest = Math.max(strongest, LEVELS.indexOf(level(p, f.status, demoMdx.has(p))));
  return out(LEVELS[strongest]);
}

function cli() {
  const base = process.argv[process.argv.indexOf("--base") + 1];
  const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  // -z keeps paths with spaces or non-ASCII characters intact.
  const parts = git("diff", "-z", "--name-status", "-M", `${base}...HEAD`).split("\0").filter(Boolean);
  const files = [];
  for (let i = 0; i < parts.length; ) {
    const status = parts[i++][0];
    if (status === "R" || status === "C") files.push({ status: "R", oldPath: parts[i++], path: parts[i++] });
    else files.push({ status, path: parts[i++] });
  }
  const demoMdx = new Set(
    files
      .filter((f) => f.path.endsWith(".mdx"))
      .filter((f) => mdxTouchesDemo(git("diff", "-U3", `${base}...HEAD`, "--", f.path)))
      .map((f) => f.path),
  );
  const versionOnly = (path) => {
    try {
      return samePackageJson(git("show", `${base}:${path}`), git("show", `HEAD:${path}`));
    } catch {
      return false;
    }
  };
  const result = classify({ event: process.env.GITHUB_EVENT_NAME ?? "pull_request", branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "", files, demoMdx, versionOnly });
  console.log(JSON.stringify({ files: files.length, ...result }, null, 2));
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `check=${result.check}\nbuild_apps=${result.buildApps}\nsite=${result.site}\ne2e=${result.e2e}\nprojects=${JSON.stringify(result.projects.map((name) => ({ name, browser: BROWSER[name] })))}\n`,
    );
}

// Real path as a file URL: a plain `file://${path}` misses spaces, non-ASCII characters and symlinks, and the CLI would silently do nothing.
if (import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) cli();
