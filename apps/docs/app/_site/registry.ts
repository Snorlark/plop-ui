import type props from "../_generated/props.json";

type PropsName = keyof typeof props;

export interface ComponentDoc {
  title: string;
  group: string;
  /** "Client component", "Server Component", … shown as tape badges. */
  badges: string[];
  lede: string;
  code: string;
  tables: Array<{ of: PropsName; inheritedFrom?: string }>;
  do: string;
  dont: string;
  a11y: string[];
}

const AA = "WCAG AA";
const V01 = "Since v0.1";

export const COMPONENT_DOCS: Record<string, ComponentDoc> = {
  button: {
    title: "Button",
    group: "Actions",
    badges: ["Client component", AA, V01],
    lede: "The hero sticker. Peels on hover, squishes on press, springs back with an ink burst. Add a buddy for the one action that matters most on a screen.",
    code: `import { Button, ButtonLink } from "@plop-ui/react";

<Button variant="ink" size="lg" buddy>Send report</Button>

<Button>Save changes</Button>
<Button variant="periwinkle">Add note</Button>
<Button variant="mint">Mark resolved</Button>
<Button variant="tomato" loading={cancelling}>Cancel dispatch</Button>
<Button variant="plain">Skip for now</Button>

// Navigates instead: same sticker, rendered as a link
<ButtonLink href="/docs" as={Link}>Get started</ButtonLink>`,
    tables: [
      { of: "Button", inheritedFrom: "<button>" },
      { of: "ButtonLink", inheritedFrom: "<a>" },
    ],
    do: "Give the buddy to one action per screen, the one people came to do.",
    dont: "Line up several tomato buttons. Destructive stands out because it's rare.",
    a11y: [
      "A native button element, so it works with any keyboard and screen reader.",
      "Space and Enter both show the press, and focus draws a dashed cut-here line.",
      "Text on every color passes WCAG AA through its contrast role.",
      "Reduced motion turns off the peel, boil and ink burst; the state change still shows.",
    ],
  },
  "icon-button": {
    title: "IconButton",
    group: "Actions",
    badges: ["Client component", AA, V01],
    lede: "A round sticker with just an icon. The label is required, so it can never ship without a name.",
    code: `import { IconButton, PhoneIcon, PlusIcon } from "@plop-ui/react";

<IconButton icon={<PlusIcon />} label="New incident" variant="mustard" />
<IconButton icon={<PhoneIcon />} label="Start SOS call" variant="tomato" />`,
    tables: [{ of: "IconButton", inheritedFrom: "<button>" }],
    do: "Use it for actions everyone already recognizes: call, close, add.",
    dont: "Hide an unusual action behind an icon. If it needs explaining, use a Button.",
    a11y: ["label becomes aria-label; leaving it out is a TypeScript error.", "The icon is hidden from screen readers.", "Same keyboard, focus and press behavior as Button."],
  },
  tooltip: {
    title: "Tooltip",
    group: "Actions",
    badges: ["Client component", AA, V01],
    lede: "A speech bubble that pops out of whatever it explains. Opens on hover and keyboard focus.",
    code: `import { Tooltip, IconButton, InfoIcon } from "@plop-ui/react";

<Tooltip content="Priority sets who gets paged first.">
  <IconButton icon={<InfoIcon />} label="What does priority do?" />
</Tooltip>`,
    tables: [{ of: "Tooltip" }],
    do: "Explain something short that people can do without: a sentence, at most.",
    dont: "Put the only copy of important information in a tooltip. Touch screens can't hover.",
    a11y: ["role=\"tooltip\", linked with aria-describedby.", "Opens on hover and keyboard focus; Escape closes it without moving focus.", "The trigger must be focusable."],
  },
  switch: {
    title: "Switch",
    group: "Inputs",
    badges: ["Client component", AA, V01],
    lede: "The knob is a little face. It sleeps when off and wakes up when you flip it on.",
    code: `import { Switch } from "@plop-ui/react";

<Switch checked={sharing} onCheckedChange={setSharing} color="mint">
  Share live location
</Switch>`,
    tables: [{ of: "Switch" }],
    do: "Use it for settings that take effect right away.",
    dont: "Use it inside a form that needs a Save button. That's a Checkbox.",
    a11y: ["Built on the Radix Switch: role=\"switch\" with aria-checked.", "Clicking the label toggles it; Space and Enter work from the keyboard.", "On and off also show in the knob's position and face, not only color."],
  },
  checkbox: {
    title: "Checkbox",
    group: "Inputs",
    badges: ["Client component", AA, V01],
    lede: "The tick is drawn in one stroke and overshoots the box, like a pen would.",
    code: `import { Checkbox } from "@plop-ui/react";

<Checkbox checked={all} indeterminate={some} onCheckedChange={toggleAll}>Everyone</Checkbox>
<Checkbox tickColor="var(--plop-leaf)">Caller, by SMS</Checkbox>`,
    tables: [{ of: "Checkbox", inheritedFrom: "<input>" }],
    do: "Group related checkboxes in a fieldset with a legend.",
    dont: "Use a single checkbox for an on/off setting that applies immediately. That's a Switch.",
    a11y: ["A real <input type=\"checkbox\">: forms, keyboard and screen readers just work.", "indeterminate sets the input's own state and aria-checked=\"mixed\".", "Focus draws a dashed outline around the box."],
  },
  radio: {
    title: "RadioGroup",
    group: "Inputs",
    badges: ["Client component", AA, V01],
    lede: "Radios fill with an ink blob. A fieldset of real radio inputs.",
    code: `import { RadioGroup, Radio } from "@plop-ui/react";

<RadioGroup legend="Priority" defaultValue="medium">
  <Radio value="low">Low</Radio>
  <Radio value="medium" dotColor="var(--plop-mustard)">Medium</Radio>
  <Radio value="high" dotColor="var(--plop-tomato)">High, page everyone</Radio>
</RadioGroup>`,
    tables: [{ of: "RadioGroup" }, { of: "Radio" }],
    do: "Use it for 2 to 5 choices people should see all at once.",
    dont: "Leave a group with nothing selected when one answer is the sensible default.",
    a11y: ["A <fieldset> and <legend> holding native radios.", "Arrow keys move between options, as with any radio group."],
  },
  "text-field": {
    title: "TextField",
    group: "Inputs",
    badges: ["Server or client", AA, V01],
    lede: "Focus swipes a highlighter across the label and makes the outline boil. Errors switch to tomato ink and say how to fix it.",
    code: `import { TextField, TextArea } from "@plop-ui/react";

<TextField label="Caller name" hint="Optional. Anonymous reports are fine." />
<TextField label="Location" error="Add a street, barangay, or landmark so responders can find it." />
<TextArea label="What happened?" placeholder="Write it like you'd say it on the phone." />`,
    tables: [
      { of: "TextField", inheritedFrom: "<input>" },
      { of: "TextArea", inheritedFrom: "<textarea>" },
    ],
    do: "Write errors that say how to fix the problem, not just that there is one.",
    dont: "Use the placeholder as the label. It disappears as soon as someone types.",
    a11y: ["A real <label> for every field; the label prop is required.", "Hints and errors are linked with aria-describedby; errors set aria-invalid.", "Errors carry an icon and words, never color alone."],
  },
  tag: {
    title: "Tag",
    group: "Display",
    badges: ["Server Component", AA, V01],
    lede: "Status labels are strips of washi tape. Removable tags peel off when you dismiss them.",
    code: `import { Tag } from "@plop-ui/react";

<Tag status="critical">Critical</Tag>
<Tag tone="mustard" pattern="dots">En route</Tag>
<Tag onRemove={() => clear("brgy-3")}>Barangay 3</Tag>`,
    tables: [{ of: "Tag" }],
    do: "Write the status in the label. The color only repeats it.",
    dont: "Use tags as buttons. Removable tags have a separate × button for that.",
    a11y: ["Status is always in the text; the color only repeats it.", "The remove button is named \"Remove <label>\".", "After removing, focus moves to the next tag (or the previous one)."],
  },
  avatar: {
    title: "Avatar",
    group: "Display",
    badges: ["Server Component", AA, V01],
    lede: "Doodle faces generated from a name, so the same person always gets the same face. Real photos can drop in too.",
    code: `import { Avatar, AvatarStack } from "@plop-ui/react";

<Avatar name="Jun Reyes" status="online" />
<Avatar name="Ana Cruz" status="busy" statusLabel="on a call" />
<AvatarStack names={crew} max={3} />`,
    tables: [{ of: "Avatar" }, { of: "AvatarStack" }],
    do: "Pass the person's real name, so the face and the accessible name match.",
    dont: "Rely on the status dot alone. Its meaning is part of the name for a reason.",
    a11y: ["role=\"img\" named after the person; the status joins the name (\"Jun Reyes, online\").", "Stacks are named \"Rosa, Jun, Ana and 4 more\"."],
  },
  cards: {
    title: "Cards",
    group: "Display",
    badges: ["Server Component", AA, V01],
    lede: "Three paper objects for three jobs: a ticket stub for queue items, a taped unit card for people, a sticky note for quick context.",
    code: `import { TicketCard, UnitCard, UnitCardRow, StickyNote, Eta, Tag, Avatar } from "@plop-ui/react";

<TicketCard meta="Ticket #1042, 9:14 AM" title="Printer jams" stub="Open">…</TicketCard>
<UnitCard name="Mobile 2" subtitle="PO2 Jun Reyes" avatar={<Avatar name="Jun Reyes" />}>
  <UnitCardRow><Tag status="en-route">En route</Tag><Eta value={6} unit="min away" /></UnitCardRow>
</UnitCard>
<StickyNote footer="Added by Ana">Use the side entrance.</StickyNote>`,
    tables: [
      { of: "TicketCard", inheritedFrom: "<article>" },
      { of: "UnitCard", inheritedFrom: "<article>" },
      { of: "StickyNote", inheritedFrom: "<aside>" },
    ],
    do: "Keep one job per card: a queue item, a person, or a note.",
    dont: "Nest cards inside cards. Paper on paper on paper gets hard to read.",
    a11y: ["Tickets and unit cards are <article>s with real headings (level 3 by default).", "Sticky notes are <aside>s."],
  },
  tabs: {
    title: "Tabs",
    group: "Display",
    badges: ["Client component", AA, V01],
    lede: "Index-card dividers. The active one comes forward and joins the page. Arrow keys move between them.",
    code: `import { Tabs, TabList, Tab, TabPanel, Count } from "@plop-ui/react";

<Tabs defaultValue="active">
  <TabList label="Incident queue">
    <Tab value="active" badge={<Count label="3 active" size="sm">3</Count>}>Active</Tab>
    <Tab value="resolved">Resolved</Tab>
  </TabList>
  <TabPanel value="active">…</TabPanel>
  <TabPanel value="resolved">…</TabPanel>
</Tabs>`,
    tables: [{ of: "Tabs" }, { of: "TabList" }, { of: "Tab" }],
    do: "Use tabs to switch between views of the same thing.",
    dont: "Use tabs as steps in a process. People can't tell they have to visit each one.",
    a11y: ["The WAI-ARIA tabs pattern: tablist, tabs with aria-selected and aria-controls, tabpanels.", "Roving tabindex; Arrow keys, Home and End move and select."],
  },
  badges: {
    title: "Count & StatusDot",
    group: "Display",
    badges: ["Server Component", AA, V01],
    lede: "Round count stickers and little status dots.",
    code: `import { Count, StatusDot } from "@plop-ui/react";

<Count label="3 unread">3</Count>
<StatusDot tone="busy">On a call</StatusDot>`,
    tables: [{ of: "Count" }, { of: "StatusDot" }],
    do: "Say what the number counts in the label: \"3 unread\".",
    dont: "Show a dot without its words.",
    a11y: ["A Count needs a label; a bare number says nothing.", "A StatusDot always has its words next to it."],
  },
  "status-timeline": {
    title: "StatusTimeline",
    group: "Feedback",
    badges: ["Server Component", AA, V01],
    lede: "Where an incident is right now. Done steps get a cobalt tick, the current step boils, the rest are pencilled in.",
    code: `import { StatusTimeline } from "@plop-ui/react";

<StatusTimeline
  steps={["Reported", "Dispatched", "En route", "Resolved"]}
  times={["9:02 AM", "9:04 AM", "6 min away", "Waiting"]}
  current={2}
/>`,
    tables: [{ of: "StatusTimeline" }],
    do: "Keep it to 3 to 6 steps people would say out loud.",
    dont: "Use it for a form wizard. It shows where something is, not where you are.",
    a11y: ["An <ol> with aria-current=\"step\" on the current step.", "Each step's status is written in text (\"done\", \"current step\", \"not started\").", "A Server Component: no client JavaScript."],
  },
  progress: {
    title: "Progress",
    group: "Feedback",
    badges: ["Server Component", AA, V01],
    lede: "Filled with crayon hatching instead of a flat bar. The leading edge is a single heavier stroke.",
    code: `import { Progress } from "@plop-ui/react";

<Progress label="Syncing offline reports" value={4} max={10} valueText="4 of 10" />
<Progress label="Response time target" value={92} valueText="92% used" tone="tomato" solid />`,
    tables: [{ of: "Progress" }],
    do: "Show the real count next to the bar: \"4 of 10\".",
    dont: "Use a progress bar for things that aren't going anywhere. That's a meter.",
    a11y: ["role=\"progressbar\" with value, min, max and a readable aria-valuetext.", "Labeled by its visible label."],
  },
  callout: {
    title: "Callout",
    group: "Feedback",
    badges: ["Server Component", AA, V01],
    lede: "A strip torn off a pad. Use it for things people need to know before they act, not for decoration.",
    code: `import { Callout, Button } from "@plop-ui/react";

<Callout tone="warn" title="Location is approximate">
  Confirm a landmark before dispatching.
</Callout>
<Callout tone="error" title="Couldn't reach the station" action={<Button size="sm" variant="plain">Try again</Button>}>
  Your report is saved on this phone.
</Callout>`,
    tables: [{ of: "Callout" }],
    do: "Put the callout right before the action it's about.",
    dont: "Stack callouts at the top of a page. People stop reading them.",
    a11y: ["Every tone has an icon and a title; color only repeats it.", "Pass role=\"alert\" for errors that need attention right away."],
  },
  toast: {
    title: "Toast",
    group: "Feedback",
    badges: ["Client component", AA, V01],
    lede: "Slaps onto the bottom of the screen like a stamp, then lifts off after a few seconds.",
    code: `import { toast } from "@plop-ui/react";

toast.success("Report sent");
toast.error("Couldn't send. Saved for later.");
toast("Mobile 2 is 6 min away", { duration: 6000 });`,
    tables: [{ of: "Toast" }],
    do: "Confirm something that already happened: \"Report sent\".",
    dont: "Ask a question or hide a button in a toast. It disappears.",
    a11y: ["Shown in a polite live region (role=\"status\") rendered by PlopProvider.", "Stays 4 seconds by default; never the only place an important message appears."],
  },
  provider: {
    title: "PlopProvider",
    group: "Foundations",
    badges: ["Client component", V01],
    lede: "Sets the surface, theme and feedback settings for everything inside it, and renders the filters, ink-burst layer and toast zone.",
    code: `import "@plop-ui/react/styles.css";
import { PlopProvider } from "@plop-ui/react";

<PlopProvider surface="poster" theme="system" haptics sound={false} reducedMotion="system">
  {children}
</PlopProvider>`,
    tables: [{ of: "PlopProvider", inheritedFrom: "<div>" }],
    do: "Put one provider near the root of your app.",
    dont: "Turn sound on by default. Let people choose it.",
    a11y: ["theme=\"system\" follows prefers-color-scheme.", "reducedMotion=\"system\" follows prefers-reduced-motion.", "Haptics always pair with a visual change."],
  },
  "sheet-heading": {
    title: "Sheet & Heading",
    group: "Foundations",
    badges: ["Server or client", AA, V01],
    lede: "The paper everything sits on, and the lettering that labels it.",
    code: `import { Sheet, Heading, Lettering } from "@plop-ui/react";

<Heading level={2}>Status timeline</Heading>
<Sheet tape="periwinkle">…</Sheet>
<Lettering amp={2}>Hand-lettered label</Lettering>`,
    tables: [{ of: "Sheet", inheritedFrom: "<div>" }, { of: "Heading" }, { of: "Lettering" }],
    do: "Use lettering for short labels and headings.",
    dont: "Letter whole paragraphs. Body text stays upright and readable.",
    a11y: ["Lettering gives screen readers the plain text once; the jittered letters are hidden.", "Headings render fully written on the server and write on only after JavaScript loads."],
  },
};
