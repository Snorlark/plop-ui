import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/*
 * Reads the changelog straight from the repo at build time: released versions
 * from each package's CHANGELOG.md (written by `pnpm version-packages`), and
 * the pending notes in .changeset/ as "coming in the next release". Nothing to
 * update by hand. Release dates come from npm when the site builds; without a
 * network the page just leaves them out.
 */

import { PACKAGES, type Pkg } from "./changelog-packages";
export { PACKAGES, type Pkg } from "./changelog-packages";

/** Changesets' section names, in the words the page uses. */
export type Kind = "breaking" | "new" | "fixed";
const KIND: Record<string, Kind> = { "Major Changes": "breaking", "Minor Changes": "new", "Patch Changes": "fixed" };

/** One changelog line: its text, any bullet list under it, and any paragraph after that list. */
export interface Item {
  text: string;
  list: string[];
  after: string[];
}
export interface Note {
  packages: Pkg[];
  bump: string;
  item: Item;
}
export interface Release {
  version: string;
  sections: Array<{ kind: Kind; items: Item[] }>;
  /** Set when the only change is a newer @plop-ui dependency, e.g. "@plop-ui/tokens@0.7.0". */
  bumpedTo: string[];
}

/** The repo root: the nearest folder above the app that holds .changeset/. */
function root() {
  let dir = process.cwd();
  while (!existsSync(path.join(dir, ".changeset")) && path.dirname(dir) !== dir) dir = path.dirname(dir);
  return dir;
}

/** Splits markdown under one bullet into the lead text, a nested list, and paragraphs after it. */
function toItem(lines: string[]): Item {
  const item: Item = { text: "", list: [], after: [] };
  // "lead" until the first blank line or bullet, then bullets and paragraphs in any order.
  let state: "lead" | "list" | "para" | "gap" = "lead";
  const lead: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*] (.+)/)?.[1];
    if (!line) {
      if (state !== "lead" || lead.length) state = "gap";
    } else if (bullet) {
      item.list.push(bullet);
      state = "list";
    } else if (state === "lead") {
      lead.push(line);
    } else if (state === "list" && /^\s{2,}\S/.test(raw)) {
      item.list[item.list.length - 1] += " " + line; // a wrapped bullet
    } else if (state === "para") {
      item.after[item.after.length - 1] += " " + line;
    } else {
      item.after.push(line);
      state = "para";
    }
  }
  item.text = lead.join(" ");
  if (!item.text && item.after.length) item.text = item.after.shift()!;
  return item;
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
      return [{ packages: bumps.map((b) => b[1] as Pkg), bump: bumps[0]?.[2] ?? "patch", item: toItem(m[2]!.trim().split("\n")) }];
    });
}

