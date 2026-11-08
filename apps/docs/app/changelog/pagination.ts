import type { Pkg } from "../_site/changelog";

export const RELEASES_PER_PAGE = 4;
export type PackageFilter = "all" | Pkg;

/** Links, the package form and legacy release hashes share the same URL format. */
export function changelogHref(page: number, pkg: PackageFilter = "all", hash = "releases") {
  const query = new URLSearchParams();
  if (pkg !== "all") query.set("pkg", pkg);
  if (page > 1) query.set("page", String(page));
  return `/changelog${query.size ? `?${query}` : ""}#${hash}`;
}
