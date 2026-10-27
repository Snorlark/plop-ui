# Smart CI: test what changed, once, in parallel

Date: 2026-10-27 · Status: approved by Lark in chat, ready for a plan

## Why

Every PR waits a long time, and the same work runs three or four times per change:

- `ci.yml` runs on every PR **and** on every push to `main`. Its `e2e` job waits for `check` (`needs: check`), then runs `pnpm build` (every app, including Storybook and the dispatch demo, which the tests never use), installs Chromium, Firefox and WebKit with system deps on every run (nothing cached), and `test:e2e` builds the docs site a second time before running all 5 Playwright projects in one job.
- The bot's "chore(release): version packages" PR gets no CI at all (GitHub doesn't run workflows for PRs opened with `GITHUB_TOKEN`), so Lark closes and reopens it to trigger a full run, for a PR that only changes version numbers.
- `release.yml` runs `pnpm test` again on every push to `main`.
- Nothing on `main` blocks a merge while CI is red or still running.

Success: a PR that only touches notes finishes in about a minute; a docs-text PR in a few minutes; a component or site-feature PR runs the full five-browser suite in roughly 5–7 minutes (measure it); the bot's PR goes green on its own; `main` can't take a red merge.

## Goals

1. **Test what changed.** Each PR is classified by its changed files, and only the jobs that matter run.
2. **Full browser coverage where browsers differ.** Library changes and site design/feature changes run all 5 Playwright projects (`desktop`, `phone`, `firefox`, `safari`, `iphone`). This is where the Firefox/Safari bugs were found (Switch face click, haptics focus, the sticker pack).
3. **Once, not three times.** No full re-run after merging; no `pnpm test` in the Release workflow.
4. **Fast when it does run.** Browsers in parallel jobs, the site built once and shared, browsers cached, old runs cancelled.
5. **One required gate, `ci`,** that `main` requires, with skipped jobs counting as passed.
6. **A guide,** `docs/ci-cd.md`, for Lark: what runs when, roughly how long, and what to do at each release step.

## Non-goals

- Changing what the tests check, or the Playwright projects themselves.
- Changing the release process (Changesets, staged publishing, approving tokens → fonts → react on npm).
- Vercel's own builds and previews.

## Anti-goals (a failure even if it "works")

- A component or site-feature change merges without the five-browser run.
- The merge button waits forever because a required check was skipped or never started.
- The gate goes green when a job it depends on failed or was cancelled.
- An unclear file gets the light treatment. **When in doubt, run everything.**

## How a change is classified

The rules live in a small script (`scripts/ci-changes.mjs`), not in YAML, so they can be unit-tested. Input: the list of changed files (and, for `.mdx`, the changed lines). Output: what to run.

