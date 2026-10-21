export interface NavSection {
  group: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}

export const NAV: ReadonlyArray<NavSection> = [
  { group: "Start", links: [
    { href: "/docs/getting-started", label: "Getting started" },
    { href: "/docs/tokens", label: "Tokens" },
    { href: "/docs/surfaces", label: "Surfaces" },
    { href: "/docs/nextjs", label: "Using with Next.js" },
  ] },
  { group: "Actions", links: [
    { href: "/docs/components/button", label: "Button" },
    { href: "/docs/components/icon-button", label: "IconButton" },
    { href: "/docs/components/tooltip", label: "Tooltip" },
  ] },
  { group: "Inputs", links: [
    { href: "/docs/components/switch", label: "Switch" },
    { href: "/docs/components/checkbox", label: "Checkbox" },
    { href: "/docs/components/radio", label: "RadioGroup" },
    { href: "/docs/components/text-field", label: "TextField" },
  ] },
  { group: "Display", links: [
    { href: "/docs/components/tag", label: "Tag" },
    { href: "/docs/components/avatar", label: "Avatar" },
    { href: "/docs/components/cards", label: "Cards" },
    { href: "/docs/components/tabs", label: "Tabs" },
    { href: "/docs/components/badges", label: "Count & StatusDot" },
  ] },
  { group: "Feedback", links: [
    { href: "/docs/components/status-timeline", label: "StatusTimeline" },
    { href: "/docs/components/progress", label: "Progress" },
    { href: "/docs/components/callout", label: "Callout" },
    { href: "/docs/components/toast", label: "Toast" },
  ] },
  { group: "Foundations", links: [
    { href: "/docs/components/provider", label: "PlopProvider" },
    { href: "/docs/components/sheet-heading", label: "Sheet & Heading" },
    { href: "/docs/hooks", label: "Hooks & onColor" },
    { href: "/docs/accessibility", label: "Accessibility" },
  ] },
];
