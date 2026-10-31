# 0026: Optional extras load on demand

Measured with production Vite builds (React external, gzip): a plain Button cost 7.7 kB. Of that, 23% was all six Buddy drawings, kept for the optional `buddy` prop, and 20% the opt-in click particles. Select and SearchField pulled in the whole Spinner and every Buddy for their busy dots (#67).

- **Click particles** (`InkBurst/burst.ts`) load through `import()` the first time a burst fires. A sticker with `burst` set preloads them in idle time, so its first press isn't late.
- **Buddy moods.** Pip, the default, is drawn inside Sticker. The other five load with `React.lazy` only when `buddyMood` asks for one. Each mood is now its own constant, so Spinner's `buddy` kind ships only Hum (`HumArt`).
- **Busy dots** live in `Spinner/ink.tsx` next to the ink loop (`DotsMark`), so Select and SearchField don't import the rest of Spinner.
- **The size budget** for Button now measures what loads up front: dynamic imports stay unbundled (`.size-limit.js`, which replaces the `size-limit` field in package.json). The limit is 5 kB brotli; it measures 4.73 kB, down from 7.09 kB.
- **Results (gzip, up front):** Button 7.69 → 5.63 kB, IconButton 7.38 → 5.32 kB, Select/MultiSelect 10.2 → 7.6 kB, Spinner 3.74 → 2.66 kB, whole library 31.8 → 31.1 kB. No public API changed.
- **Not done:** the 2–4 kB Button target from the audit. About 2.8 kB gzipped is the sticker itself (press physics, tilt, shadow, Pip, the loading state), plus Vite's 1 kB helper for lazy chunks. Lazy-loading the sound synth and burst color tables would save maybe another 0.5–0.8 kB.
- **Tokens:** Bundlephobia shows `@plop-ui/tokens` at 34.8%, but a real consumer build keeps 0.12 kB of it. Bundlers tree-shake it to the one status map Tag uses.
