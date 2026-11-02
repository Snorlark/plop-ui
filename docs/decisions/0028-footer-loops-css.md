# 0028: Footer loops are CSS keyframes, inside the SVG

The footer's sticker factory ran 33 SMIL `<animate>` loops. While on screen they kept a throttled phone's main thread busy (#85). They are now CSS keyframes in a `<style>` that ships with the scene (`footerScene.ts`), on the same elements, with the same timings, keyTimes and begin offsets. Linear steps match SMIL's default. The conveyor stickers' motion path is sampled into translate keyframes.

- **Measured** (headless Chromium, 4× CPU throttle, 3 s with the scene on screen): style recalcs 1,925 → 176, main thread busy 21.9% → 15.0%. Pixel diff against the SMIL scene at eight moments: under 0.33% of pixels, all anti-aliased edges.
- **Layouts don't drop.** Chromium lays out the whole SVG every frame while any shape inside it has a changing CSS `transform` (about 60 a second, both before and after). Opacity and `stroke-dashoffset` don't trigger layout. `will-change` doesn't help.
- **Not done:** getting to zero layouts would mean lifting the 18 moving parts out of the SVG into their own composited layers. That would split each station, change paint order for three of the parts (two gear pieces and the hanging sign), and need the pop-up entrance re-synced. Not worth it for a decorative footer.
- **Pausing** is CSS: FooterFactory sets `data-paused` on the scene, and `footer.module.css` pauses every `.fx`. Unlike `pauseAnimations()`, this also holds for a scene that arrives after the button was pressed. With reduced motion, `--fx-shift: -1.4s` rests the paused scene on the same frame `setCurrentTime(1.4)` gave.
- **Cache:** `/scenes/factory.svg` is served `immutable`, so the URL now carries a version (`FACTORY_SCENE_URL`). Bump it whenever the scene changes.
- The 404 scene (`/scenes/not-found.svg`) still uses SMIL. It only shows on a 404 page.
