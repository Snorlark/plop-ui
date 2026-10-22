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
  "PlopUI is a hand-drawn React UI component library for real-time ops apps: dispatch consoles, field service and ticketing. Accessible to WCAG AA and server-rendered with Next.js.";
