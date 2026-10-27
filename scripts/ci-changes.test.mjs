import assert from "node:assert/strict";
import { test } from "node:test";
import { classify, samePackageJson } from "./ci-changes.mjs";

const none = { demoMdx: new Set(), versionOnly: () => false };
const pr = (files, extra = {}) =>
  classify({ event: "pull_request", branch: "feat/x", files: files.map((p) => (typeof p === "string" ? { path: p, status: "M" } : p)), ...none, ...extra });
const release = (files, versionOnly) =>
  classify({ event: "workflow_dispatch", branch: "changeset-release/main", files, demoMdx: new Set(), versionOnly });

test("library change: full checks, Storybook/demo builds, all 5 browsers", () => {
  assert.deepEqual(pr(["packages/react/src/Select/Select.tsx"]), {
    check: "full",
    buildApps: true,
    site: true,
    e2e: "full",
    projects: ["desktop", "phone", "firefox", "safari", "iphone"],
  });
});
test("site code change: all 5", () => assert.equal(pr(["apps/docs/app/_home/StickerPack.tsx"]).e2e, "full"));
test("site css change: all 5", () => assert.equal(pr(["apps/docs/app/site.css"]).e2e, "full"));
test("mdx text-only: light, no app builds", () =>
  assert.deepEqual(pr(["apps/docs/app/docs/nextjs/page.mdx"]), { check: "full", buildApps: false, site: true, e2e: "light", projects: ["desktop", "phone"] }));
test("mdx with a demo line: full", () =>
  assert.equal(pr(["apps/docs/app/docs/hooks/page.mdx"], { demoMdx: new Set(["apps/docs/app/docs/hooks/page.mdx"]) }).e2e, "full"));
test("public asset: light", () => assert.equal(pr(["apps/docs/public/readme/fonts.png"]).e2e, "light"));
test("tooling change: full", () => {
  for (const f of [".github/workflows/ci.yml", "pnpm-lock.yaml", "turbo.json", "package.json", "apps/docs/playwright.config.ts", "apps/docs/e2e/pack.spec.ts", "scripts/publish.mjs"])
    assert.equal(pr([f]).e2e, "full", f);
});
test("storybook only: full checks with app builds, no browsers", () =>
  assert.deepEqual(pr(["apps/storybook/stories/Tag.stories.tsx"]), { check: "full", buildApps: true, site: false, e2e: "none", projects: [] }));
test("changeset or changelog: site build only", () => {
  for (const f of [".changeset/brave-cats.md", "packages/react/CHANGELOG.md"])
    assert.deepEqual(pr([f]), { check: "skip", buildApps: false, site: true, e2e: "none", projects: [] }, f);
});
test("notes only: changeset status, nothing else", () =>
  assert.deepEqual(pr(["TASKS.md", "docs/ci-cd.md", "README.md", "LICENSE"]), { check: "changeset", buildApps: false, site: false, e2e: "none", projects: [] }));
test("strongest rule wins", () => assert.equal(pr(["TASKS.md", "apps/docs/app/docs/nextjs/page.mdx", "packages/tokens/src/tokens.ts"]).e2e, "full"));
test("unmatched file defaults to full", () => assert.equal(pr(["something/new.txt"]).e2e, "full"));
test("empty diff runs full", () => assert.equal(pr([]).e2e, "full"));
test("renamed file counts its old path", () =>
  assert.equal(pr([{ path: "docs/old-component.md", oldPath: "packages/react/src/Old.tsx", status: "R" }]).e2e, "full"));
test("deleted docs page is at least light", () => assert.notEqual(pr([{ path: "apps/docs/app/docs/hooks/page.mdx", status: "D" }]).e2e, "none"));
test("path with spaces is matched", () => assert.equal(pr(["apps/docs/public/a b.png"]).e2e, "light"));
test("version PR, versions only: site build only", () =>
  assert.deepEqual(
    release(
      [
        { path: "packages/react/package.json", status: "M" },
        { path: "packages/react/CHANGELOG.md", status: "M" },
        { path: ".changeset/brave-cats.md", status: "D" },
      ],
      () => true,
    ),
    { check: "skip", buildApps: false, site: true, e2e: "none", projects: [] },
  ));
test("version PR with a real package.json change: full", () => assert.equal(release([{ path: "packages/react/package.json", status: "M" }], () => false).e2e, "full"));
test("version PR adding a package: full", () => assert.equal(release([{ path: "packages/icons/package.json", status: "A" }], () => false).e2e, "full"));
test("push to main: full checks, desktop only", () =>
  assert.deepEqual(classify({ event: "push", branch: "main", files: [], ...none }), { check: "full", buildApps: true, site: true, e2e: "main", projects: ["desktop"] }));
test("schedule and manual runs on main: everything", () => {
  for (const event of ["schedule", "workflow_dispatch"]) assert.equal(classify({ event, branch: "main", files: [], ...none }).e2e, "full", event);
});

const base = JSON.stringify({ name: "@plop-ui/react", version: "0.3.4", keywords: ["a", "b"], dependencies: { "@plop-ui/tokens": "0.3.4", "@radix-ui/react-switch": "1.2.6" } }, null, 2);
test("samePackageJson: only versions differ", () =>
  assert.ok(samePackageJson(base, base.replaceAll("0.3.4", "0.3.5"))));
test("samePackageJson: reflowed keywords still the same", () =>
  assert.ok(samePackageJson(base, base.replace('[\n    "a",\n    "b"\n  ]', '["a", "b"]'))));
test("samePackageJson: a changed description is not", () =>
  assert.ok(!samePackageJson(base, base.replace('"name"', '"description": "x",\n  "name"'))));
test("samePackageJson: a new dependency is not", () =>
  assert.ok(!samePackageJson(base, base.replace('"@radix-ui/react-switch": "1.2.6"', '"@radix-ui/react-switch": "1.2.6", "left-pad": "1.0.0"'))));
test("samePackageJson: a non-plop dependency version bump is not", () =>
  assert.ok(!samePackageJson(base, base.replace('"1.2.6"', '"1.2.7"'))));
test("samePackageJson: unparsable JSON is not", () => assert.ok(!samePackageJson(base, "{ nope")));
