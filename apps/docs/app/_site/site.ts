/**
 * Where the docs site lives, for absolute URLs in metadata, the sitemap,
 * robots.txt and llms.txt. Set NEXT_PUBLIC_SITE_URL once you have a custom
 * domain; on Vercel it falls back to the project's production URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:4321")
).replace(/\/$/, "");

export const SITE_DESCRIPTION =
  "PlopUI is a hand-drawn React UI component library, imperfect on purpose: wobbly sticker buttons, washi-tape tags and a hand-lettered font, in colors picked by instinct. It breaks the visual rules, never the accessibility ones: WCAG AA and server-rendered with Next.js.";
