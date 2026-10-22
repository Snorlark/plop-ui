import type { MetadataRoute } from "next";
import { ALL_LINKS } from "./_site/nav";
import { SITE_URL } from "./_site/site";

/** Every page in the docs nav, plus the home and privacy pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...ALL_LINKS.map((l) => l.href), "/privacy"];
  return [...new Set(paths)].map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : path.startsWith("/docs/getting-started") ? 0.9 : 0.7,
  }));
}
