# 0017: Footer is the sticker factory

The docs footer follows the redesigned "sticker factory" footer: the big wordmark, a short description, three link columns, and a hand-drawn factory scene, with stations from left to right: drawing desk, press, die-cut, conveyor into the pack.

- The scene is one decorative SVG animated with SMIL, so it runs without JavaScript. It is a string in `footerScene.ts`, and its colors and fonts sit in `style` attributes, because SVG presentation attributes can't read the token CSS variables.
- Only the lever and pause buttons are client code (`FooterFactory`). They are kit `IconButton`s, and the scene reaches them as `children`, so the SVG stays out of the client bundle.
- The pause button is required by WCAG 2.2.2, since the scene moves for more than five seconds. With reduced motion, the scene starts paused.
- Arriving at the footer is scroll-driven CSS:
  - the logo slaps on;
  - the links rise;
  - the stations pop up like a pop-up book;
  - the pack drops in on its hook;
  - the scene lags the page (parallax).
- Every range finishes by the time the footer is fully in view, because the footer ends the page.
- The link text is descriptive ("Install PlopUI", "npm package") for search engines and screen-reader link lists. The schema.org JSON-LD lives in the root layout.
