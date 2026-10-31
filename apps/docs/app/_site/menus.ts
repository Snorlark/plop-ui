import { GITHUB } from "./nav";

/*
 * The header's mega menus: four choices up top (Hick's law), links grouped
 * underneath, and one featured card per menu. Every link points at a page
 * that exists.
 */

export type MenuId = "components" | "guides" | "playground" | "community";
export type FeatureArt = "palette" | "wobble" | "holo" | "crew";

export interface Menu {
  id: MenuId;
  label: string;
  /** Where the trigger itself goes when pressed. Without one it only opens the menu. */
  href?: string;
  cols: Array<{ title: string; big?: boolean; links: Array<[label: string, href: string]> }>;
  feature: { tape: string; tone: "bubblegum" | "periwinkle" | "mustard" | "mint"; title: string; text: string; href: string; art: FeatureArt };
}

const NPM = "https://www.npmjs.com/package/@plop-ui";

export const MENUS: Menu[] = [
  {
    id: "components",
    label: "Components",
    href: "/docs/components/button",
    cols: [
      {
        title: "Explore components",
        big: true,
        links: [
          ["Button", "/docs/components/button"],
          ["Search & palette", "/docs/components/search"],
          ["Tags & badges", "/docs/components/tag"],
          ["Avatar", "/docs/components/avatar"],
          ["Status timeline", "/docs/components/status-timeline"],
        ],
      },
      { title: "Inputs", links: [["Switch", "/docs/components/switch"], ["Checkbox", "/docs/components/checkbox"], ["Radio group", "/docs/components/radio"], ["Text field", "/docs/components/text-field"]] },
      { title: "Feedback", links: [["Toast", "/docs/components/toast"], ["Callout", "/docs/components/callout"], ["Loading", "/docs/components/loading"], ["Buddy", "/docs/components/buddy"]] },
    ],
    feature: { tape: "New", tone: "bubblegum", title: "Command palette", text: "⌘K search with grouped results, recents and the / shortcut.", href: "/docs/components/search", art: "palette" },
  },
  {
    id: "guides",
    label: "Guides",
    href: "/docs/getting-started",
    cols: [
      { title: "Get going", big: true, links: [["What is PlopUI?", "/docs/what-is-plopui"], ["Installation", "/docs/getting-started"], ["Using with Next.js", "/docs/nextjs"], ["Surfaces & themes", "/docs/surfaces"], ["Accessibility", "/docs/accessibility"]] },
      { title: "Design", links: [["Tokens & contrast", "/docs/tokens"], ["Hooks & onColor", "/docs/hooks"], ["Sheet & Heading", "/docs/components/sheet-heading"]] },
      { title: "Reference", links: [["PlopProvider", "/docs/components/provider"], ["Changelog", "/changelog"]] },
    ],
    feature: { tape: "Guide", tone: "periwinkle", title: "Seeded wobble", text: "Why every sticker draws the same on the server and in the browser.", href: "/docs/nextjs", art: "wobble" },
  },
  {
    id: "playground",
    label: "Playground",
    href: "/playground",
    cols: [
      { title: "Play", big: true, links: [["Sticker board", "/playground?tool=board"], ["Lettering studio", "/playground?tool=lettering"], ["Tweak the props", "/playground?tool=tweak"]] },
    ],
    feature: { tape: "Ride-along", tone: "mustard", title: "Holo Pip", text: "Stamp all five Ride-along stops to unlock it.", href: "/playground", art: "holo" },
  },
  {
    id: "community",
    label: "Community",
    cols: [
      { title: "Join in", big: true, links: [["GitHub", GITHUB], ["Changelog", "/changelog"], ["Contributing", `${GITHUB}/blob/main/CONTRIBUTING.md`]] },
      { title: "Packages", links: [["@plop-ui/react", `${NPM}/react`], ["@plop-ui/tokens", `${NPM}/tokens`], ["@plop-ui/fonts", `${NPM}/fonts`]] },
    ],
    feature: { tape: "The crew", tone: "mint", title: "Say hi", text: "Pip, Bix, Snooze and friends keep the press running.", href: "/docs/components/buddy", art: "crew" },
  },
];

/** Which menu the current page belongs to, so its trigger stays highlighted. */
export function menuFor(path: string): MenuId | undefined {
  if (path.startsWith("/docs/components")) return "components";
  if (path.startsWith("/docs")) return "guides";
  if (path.startsWith("/playground")) return "playground";
  if (path === "/changelog") return "community";
  return undefined;
}