| Changed files | Quick checks | Browser tests |
|---|---|---|
| `packages/**` (react, tokens, fonts) | full | **all 5** |
| Site code: `apps/docs/**` `.ts`, `.tsx`, `.css`, `.mjs`, config files | full | **all 5** |
| `.mdx` pages in `apps/docs` where a changed line has a JSX tag (`<Capital…`) or an `import` (a live demo) | full | **all 5** |
| `.mdx` pages in `apps/docs`, text-only changes; `apps/docs/public/**` | full | `desktop` + `phone` |
| CI and tooling: `.github/**`, root `package.json`, `pnpm-lock.yaml`, `turbo.json`, `apps/docs/playwright.config.ts`, `apps/docs/e2e/**`, `scripts/**` | full | **all 5** |
| `apps/storybook/**`, `apps/dispatch-demo/**` | full (including that app's build) | none |
| `.changeset/*.md`, `packages/*/CHANGELOG.md` (the docs site reads these for `/changelog`) | site build only | none |
| Notes only: `*.md` outside `apps/docs/app`, `TASKS.md`, `PRD.md`, `docs/**`, `LICENSE` | `pnpm changeset status` only | none |
| **Anything not matched above** | full | **all 5** |

A PR's result is the strongest rule any of its files hits.

**The bot's version PR** (branch `changeset-release/main`) gets only the site build (so a broken `/changelog` still fails) when every changed file is a `packages/*/package.json` that is identical to `main`'s once parsed and with `version` and `@plop-ui/*` dependency versions ignored (formatting changes such as reflowed `keywords` arrays don't count), a `packages/*/CHANGELOG.md`, or a deleted `.changeset/*.md`. Anything else on that branch is classified like a normal PR.

## Which events run what

| Event | What runs |
|---|---|
| `pull_request` | classified as above |
| `workflow_dispatch` on `changeset-release/main` (started by the Release workflow) | classified as above (usually: version-only, skip) |
| `push` to `main` (after a merge) | a small check: quick checks + `desktop` only, about 3 minutes. Catches two PRs that each passed alone but clash together. |
| `schedule`, weekly (Monday early morning) and `workflow_dispatch` by hand | everything: quick checks + all 5 |

`concurrency`: a new push to the same PR cancels the old run. Runs on `main` are not cancelled.

## Job layout

- **`changes`**: checks out with enough history to diff against the base, runs `scripts/ci-changes.mjs`, outputs `check` (none / changeset-only / full), `e2e` (none / light / full), and the list of Playwright projects.
- **`check`**: only if needed. Install, build the libraries, then lint, typecheck, unit tests, size. It also builds the docs site **only when `build-site` isn't running**, so the site is built once per PR. When the libraries, tooling or Storybook / the dispatch demo changed, it builds those two apps too (they depend on the libraries, and nothing else would catch a broken build before the weekly run). Runs **in parallel** with `build-site`, not before it.
- **`build-site`**: when e2e runs, or for a changeset-only change. Builds the docs site once into `.next-e2e` and uploads it (with the built `packages/*/dist`) as an artifact for the e2e jobs.
- **`e2e`**: a matrix, one job per Playwright project, each downloading the artifact, installing **only its own browser** (`chromium`, `firefox` or `webkit`), with `~/.cache/ms-playwright` cached by Playwright version and browser, then `playwright test --project=<name>` against the prebuilt site.
- **`ci`** (the gate): `needs` all of the above, `if: always()`. Fails if any needed job failed or was cancelled; passes when jobs succeeded or were skipped on purpose.

## Release workflow changes

- Remove `pnpm test` (the PR already passed the gate).
- After the Changesets action opens or updates the version PR, start `ci.yml` on `changeset-release/main` with `workflow_dispatch` (allowed from `GITHUB_TOKEN`, unlike PR events). That gives the version PR its `ci` check, so no more close-and-reopen. Needs `actions: write`.
- Staging doesn't wait for the after-merge check on `main`. npm approval is manual, so the guide's release steps say: check that `ci` on `main` is green before approving on npm.

## Branch protection

The `main` ruleset requires one status check, `ci`, instead of `check` and `e2e`. No bypass for normal PRs. Lark changes this by hand on GitHub; the guide has the steps.

## Guide: `docs/ci-cd.md`

For Lark, in plain words:

- the table of what runs for which change, and roughly how long;
- the flow from PR to npm: open PR, wait for `ci`, merge, bot PR goes green by itself, merge it, approve on npm in the order tokens → fonts → react, and check that the tokens version react needs is live first;
- what to do when something fails (flaky Firefox retry, `ENEEDAUTH` means a trusted publisher expired, re-running a job);
- the ruleset steps;
- GitHub Actions minutes on a private repo, and roughly what each kind of PR costs.

## Constraints

- No new paid services. Third-party actions are allowed, pinned to a full commit SHA; prefer plain shell and `actions/*`.
- Keep the existing check commands (`pnpm build`, `lint`, `typecheck`, `test`, `size`) and the Playwright suite as they are.
- Commits follow the repo's rules: conventional commits, no Claude attribution, Lark opens the PRs.

## How we'll know it's right

- Unit tests for `scripts/ci-changes.mjs` cover every row of the table, the "strongest rule wins" case, the unmatched-file default, the `.mdx` demo rule, and both outcomes of the version-PR rule.
- Before merging, a deliberately failing test makes the `ci` gate go red, and a notes-only change makes it go green with the heavy jobs skipped.
- The guide records real run times measured after the change.

## Calls made after the builder check (Claude's, not Lark's)

- Package and tooling changes also build Storybook and the dispatch demo in `check` (safety over a minute of speed).
- Changesets and changelogs get a site build but no browser tests; the version PR gets the same, instead of skipping everything.
- The version-PR rule compares parsed `package.json` files, not changed lines.
- `check` skips its own docs build when `build-site` runs.
- `pnpm changeset status` runs on notes-only PRs only: no new "every package PR needs a changeset" rule.
- Release staging doesn't wait for CI on `main`; the guide covers it at the manual npm approval.

## Left to the builder

- Exact YAML, job names other than the `ci` gate, artifact names, cache keys.
- How `changes` gets the diff base for each event.
- Which pinned actions to use, if any.
- How to keep the matrix's Playwright `webServer` working against a downloaded build.
