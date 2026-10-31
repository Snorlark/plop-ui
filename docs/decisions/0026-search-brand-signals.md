# 0026: Search brand signals

Searching "plop ui" showed plopjs.com (the code generator) and a Behance project called "Plop!", but not plopui.com. The site had no canonical URLs, the brand name wasn't in the home `<h1>`, and nothing told search engines that "Plop UI" and "plop-ui" are the same thing as PlopUI.

- **One metadata helper:** `pageMeta()` in `app/_site/meta.ts`. Every indexable page gets its own canonical URL and a share preview with its own title and description. Before, every shared page previewed as the home page.
- **Titles say what people search:** the home page is "PlopUI: hand-drawn React UI components, imperfect on purpose", and component pages are "Button: hand-drawn React component · PlopUI".
- **Spellings:** schema.org `WebSite` and `SoftwareSourceCode` list `alternateName` (Plop UI, plop-ui, Plop-UI, plopui) and `sameAs` (GitHub, npm). The footer, README and `llms.txt` say "also written Plop UI or plop-ui" once, in plain words. `llms.txt` also says PlopUI isn't Plop the code generator.
- **Heading:** the home `<h1>` label now starts with "PlopUI:". The visible lettering is unchanged, and the logo above it shows the brand.
- **Redirects:** `/docs` → `/docs/getting-started` is now permanent (308), so it isn't indexed as a second copy.
- **npm keywords** gain `plopui` and `plop-ui` (with a patch changeset).
- **Not done here:** the "Cutting mat" toggle still sits inside the `<h1>`, because moving it changes the hero layout and needs a design pass. Sitemap `lastmod` is also left out: build time isn't the page's real change date, and a wrong date is worse than none.
