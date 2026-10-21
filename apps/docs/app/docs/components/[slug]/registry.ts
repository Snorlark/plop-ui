import type props from "../../../_generated/props.json";

type Name = keyof typeof props;

export interface ComponentDoc {
  title: string;
  lede: string;
  code: string;
  /** Props tables to show, with what each inherits from (if anything). */
  tables: Array<{ of: Name; inheritedFrom?: string }>;
  a11y: string[];
}

export const COMPONENT_DOCS: Record<string, ComponentDoc> = {
  tooltip: {
    title: "Tooltip",
    lede: "A speech bubble that pops out of whatever it explains. Opens on hover and keyboard focus.",
    code: `<Tooltip content="Priority sets who gets paged first.">
  <IconButton icon={<InfoIcon />} label="What does priority do?" />
</Tooltip>`,
    tables: [{ of: "Tooltip" }],
    a11y: ["role=\"tooltip\", linked to its trigger with aria-describedby.", "Opens on hover and keyboard focus; Escape closes it without moving focus.", "The trigger must be focusable: a button, a link, or a control."],
  },
  "text-field": {
    title: "TextField & TextArea",
    lede: "Focus swipes a highlighter across the label and makes the outline boil. Errors switch to tomato ink and say how to fix it.",
    code: `<TextField label="Location" error="Add a street, barangay, or landmark…" />
<TextArea label="What happened?" />`,
    tables: [
      { of: "TextField", inheritedFrom: "<input>" },
      { of: "TextArea", inheritedFrom: "<textarea>" },
    ],
    a11y: ["A real <label> for every field; the label is required.", "Hints and errors are linked with aria-describedby; errors set aria-invalid.", "Errors carry an icon and words, never color alone."],
  },
  radio: {
    title: "RadioGroup & Radio",
    lede: "Radios fill with an ink blob. A fieldset of real radio inputs.",
    code: `<RadioGroup legend="Priority" defaultValue="medium">
  <Radio value="low">Low</Radio>
  <Radio value="medium" dotColor="var(--plop-mustard)">Medium</Radio>
</RadioGroup>`,
    tables: [{ of: "RadioGroup" }, { of: "Radio" }],
    a11y: ["A <fieldset> with a <legend>, holding native radio inputs.", "Arrow keys move between options, as with any radio group."],
  },
  avatar: {
    title: "Avatar",
    lede: "Doodle faces generated from a name, so the same person always gets the same face. Real photos can drop in too.",
    code: `<Avatar name="Jun Reyes" status="online" />
<AvatarStack names={crew} max={3} />`,
    tables: [{ of: "Avatar" }, { of: "AvatarStack" }],
    a11y: ["role=\"img\" named after the person; the status is added to the name (\"Jun Reyes, online\").", "Stacks are named \"Rosa, Jun, Ana and 4 more\"."],
  },
  cards: {
    title: "Cards",
    lede: "Three paper objects for three jobs: a ticket stub for queue items, a taped unit card for people, a sticky note for quick context.",
    code: `<TicketCard meta="Ticket #1042, 9:14 AM" title="Printer jams" stub="Open">…</TicketCard>
<UnitCard name="Mobile 2" subtitle="PO2 Jun Reyes" avatar={<Avatar name="Jun Reyes" />}>
  <UnitCardRow><Tag status="en-route">En route</Tag><Eta value={6} unit="min away" /></UnitCardRow>
</UnitCard>
<StickyNote footer="Added by Ana">Use the side entrance.</StickyNote>`,
    tables: [
      { of: "TicketCard", inheritedFrom: "<article>" },
      { of: "UnitCard", inheritedFrom: "<article>" },
      { of: "StickyNote", inheritedFrom: "<aside>" },
    ],
    a11y: ["Tickets and unit cards are <article>s with a real heading (level 3 by default, change it with headingLevel).", "Sticky notes are <aside>s."],
  },
  tabs: {
    title: "Tabs",
    lede: "Index-card dividers. The active one comes forward and joins the page. Arrow keys move between them.",
    code: `<Tabs defaultValue="active">
  <TabList label="Incident queue">
    <Tab value="active" badge={<Count label="3 active">3</Count>}>Active</Tab>
    <Tab value="resolved">Resolved</Tab>
  </TabList>
  <TabPanel value="active">…</TabPanel>
  <TabPanel value="resolved">…</TabPanel>
</Tabs>`,
    tables: [{ of: "Tabs" }, { of: "TabList" }, { of: "Tab" }],
    a11y: ["The WAI-ARIA tabs pattern: tablist, tab with aria-selected and aria-controls, tabpanel.", "Roving tabindex; Arrow keys, Home and End move and select."],
  },
  progress: {
    title: "Progress",
    lede: "Filled with crayon hatching instead of a flat bar. The leading edge is a single heavier stroke.",
    code: `<Progress label="Syncing offline reports" value={4} max={10} valueText="4 of 10" />`,
    tables: [{ of: "Progress" }],
    a11y: ["role=\"progressbar\" with aria-valuenow, -min, -max and a readable aria-valuetext.", "Labeled by its visible label."],
  },
  callout: {
    title: "Callout",
    lede: "A strip torn off a pad. Use it for things people need to know before they act, not for decoration.",
    code: `<Callout tone="warn" title="Location is approximate">
  Confirm a landmark before dispatching.
</Callout>`,
    tables: [{ of: "Callout" }],
    a11y: ["Every tone has an icon and a title; color only repeats it.", "Pass role=\"alert\" for errors that need attention right away."],
  },
  toast: {
    title: "Toast",
    lede: "Slaps onto the bottom of the screen like a stamp, then lifts off after a few seconds.",
    code: `import { toast } from "@plop-ui/react";
toast.success("Report sent");
toast.error("Couldn’t send. Saved for later.");
toast("Mobile 2 is 6 min away", { duration: 6000 });`,
    tables: [{ of: "Toast" }],
    a11y: ["Shown in a polite live region (role=\"status\") rendered by PlopProvider.", "Stays 4 seconds by default; never the only place an important message appears."],
  },
  badges: {
    title: "Count & StatusDot",
    lede: "Round count stickers and little status dots.",
    code: `<Count label="3 unread">3</Count>
<StatusDot tone="busy">On a call</StatusDot>`,
    tables: [{ of: "Count" }, { of: "StatusDot" }],
    a11y: ["A Count needs a label (\"3 unread\"): a bare number says nothing.", "A StatusDot always has its words next to it."],
  },
  "sheet-heading": {
    title: "Sheet, Heading & Lettering",
    lede: "The paper everything sits on, and the lettering that labels it.",
    code: `<Heading level={2}>Status timeline</Heading>
<Sheet tape="periwinkle">…</Sheet>
<Lettering amp={2}>Hand-lettered label</Lettering>`,
    tables: [{ of: "Sheet", inheritedFrom: "<div>" }, { of: "Heading" }, { of: "Lettering" }],
    a11y: ["Lettering gives screen readers the plain text once; the jittered letters are hidden from them.", "Headings render fully written on the server and only write on after JavaScript loads."],
  },
};
