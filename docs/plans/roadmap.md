# PlopUI roadmap

The working plan, kept in the repo so it's the same on every device. Tick boxes as things land, and update the
"Status" notes when something changes. Last updated: 2 Nov 2026 (0.7.1 published).

- Website: https://plopui.com
- GitHub: https://github.com/Snorlark/plop-ui
- npm: `@plop-ui/react` 0.7.1, `@plop-ui/tokens` 0.7.0 (includes `tokens.json`), `@plop-ui/fonts` 0.5.1

**How to pick this up anywhere:** clone or pull the repo, open this file, and start at the first unticked box in
"Now". With an AI coding assistant, point it at this file: _"Read docs/plans/roadmap.md and do the next unticked item
in Track X."_ Repo rules live in `CLAUDE.md`; real decisions go in `docs/decisions/`.

---

## Now (housekeeping)

- [x] Bix tomato beanie (#115) and the 0.7.0 / 0.7.1 releases (#114, #116)
- [x] #85 closed (footer loops to CSS, #109)
- [x] Branching: keep `dev` for now (see "Branching" below)
- [ ] Reply in the Reddit thread that Bix's beanie is live (with the cast video)
- [ ] #81 Dialog stays in its issue until 0.8 work starts

## Track A: MODO kit (with Gianluca, https://inmodo.app)

MODO is a desktop design app (exports HTML/CSS, SwiftUI, Jetpack Compose). Gianluca wants to rebuild PlopUI as a
reusable MODO library, credited to PlopUI. It's a visual adaptation, not our React code.

Agreed terms (from your reply): credit + link to plopui.com, the MIT notice, the SIL OFL notice for Sketchpop, built
from the real tokens, labelled **"Based on PlopUI v0.6.0"**, and a review before it goes public.

- [x] `tokens.json` (W3C Design Tokens, 173 tokens) generated from `packages/tokens/src/tokens.ts` (#111)
- [x] Published in `@plop-ui/tokens` 0.7.0: https://unpkg.com/@plop-ui/tokens/dist/tokens.json
- [ ] Send him the MODO package (file + checklist) when he replies
- [ ] Ask: "Which is easiest for MODO: this JSON, or Figma variables via the Design Bridge?"
- [ ] Write the review checklist and send it with the tokens:
  - contrast: every fill uses its `on-fill` text color
  - focus: the dashed "cut here" ring is visible on every surface
  - status: never color alone, each status keeps its label
  - shape: irregular corners from the tokens; one ink for lines, spot colors only fill
  - fonts and credit: Sketchpop + OFL text, MIT notice, "Based on PlopUI v0.6.0", plopui.com link
- [ ] Review his kit before launch
- [ ] Launch together: joint LinkedIn posts, and a "Design kits → MODO" link on plopui.com

## Track B: GEO (Generative Engine Optimization)

Goal: AI search engines and AI coding agents can find PlopUI, understand it, and use it correctly.
Rules: inspect what exists first, use the source code as the truth, don't invent capabilities, don't claim
something works until it's tested, keep the visual identity.

### What already exists (audited 2 Nov 2026, from #96 and earlier)

| Item | Status |
|---|---|
| `robots.txt` (`apps/docs/app/robots.ts`) | ✅ allows all, links the sitemap. No `Content-Signal` yet |
| `sitemap.xml` (`apps/docs/app/sitemap.ts`) | ✅ 34 URLs |
| Real 404s | ✅ `/does-not-exist` and `/docs/components/nope` both return 404 |
| `llms.txt`, `llms-full.txt` (`apps/docs/app/_site/llms.ts`) | ✅ generated from the nav and component registry (`llms-full.txt` ≈ 24 KB) |
| Component registry (`apps/docs/app/_site/registry.ts`) | ✅ title, group, badges, lede, code, props tables, do/don't, a11y notes per component |
| Generated props (`apps/docs/app/_generated/props.json`) | ✅ from the TypeScript source |
| Canonicals, titles, brand spellings (`_site/meta.ts`) | ✅ from #96 |
| JSON-LD | ⚠️ partial: `Person`, `SoftwareSourceCode`, `WebSite` on component pages |
| Headings | ✅ component page has one `<h1>` and `<h2>` sections; other pages not audited |

### Phase 1: technical foundations

- [ ] Add `Content-Signal: search=yes, ai-input=yes, ai-train=no` to robots (owner to confirm the policy; it's a
      signal, not access control)
- [ ] Audit every route type for status codes: unknown component slugs, unknown docs pages, `/playground?tool=junk`,
      old URLs. Use 410 for anything permanently removed
- [ ] Audit headings site-wide: exactly one meaningful `<h1>` per page, `<h2>`/`<h3>` in order, no headings used
      only for styling. Add a Playwright check so it can't regress
- [ ] Check every indexable page has a canonical, a title, a meta description and Open Graph tags
- [ ] Check the sitemap lists every indexable page (and nothing else); add `lastModified` from git or the changelog
- [ ] Check important content is in the server-rendered HTML, not only behind client interactions (playground,
      example tabs, folded props)

### Phase 2: structured data and AI-readable docs

- [ ] Site-wide JSON-LD: `WebSite`, the publisher (`Person`, Lark; no invented addresses, ratings or phone numbers),
      `SoftwareApplication` for the library (npm package, version, license, price 0), `SoftwareSourceCode` (repo)
- [ ] Guides: `TechArticle`; installation and Next.js guides as `HowTo` steps
- [ ] `FAQPage` only for real FAQ content (the "What is PlopUI?" page may qualify)
- [ ] Component pages: `TechArticle` about a `SoftwareSourceCode` entry with name, description, category (group),
      package, variants, props, framework (React 18/19, Next.js 15, Server/Client), accessibility notes, related
      components, docs URL. Generate it from `registry.ts` + `props.json`, never by hand
- [ ] Validate all JSON-LD (schema.org validator, Google Rich Results test) and add a test that parses it
- [ ] Extend `llms-full.txt` to cover: every component's props and defaults, design tokens, the five surfaces,
      accessibility, reduced motion, Server Component compatibility, troubleshooting, version compatibility,
      and the changelog. Keep it generated from source
- [ ] Component pages: make sure each has a title, meta description, H1, explanation, variants, full props with
      defaults, copyable working examples, imports, a11y notes, related components and a canonical
- [ ] Add "related components" links between components and guides

## Track C: official MCP server

Goal: a developer can tell an AI assistant _"Build me a dashboard using PlopUI"_ and it finds the right components,
reads their real APIs and source, and integrates them correctly.

**Decide first (#91):** that issue says run prompt evals before building an MCP server. Suggested order: run a few
evals with `llms.txt` only, build the MCP server, rerun the same evals, and compare. That proves it's worth it.

### Design notes

- New package, e.g. `packages/mcp` (`@plop-ui/mcp`), using the official MCP TypeScript SDK and the current spec
- Data comes from what already exists, built at release time and shipped inside the package so it matches the
  published version: `registry.ts`, `_generated/props.json`, `tokens.json`, the changelogs, the docs MDX, and the
  component source from `packages/react/src`
- Transports: stdio first (`npx @plop-ui/mcp`, works in every client), then optionally a hosted
  Streamable HTTP endpoint on plopui.com. Read-only, no auth needed, no secrets or private repo data
- Validate component IDs against the catalog; return clear errors for unknown ones
- Avoid new dependencies beyond the MCP SDK and a schema library it already expects

### Phase 3: foundation and discovery

- [ ] Package scaffold, build, and a version that tracks `@plop-ui/react`
- [ ] Catalog build step: components, groups, synonyms (e.g. "toggle" → Switch, "modal" → Dialog once it exists)
- [ ] Tools: `search_components`, `get_component` (description, category, variants, props, compatibility, a11y,
      dependencies)

### Phase 4: source, docs, tokens

- [ ] `get_component_source`: real TS/TSX + CSS Module from the published version, with imports and the version
- [ ] `get_component_example`: working examples with imports and `PlopProvider` setup
- [ ] `search_documentation`: install, guides, component docs, accessibility, troubleshooting
- [ ] `get_design_tokens`: from `tokens.json` (colors, type, radii, shadows, motion, surfaces; no spacing scale
      exists yet, so don't claim one)
- [ ] `get_installation_guide`: npm, pnpm, yarn, bun; React and Next.js setup
- [ ] `get_changelog`: per package, with breaking changes and compatibility notes
- [ ] Resources (version-aware URIs, e.g. `plopui://0.6.0/components/button`): catalog, each component's docs,
      tokens, install guide, accessibility guide, package metadata, changelog

### Phase 5: setup guides, tests, sync

- [ ] Docs page "Use PlopUI with AI tools": copyable config for Claude Code, Cursor, Codex and generic MCP clients,
      plus troubleshooting
- [ ] Tests: every tool against the real catalog, invalid IDs, source matching the published package
- [ ] CI check that fails if the catalog, `llms-full.txt` or MCP data drift from the source
- [ ] Rerun the #91 prompt evals and record the results

### QA checklist (Tracks B and C)

1. robots.txt and Content-Signal
2. Status codes for unknown routes
3. Heading hierarchy on home and docs pages
4. Structured data validity
5. Sitemap reachable and complete
6. Canonical URLs correct
7. `llms.txt` / `llms-full.txt` reachable and current
8. Component docs crawlable without JavaScript
9. MCP server connects (stdio, and HTTP if built)
10. Every MCP tool works
11. MCP source matches the published package
12. Compatible with the published npm versions
13. Client setup instructions work in Claude Code, Cursor, Codex
14. Docs and source versions agree

**Deliverables:** GEO changes, structured data, updated robots, sitemap, `llms.txt`/`llms-full.txt`, improved
component docs, the MCP server with tools and resources, client setup docs, automated tests, a validation report,
and a list of remaining limitations.

## Track D: library

In order:

- [ ] #81 Dialog (native `<dialog>`, already used by CommandPalette and Loader)
- [ ] #60 Select `name` prop for plain forms and Server Actions
- [ ] #63 Firefox hydration mismatch (React #418)
- [ ] #88 changesets/action v2
- [ ] #87 deploy Storybook
- [ ] Per-component CSS: fixes the 12.9 KiB "unused CSS" warning and part of the LCP gap. Changes how apps import
      styles, so open an issue with the options first
- [ ] Your own Figma library from `tokens.json` (after MODO)
- [ ] More components (#76–#83) and AI tooling (#86), per #90

Open from #67: LCP is about 2.8–3.0 s on mobile against a 2.5 s target, and the real-device check (mid-range Android,
iPhone) hasn't been done.

## Road to 1.0

1.0 means the API is stable: after it, any breaking change needs a 2.0. Path: 0.8 (Dialog, Accordion, breaking
decisions) → 0.9 API freeze (fixes only) → `1.0.0-rc.1` for about 2 weeks of real use → 1.0.0, all three packages
together. Realistic: 4–6 weeks.

- [ ] Per-component CSS: decide and ship before 0.9 (changes how apps import styles)
- [ ] Ops-era names (`Tag status="dispatched"…`, `UnitCard`, `TicketCard`, `Eta`). Undecided; recommendation: no app
      depends on them yet, so deprecate in 0.8 (console warning, docs note), replace their uses in the docs and
      playground, and remove in 0.9. Keep `Tag tone` as the way to color tags
- [ ] Spacing scale names in `tokens.ts`
- [ ] Prop-name audit across components
- [ ] Quality bar: #63 Firefox fix, real-device pass, contrast and dark-mode audits, #88 changesets v2
- [ ] Docs: every component page complete, "Migrating from 0.x", a note on what counts as breaking
- New components (#77–#80, #82, #83) don't block 1.0; they can ship in 1.x

## Track F: growth

SEO only helps people who already search for PlopUI. Similar libraries spread through distribution: plugging into an
ecosystem developers already use (8bitcn via the shadcn registry, Product Hunt #2 of the day), short demo videos on X
(Magic UI, Aceternity, Lucide Animated), and being what AI tools reach for (shadcn behind v0, Bolt and Lovable).
Facebook and LinkedIn reach your network, not developers choosing a UI kit. **Not now:** a Flutter port.

**Positioning:** not another component library, not a shadcn competitor. PlopUI is the go-to React kit for
expressive, playful, hand-drawn interfaces that are still accessible and well engineered.

**Who it's for (a niche on purpose):** design engineers, product designers who code, indie makers building things
with personality (creative tools, portfolios, education and kids' apps, community apps, playful onboarding, event
pages). Not enterprise dashboards.

**North star:** 10 developers who aren't Lark build something real with PlopUI, keep using it, and recommend it.
Stages: recognition → adoption (prove first) → ecosystem.

**Objection to remove:** "not enough components to build a real product". Already there: Select, MultiSelect,
Menu, CommandPalette, Tabs, Tooltip, toasts, loading states, form fields. Missing for the niche: Dialog, Accordion,
Popover, Breadcrumbs, Pagination, Slider, FileInput, Calendar. Skip a data table for now.

- [ ] Week 1: shadcn-compatible registry (`npx shadcn add @plopui/button`) served from plopui.com; 21st.dev listing;
      nudge awesome-react-components #681. Done when a fresh Next.js + shadcn app installs a component in one command
- [ ] Week 2: design skill (#86) + a before/after clip (same prompt, with and without it); email 3–5 design/AI curators
- [ ] Week 3: demo.plopui.com (#84) with 2 forkable mini-apps, then Product Hunt + Show HN the same week, plus
      r/reactjs and This Week in React
- [ ] Ongoing: a 10–15 s looping clip on X every 2–3 days (burst, coin-flip spinner, paper tear, Bix)
- [ ] Launch channels: Product Hunt, r/reactjs, a DEV Community engineering story, Uneed, Microlaunch, Show HN,
      This Week in React
- [ ] Full example apps for the niche (creative workspace, playful project board, portfolio/link-in-bio), forkable
- [ ] "Make it yours" docs page (tokens, surfaces, roundness); consider a wobble/animation intensity setting
- [ ] Community: `CONTRIBUTING.md`, a component-request form, a "Built with PlopUI" showcase
- [ ] Personally reach out to Reddit/LinkedIn commenters to find the first 10 builders
- [ ] Measure separately, weekly: stars, downloads, real installs (GitHub "Used by"), independent mentions, outside
      contributors, showcase entries, site visitors and referrers

## Track E: posting

- [ ] Loading states clip (ink loop, hopping dots, coin flip, skeletons turning into cards)
- [ ] Bix fix as a community story ("a Reddit commenter caught it, shipped the next day")
- [ ] MODO launch post, together with Gianluca
- [ ] "PlopUI works with your AI assistant" post, once the MCP server ships

## Branching

**Decided 2026-11-02: keep `dev` for now.** Feature branches → `dev`, and `dev` → `main` to release (CI runs there).
After every merge into `main`, bring `dev` level: `git push origin origin/main:dev`. Revisit before outside
contributors pick up issues regularly: trunk-based (PRs straight into `main`, CI on every PR) avoids late failures
like Safari and Lighthouse on #102. GitHub Actions is free for public repos.

## Numbers worth keeping (2 Nov 2026)

npm: 3,654 downloads across the 3 packages in the first 11 days. 261 commits, 86 merged PRs, 30 component modules,
108 stories, 178 unit tests, ~270 e2e tests per browser pair across 5 browsers, 173 tokens, 28 decision records.
Button 7.7 → 5.6 KB gzip (−27%), home HTML −22%, playground HTML −55%, home TBT −71%, live mobile Lighthouse
92 / 94 / 96.
