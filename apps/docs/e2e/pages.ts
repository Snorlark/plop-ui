import { NAV } from "../app/_components/nav";

export const PAGES = ["/", ...NAV.flatMap((s) => s.links.map((l) => l.href))];
export const SURFACES = ["poster", "mat", "notebook", "kraft", "riso"] as const;
