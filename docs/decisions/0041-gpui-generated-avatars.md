# Avatars generate a face from the name

The React kit hashes a name into a doodle face: six hair shapes, three eye sets, three mouths, and optional glasses or blush. The port keeps that behaviour with `plopui_core::seed(name)` instead of an image asset, so the same name draws the same face on every frame and platform.

`PlopAvatar::new(name)` paints the face. `.initials()` keeps the older team-mark form, which `PlopUnitCard` uses for its "UN" badge. `.status()` adds the online/busy/offline dot and folds the words into the accessible name (`"Rosa Vega, online"`), so the dot is never the only signal. The headless test renders a face and checks that both the ink outline and the leaf status dot reach the image.

Not ported: `AvatarSymbol`/`faceHref`, which exist to reuse one SVG `<symbol>` across a crowd, and the photo `src`. Both are browser asset-loading features; a GPUI host that wants photos can draw its own image inside the same disc.
