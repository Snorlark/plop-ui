export interface NavLink {
  href: string;
  label: string;
  /** Extra words the search box matches on. */
  keywords?: string;
  /** Sections of the page, listed under it in the sidebar. */
  sub?: Array<{ href: string; label: string }>;
}

export interface NavSection {
  group: string;
  links: NavLink[];
}

const c = (slug: string, label: string, keywords?: string): NavLink => ({ href: `/docs/components/${slug}`, label, keywords });

/** The docs sidebar, in reading order. Previous/next links follow this order. */
export const DOC_NAV: NavSection[] = [
  {
    group: "Getting started",
    links: [
      { href: "/docs/what-is-plopui", label: "What is PlopUI?", keywords: "about overview plop ui plop-ui compare alternatives hand-drawn rough.js free license" },
      { href: "/docs/getting-started", label: "Installation", keywords: "install npm pnpm setup provider" },
      { href: "/docs/nextjs", label: "Using with Next.js", keywords: "server components ssr hydration next/font cookie" },
      { href: "/docs/surfaces", label: "Surfaces", keywords: "poster mat notebook kraft riso paper theme dark" },
      { href: "/docs/tokens", label: "Tokens & contrast", keywords: "colors contrast roles type motion css variables" },
      { href: "/docs/accessibility", label: "Accessibility", keywords: "wcag keyboard reduced motion screen reader" },
    ],
  },
  { group: "Actions", links: [c("button", "Button", "buddy loading link sticker"), c("icon-button", "IconButton", "icon round"), c("menu", "Menu", "dropdown menu actions more kebab"), c("tooltip", "Tooltip", "hint bubble")] },
  { group: "Inputs", links: [c("switch", "Switch", "toggle"), c("checkbox", "Checkbox", "tick indeterminate"), c("radio", "RadioGroup", "radio option"), c("text-field", "TextField", "input textarea form error"), c("select", "Select & MultiSelect", "dropdown select listbox picker people multi tags combobox"), c("search", "SearchField & CommandPalette", "search combobox command palette cmdk find")] },
  { group: "Display", links: [c("tag", "Tag", "status washi tape filter chip"), c("avatar", "Avatar", "face person"), c("cards", "Cards", "ticket unit sticky note"), c("tabs", "Tabs", "tablist panel"), c("badges", "Count & StatusDot", "badge dot count"), c("word-sticker", "WordSticker & Doodle", "lettering text font sticker star heart sparkle")] },
  { group: "Feedback", links: [c("status-timeline", "StatusTimeline", "steps progress sketch"), { ...c("loading", "Loading", "spinner progress skeleton loader busy wait dots slow cancel ring indeterminate upload placeholder shimmer"), sub: [{ href: "/docs/components/loading#when", label: "Which one?" }, { href: "/docs/components/loading#spinners", label: "Spinners" }, { href: "/docs/components/loading#progress", label: "Progress" }, { href: "/docs/components/loading#skeletons", label: "Skeletons" }, { href: "/docs/components/loading#built-in", label: "Built in" }, { href: "/docs/components/loading#in-context", label: "In context" }] }, c("callout", "Callout", "alert notice warning"), c("toast", "Toast", "notification snackbar"), c("buddy", "Buddy", "character mascot mood success error stale congrats preview loading")] },
  {
    group: "Foundations",
    links: [c("provider", "PlopProvider", "surface theme haptics sound"), c("sheet-heading", "Sheet & Heading", "paper panel lettering"), { href: "/docs/hooks", label: "Hooks & onColor", keywords: "useHaptics useBoil onColor seed contrast" }],
  },
  {
    group: "Tools",
    links: [
      { href: "/playground", label: "Playground", keywords: "try props live editor code" },
    ],
  },
];

export const ALL_LINKS = DOC_NAV.flatMap((s) => s.links);

/** Previous and next pages around `href` in reading order (Tools excluded). */
export function neighbors(href: string): { prev?: NavLink; next?: NavLink } {
  const order = DOC_NAV.filter((s) => s.group !== "Tools").flatMap((s) => s.links);
  const i = order.findIndex((l) => l.href === href);
  return { prev: i > 0 ? order[i - 1] : undefined, next: i >= 0 ? order[i + 1] : undefined };
}

export const GITHUB = "https://github.com/Snorlark/plop-ui";
