// Stages @plop-ui/tokens, @plop-ui/fonts and @plop-ui/react (in that order) for `pnpm release`.
//
// Staged publishing: CI uploads each new version as a draft (`npm stage publish`), and it only goes live
// when a maintainer approves it on npmjs.com (or `npm stage approve <id>`) with 2FA. A hijacked workflow
// can't put a version in front of users on its own. The packages' trusted publishers allow staging only.
//
// Why not `changeset publish`: it uses `pnpm publish`, which fails npm trusted publishing (OIDC). Here
// pnpm packs each package (turning `workspace:*` into real versions) and npm 11.5+ stages the tarball,
// with provenance. Versions already on npm are skipped, and a version already staged and waiting for
// approval is left alone, so later pushes to main don't fail. `changeset tag` then creates the git tags,
// which the Changesets action pushes.
//
// DRY_RUN=1 node scripts/publish.mjs packs and runs `npm stage publish --dry-run` without uploading.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PACKAGES = ["tokens", "fonts", "react"];
const dry = Boolean(process.env.DRY_RUN);
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });

const out = mkdtempSync(join(tmpdir(), "plop-publish-"));
let failed = false;
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
    // Pre-releases (0.2.0-next.0) must not become `latest`.
    const tag = version.includes("-") ? "next" : "latest";
    console.log(`Staging ${name}@${version} (tag ${tag})${dry ? " (dry run)" : ""}`);
    const staged = spawnSync("npm", ["stage", "publish", tarball, "--access", "public", "--tag", tag, "--provenance", ...(dry ? ["--dry-run"] : [])], {
      stdio: ["ignore", "inherit", "pipe"],
      encoding: "utf8",
    });
    process.stderr.write(staged.stderr ?? "");
    if (staged.status === 0) continue;
    // Staged versions share the version index with published ones, so a re-run hits a conflict.
    if (/already (been )?staged|already exists|E409|cannot publish over/i.test(staged.stderr ?? "")) {
      console.log(`${name}@${version} is already staged and waiting for approval on npmjs.com`);
      continue;
    }
    failed = true;
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}

if (failed) process.exit(1);
if (!dry) execFileSync("pnpm", ["changeset", "tag"], { stdio: "inherit" });
