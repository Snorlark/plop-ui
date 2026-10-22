import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/*
 * Reads the changelog straight from the repo at build time: released versions
 * from each package's CHANGELOG.md (written by `pnpm version-packages`), and
 * the pending notes in .changeset/ as "coming in the next release". Nothing to
 * update by hand.
 */

export const PACKAGES = ["react", "tokens", "fonts"] as const;
export type Pkg = (typeof PACKAGES)[number];

export interface Note {
  packages: Pkg[];
  bump: string;
  text: string;
}
export interface Release {
  version: string;
  sections: Array<{ title: string; items: string[] }>;
}

/** The repo root: the nearest folder above the app that holds .changeset/. */
function root() {
  let dir = process.cwd();
  while (!existsSync(path.join(dir, ".changeset")) && path.dirname(dir) !== dir) dir = path.dirname(dir);
  return dir;
}

export function pendingNotes(): Note[] {
  const dir = path.join(root(), ".changeset");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort()
    .flatMap((f) => {
      const m = readFileSync(path.join(dir, f), "utf8").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) return [];
      const bumps = [...m[1]!.matchAll(/"@plop-ui\/(\w+)":\s*(\w+)/g)];
      return [{ packages: bumps.map((b) => b[1] as Pkg), bump: bumps[0]?.[2] ?? "patch", text: m[2]!.trim() }];
    });
}

export function releases(pkg: Pkg): Release[] {
  const file = path.join(root(), "packages", pkg, "CHANGELOG.md");
  if (!existsSync(file)) return [];
  const out: Release[] = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const version = line.match(/^## (.+)/)?.[1];
    const section = line.match(/^### (.+)/)?.[1];
    const item = line.match(/^- (?:[0-9a-f]{7,}: )?(.+)/)?.[1];
    if (version) out.push({ version, sections: [] });
    else if (section) out.at(-1)?.sections.push({ title: section, items: [] });
    else if (item) out.at(-1)?.sections.at(-1)?.items.push(item);
    else if (/^\s{2,}\S/.test(line)) {
      const items = out.at(-1)?.sections.at(-1)?.items;
      if (items?.length) items[items.length - 1] += " " + line.trim();
    }
  }
  return out;
}
