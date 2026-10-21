---
"@plop-ui/react": minor
---

`PlopProvider` without a `surface` now keeps the surrounding one (a parent provider's, or `data-plop-surface` on the page) instead of resetting to poster, so a page-level paper/mat switch reaches every provider. New `PaperIcon` and `CuttingMatIcon`.