export function releases(pkg: Pkg): Release[] {
  const file = path.join(root(), "packages", pkg, "CHANGELOG.md");
  if (!existsSync(file)) return [];
  const out: Release[] = [];
  let bullet: string[] | null = null;
  const close = () => {
    const r = out.at(-1);
    const s = r?.sections.at(-1);
    if (bullet && r && s) {
      const deps = bullet[0]!.match(/^Updated dependencies/);
      if (deps) r.bumpedTo.push(...bullet.slice(1).map((l) => l.trim().replace(/^- /, "")).filter((l) => l.startsWith("@plop-ui/")));
      else s.items.push(toItem(bullet));
    }
    bullet = null;
  };
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const version = line.match(/^## (.+)/)?.[1];
    const section = line.match(/^### (.+)/)?.[1];
    const top = line.match(/^- (?:[0-9a-f]{7,}: )?(.+)/)?.[1];
    if (version) {
      close();
      out.push({ version, sections: [], bumpedTo: [] });
    } else if (section) {
      close();
      out.at(-1)?.sections.push({ kind: KIND[section] ?? "fixed", items: [] });
    } else if (top) {
      close();
      bullet = [top];
    } else if (bullet) {
      bullet.push(line.replace(/^ {2}/, ""));
    }
  }
  close();
  for (const r of out) r.sections = r.sections.filter((s) => s.items.length);
  return out;
}

/** Every package's release of one version, newest version first: what shipped together. */
export interface Train {
  version: string;
  /** ISO date of the earliest publish of this version on npm, if known. */
  date?: string;
  kind: Kind;
  packages: Array<{ pkg: Pkg } & Release>;
}

const KIND_RANK: Record<Kind, number> = { breaking: 0, new: 1, fixed: 2 };

export async function releaseTrains(): Promise<Train[]> {
  const dates = await publishDates();
  const byVersion = new Map<string, Train>();
  for (const pkg of PACKAGES) {
    for (const r of releases(pkg)) {
      const t = byVersion.get(r.version) ?? { version: r.version, kind: "fixed" as Kind, packages: [] };
      t.packages.push({ pkg, ...r });
      for (const s of r.sections) if (KIND_RANK[s.kind] < KIND_RANK[t.kind]) t.kind = s.kind;
      const d = dates[pkg]?.[r.version];
      if (d && (!t.date || d < t.date)) t.date = d;
      byVersion.set(r.version, t);
    }
  }
  return [...byVersion.values()].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
}

/** A minor version (0.3) and every release in it (0.3.0 to 0.3.6), newest first. */
export interface Minor {
  minor: string;
  /** Newest release date in the minor. */
  date?: string;
  trains: Train[];
  pkgs: Pkg[];
}

export function minors(trains: Train[]): Minor[] {
  const out: Minor[] = [];
  for (const t of trains) {
    const minor = t.version.split(".").slice(0, 2).join(".");
    let m = out.find((x) => x.minor === minor);
    if (!m) out.push((m = { minor, date: t.date, trains: [], pkgs: [] }));
    m.trains.push(t);
    for (const p of t.packages) if (!m.pkgs.includes(p.pkg)) m.pkgs.push(p.pkg);
  }
  return out;
}

/** One change in a release, listed once even when the same note went out in several packages. */
export interface Entry {
  kind: Kind;
  pkgs: Pkg[];
  item: Item;
}

export function entries(t: Train): Entry[] {
  const out: Entry[] = [];
  for (const p of t.packages) {
    for (const s of p.sections) {
      for (const item of s.items) {
        // A minor or patch note can still call itself breaking (before 1.0, minors may break).
        const kind: Kind = /\*\*Breaking:?\*\*/i.test(item.text) ? "breaking" : s.kind;
        const same = out.find((e) => e.item.text === item.text);
        if (same) same.pkgs.push(p.pkg);
        else out.push({ kind, pkgs: [p.pkg], item });
      }
    }
  }
  return out.sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind]);
}

/** A release's top change as one plain line (its first sentence, cut at about 110 characters): the summary on a folded card. */
export function headline(t: Train): string {
  const first = entries(t)[0]?.item.text ?? "";
  const plain = first
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^(New|Fix):\s*/i, "");
  const sentence = (plain.match(/^(.+?[.!?])(\s|$)/)?.[1] ?? plain).replace(/[:.]$/, "");
  return sentence.length > 110 ? `${sentence.slice(0, 107).replace(/[\s,;:(]+\S*$/, "")}…` : sentence;
}

/** Publish times per package and version, from the npm registry. Empty when offline. */
async function publishDates(): Promise<Partial<Record<Pkg, Record<string, string>>>> {
  const out: Partial<Record<Pkg, Record<string, string>>> = {};
  await Promise.all(
    PACKAGES.map(async (pkg) => {
      try {
        const res = await fetch(`https://registry.npmjs.org/@plop-ui/${pkg}`, { signal: AbortSignal.timeout(5000), cache: "force-cache" });
        if (res.ok) out[pkg] = ((await res.json()) as { time?: Record<string, string> }).time ?? {};
      } catch {
        // Offline build: no dates.
      }
    }),
  );
  return out;
}
