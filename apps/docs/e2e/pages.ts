import { ALL_LINKS } from "../app/_site/nav";

/** Every page on the site (the docs nav already includes /playground and /kit), plus the changelog and privacy pages. */
export const PAGES = ["/", ...ALL_LINKS.map((l) => l.href), "/changelog", "/privacy"];
export const SURFACES = ["poster", "mat", "notebook", "kraft", "riso"] as const;
export const THEMES = ["light", "dark"] as const;
