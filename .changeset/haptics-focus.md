---
"@plop-ui/react": patch
---

Fix: in Firefox and Safari, pressing a sticker no longer loses keyboard focus or cancels its squish. The iOS haptics fallback is now used only on touch devices, and it hands focus straight back. Tooltips and search results no longer close when haptics tick.
