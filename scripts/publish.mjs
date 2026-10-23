// Publishes @plop-ui/tokens, @plop-ui/fonts and @plop-ui/react (in that order) for `pnpm release`.
//
// Why not `changeset publish`: it publishes with `pnpm publish`, which fails npm trusted publishing (OIDC)
// with a 403. Here pnpm packs each package (turning `workspace:*` into real versions) and npm 11.5+
// publishes the tarball, which handles trusted publishing and provenance. Versions already on npm are
// skipped. `changeset tag` then creates the git tags, which the Changesets action pushes.
//
// DRY_RUN=1 node scripts/publish.mjs packs and runs `npm publish --dry-run` without publishing.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PACKAGES = ["tokens", "fonts", "react"];
const dry = Boolean(process.env.DRY_RUN);
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });

const out = mkdtempSync(join(tmpdir(), "plop-publish-"));
try {
  for (const dir of PACKAGES) {
    const cwd = join("packages", dir);
    const { name, version } = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
    let published = "";
    try {
      published = execFileSync("npm", ["view", `${name}@${version}`, "version"], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" }).trim();
    } catch {
      // 404: this version isn't on npm yet.
    }
    if (published === version) {
      console.log(`${name}@${version} is already on npm, skipping`);
      continue;
    }
    const tarball = run("pnpm", ["pack", "--pack-destination", out], cwd).trim().split("\n").at(-1);
    console.log(`Publishing ${name}@${version}${dry ? " (dry run)" : ""}`);
    execFileSync("npm", ["publish", tarball, "--access", "public", "--provenance", ...(dry ? ["--dry-run"] : [])], { stdio: "inherit" });
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}

if (!dry) execFileSync("pnpm", ["changeset", "tag"], { stdio: "inherit" });
