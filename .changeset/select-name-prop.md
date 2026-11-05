---
"@plop-ui/react": minor
---

Select and MultiSelect take a `name` prop, so they work in a plain `<form>` and in a Next.js Server Action. The picked value is submitted through a hidden input: `formData.get(name)` for a Select (an empty string while nothing is picked), `formData.getAll(name)` for a MultiSelect. A disabled field submits nothing.
