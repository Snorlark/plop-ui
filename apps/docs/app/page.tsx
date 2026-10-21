import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { SurfaceSwitcher } from "./_components/SurfaceSwitcher";
import { KitShowcase } from "./_kit/KitShowcase";
import { PosterArt } from "./_kit/PosterArt";
import { parseSurface, parseTheme, SURFACE_COOKIE, THEME_COOKIE } from "./surface";

const SECTIONS: Array<[string, string] | string> = [
  ["tokens", "Tokens"],
  "Actions",
  ["button", "Button"],
  ["tooltip", "Tooltip"],
  "Inputs",
  ["switch", "Switch"],
  ["checkbox", "Checkbox & radio"],
  ["field", "Text field"],
  "Display",
  ["tags", "Tags & badges"],
  ["avatar", "Avatar"],
  ["cards", "Cards"],
  ["tabs", "Tabs"],
  "Feedback",
  ["progress", "Progress"],
  ["timeline", "Status timeline"],
  ["callout", "Callout"],
  ["toast", "Toast"],
];

/** The kit, as one page: the v0.6 prototype rebuilt from @plop-ui/react. */
export default async function Home() {
  const jar = await cookies();
  return (
    <div className="shell">
      <aside className="side" aria-label="Components">
        <Link className="brand" href="#top">
          <Image src="/plop-logo.png" alt="Plop UI" width={992} height={382} priority />
        </Link>
        <nav>
          <ul className="nav">
            {SECTIONS.map((s) =>
              typeof s === "string" ? (
                <li className="nav__group" key={s}>
                  {s}
                </li>
              ) : (
                <li key={s[0]}>
                  <a href={`#${s[0]}`}>{s[1]}</a>
                </li>
              ),
            )}
            <li className="nav__group">Docs</li>
            <li>
              <Link href="/docs/getting-started">Getting started</Link>
            </li>
            <li>
              <Link href="/docs/nextjs">With Next.js</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="content" id="top">
        <header className="kit-hero">
          <div>
            <h1 className="vh">Plop UI</h1>
            <Image className="kit-hero__logo" src="/plop-logo.png" alt="" width={992} height={382} priority />
            <span className="version">v0.1</span>
            <p className="lede">A sticker-pack UI kit, drawn in one cobalt marker on cream paper. Every press squishes, springs back, and buzzes on your phone.</p>
            <SurfaceSwitcher surface={parseSurface(jar.get(SURFACE_COOKIE)?.value)} theme={parseTheme(jar.get(THEME_COOKIE)?.value)} />
          </div>
          <PosterArt />
        </header>

        <nav className="mnav" aria-label="Components (compact)" style={{ marginTop: 24 }}>
          {SECTIONS.filter((s): s is [string, string] => typeof s !== "string").map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <KitShowcase />
      </main>
    </div>
  );
}
