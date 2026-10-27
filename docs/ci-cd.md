# CI and releases: what runs, when, and what you do

Two workflows do all the automation:

- **CI** (`.github/workflows/ci.yml`) checks changes. It never publishes anything.
- **Release** (`.github/workflows/release.yml`) turns merged changes into npm releases.

CI looks at which files a pull request changed and runs only what that change needs. The rules live in `scripts/ci-changes.mjs` (with tests in `scripts/ci-changes.test.mjs`), and the reasoning is in `docs/superpowers/specs/2026-10-27-smart-ci-design.md`. When it isn't sure, it runs everything.

## What runs for which change

| You changed | Quick checks | Browser tests | About how long |
|---|---|---|---|
| A component, tokens or fonts (`packages/**`) | full, plus Storybook and the dispatch demo builds | **all 5**: Chrome, Android, Firefox, Safari, iPhone | TBD (measured) |
| The website's design or features (`.tsx`, `.ts`, `.css` in `apps/docs`) | full | **all 5** | TBD (measured) |
| A docs page that has a live demo (`.mdx` with a component or an `import` in the changed lines), or a page added, moved or deleted | full | **all 5** | TBD (measured) |
| A docs page's words only (`.mdx`), or an image in `apps/docs/public` | full | Chrome + Android | TBD (measured) |
| CI files, scripts, the lockfile, `turbo.json`, the e2e tests | full | **all 5** | TBD (measured) |
| Storybook or the dispatch demo only | full, plus those apps' builds | none | TBD (measured) |
| A changeset or a CHANGELOG (the `/changelog` page reads them) | none | none, but the site is built | TBD (measured) |
| Notes only: `TASKS.md`, READMEs, `docs/`, `LICENSE` | `pnpm changeset status` only | none | TBD (measured) |
| The bot's "version packages" PR (versions and changelogs only) | none | none, but the site is built | TBD (measured) |
| Anything else | full | **all 5** | TBD (measured) |

"Quick checks" means: build the libraries, then `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm size`.

The browser tests run as five separate jobs side by side, one per browser. The website is built once and shared with all of them, and each job downloads only its own browser (cached between runs). A new push to the same pull request cancels the run still going.

Other times CI runs:

- **After every merge to `main`:** a small check (quick checks plus Chrome), to catch two pull requests that each passed alone but clash together.
- **Every Monday at 03:00 UTC:** everything, all five browsers, to catch browser updates in quiet weeks.
- **By hand:** Actions tab → CI → Run workflow (on `main` it runs everything).

## The one check that matters: `ci`

Every run ends with a job called **`ci`**. It is red if any job that needed to run failed or was cancelled, and green otherwise. Jobs that a change didn't need show as skipped, and that's fine. `main` requires only `ci` to be green before a pull request can merge.

### Set it up on GitHub (once)

1. Open github.com/Snorlark/plop-ui → **Settings** → **Rules** → **Rulesets** → the ruleset for `main` (or **New branch ruleset**, targeting the default branch).
2. **Require status checks to pass** → remove `check` and `e2e` → **Add checks** → type `ci` → add it.
3. Keep **Require a pull request before merging**, **Block force pushes** and **Restrict deletions** on.
4. **Bypass list:** leave it empty, so nobody, including you, can merge while `ci` is red. You no longer need a bypass for the bot's PR (see below).
5. **Save changes.**

Do this while the pull request that introduces this CI is open, once its `ci` check is green. That pull request already runs the new CI, so it reports `ci` and per-browser checks such as `e2e (desktop)`, but never a check named plain `e2e`. Under the old rules it would wait forever. After it merges, update every other open pull request from `main` (**Update branch**), so it runs the new CI and reports `ci` too.

## From a pull request to npm

1. **Open a pull request** into `main`. CI starts on its own.
2. **Wait for `ci` to go green**, then merge. If it's red, open the failing job (see "When something fails").
3. **The bot opens or updates "chore(release): version packages"** if your change had a changeset. The Release workflow then starts CI on that pull request by itself: no more closing and reopening it. It's a version bump, so it only builds the site and goes green in a few minutes.
4. **Merge the bot's pull request when you want to release.** Merge your feature pull requests first, so one release carries all of them.
5. **The Release workflow stages the new versions on npm.** Nothing is public yet.
6. **Check before you approve:**
   - `ci` on `main` is green: open the Actions tab and look at the latest run on `main`.
   - The tokens version react needs is live (`npm view @plop-ui/tokens version`), or is the one you're about to approve.
7. **Approve on npm, in this order: tokens, then fonts, then react.**
   ```sh
   npm login
   npm stage list @plop-ui/tokens      # note the stage id
   npm stage approve <stage-id>
   ```
   Repeat for fonts, then react. Each approval asks for your 2FA. Approving is the moment it goes public.

pnpm users get a new version about 24 hours after you approve it: pnpm 11 waits a day before installing anything newly published.

## When something fails

- **A browser job is red:** open it, expand the failed step, read the first error. Click **Re-run failed jobs** only if it looks unrelated to your change (a timeout, a network error).
- **Firefox failed once, then passed on retry:** expected. Firefox rarely throws a hydration error (React #418, about 1 in 130 page loads), so the Firefox job retries once. It's tracked in `TASKS.md`.
- **`ci` is red but every job is green:** a job was cancelled (usually a newer push replaced it). Re-run, or push again.
- **The bot's PR has no `ci` check:** open Actions → CI → **Run workflow**, pick the branch `changeset-release/main`, run it.
- **Release fails with `ENEEDAUTH` for a package:** that package's trusted publisher on npm expired or is missing. On npmjs.com: the package → Settings → **Trusted Publisher** must show `Snorlark/plop-ui`, `release.yml`, permission **npm stage publish**, status **Valid**. Fix it, then re-run the Release workflow. Don't approve react until tokens' new version is live.
- **Release fails with `E422 ... visibility: "private"`:** something asked for provenance while the repo is private. Provenance is turned on only when the repo is public (`NPM_PROVENANCE` in `release.yml`); check nothing forces it in a `package.json`.

## GitHub Actions minutes

The repo is private, so its Actions time comes out of the monthly allowance (2,000 minutes on GitHub Free). Parallel jobs each count their own minutes.

| Kind of change | Billed minutes per run (rough) |
|---|---|
| Notes only | TBD (measured) |
| Changeset or the bot's version PR | TBD (measured) |
| Docs words | TBD (measured) |
| Component or site feature (all 5 browsers) | TBD (measured) |
| After a merge to `main` | TBD (measured) |

Before this change, every change paid for the full suite three times: on its pull request, on the bot's version pull request after close-and-reopen, and again on `main` after the merge, plus a test run in Release.

## Checking the rules locally

```sh
pnpm test:ci                                      # the classifier's tests
node scripts/ci-changes.mjs --base origin/main    # what CI would run for your branch
```
