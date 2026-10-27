---
"@plop-ui/react": patch
---

Checkbox: the indeterminate state comes only from the native `indeterminate` property, which screen readers announce as "mixed". The extra `aria-checked="mixed"` is gone: in server-rendered HTML it contradicted the input until hydration.
