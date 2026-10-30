"use client";

import {
  Avatar,
  BellIcon,
  Buddy,
  BUDDY_CAST,
  Button,
  Checkbox,
  Count,
  Doodle,
  Heading,
  IconButton,
  Menu,
  MultiSelect,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  StatusDot,
  StatusTimeline,
  StickyNote,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TextArea,
  TextField,
  TicketCard,
  Toast,
  Tooltip,
  UnitCard,
  WordSticker,
  type BuddyMood,
  type DoodleKind,
} from "@plop-ui/react";
import type { ReactNode } from "react";
import { HoloPip } from "../_site/RideAlong";
import { jsxAttr, jsString, jsxText } from "./code";
import styles from "./tools.module.css";

/*
 * The sticker catalog shared by the board: every sticker is a real
 * @plop-ui/react component. For each kind we know how to draw it, how to
 * write its code, and which few settings are worth showing (Hick's law:
 * the inspector only ever shows the controls for the selected sticker).
 */

export type Kind =
  | "button" | "icon" | "switch" | "checkbox" | "tag" | "timeline" | "toast" | "count" | "avatar" | "buddy" | "word" | "doodle" | "holo"
  | "tooltip" | "menu" | "dot" | "ticket" | "unit" | "note" | "textfield" | "textarea" | "search" | "radio" | "select" | "multiselect" | "tabs" | "heading";
export type Props = Record<string, string | number | boolean>;

export interface Item {
  id: string;
  kind: Kind;
  /** Center, in % of the board. */
  x: number;
  y: number;
  tilt: number;
  scale: number;
  z: number;
  props: Props;
}

type Field =
  | { key: string; type: "text"; label: string }
  | { key: string; type: "swatch"; label: string; options: string[] }
  | { key: string; type: "choice"; label: string; options: Array<[string, string]> }
  | { key: string; type: "toggle"; label: string }
  | { key: string; type: "step"; label: string; min: number; max: number };

const TONES = ["ink", "tomato", "mustard", "mint", "periwinkle", "bubblegum"];
const BUTTON_TONES = ["ink", "tomato", "mustard", "mint", "periwinkle", "plain"];
const WORD_TONES = ["mustard", "tomato", "mint", "bubblegum", "periwinkle", "ink"];
const MOODS = Object.keys(BUDDY_CAST) as BuddyMood[];
const STEPS = ["Sketched", "Inked", "Colored", "Shipped"];
const ICONS: Record<string, { el: ReactNode; name: string; label: string }> = {
  plus: { el: <PlusIcon />, name: "PlusIcon", label: "New sketch" },
  phone: { el: <PhoneIcon />, name: "PhoneIcon", label: "Call" },
  pin: { el: <PinIcon />, name: "PinIcon", label: "Pin to board" },
  bell: { el: <BellIcon />, name: "BellIcon", label: "Ping a friend" },
};
const str = (v: unknown) => String(v ?? "");
const iconLabel = (p: Props) => str(p.label) || ICONS[str(p.icon)]?.label || "Action";
const SHADOW: Field = { key: "shadow", type: "choice", label: "Shadow", options: [["soft", "Soft"], ["solid", "Solid"], ["stripes", "Stripes"], ["outline", "Outline"], ["none", "None"]] };
const shadowOf = (p: Props) => (str(p.shadow) || "soft") as "soft";
const shadowCode = (p: Props) => (shadowOf(p) !== "soft" ? ` shadow="${shadowOf(p)}"` : "");
/** "Ink pen, Watercolor" → ["Ink pen", "Watercolor"]: every list on the board is typed as words with commas. */
const list = (v: unknown, fallback: string[]) => {
  const items = str(v).split(",").map((x) => x.trim()).filter(Boolean);
  return items.length ? items : fallback;
};
const opts = (items: string[]) => items.map((label) => ({ value: label.toLowerCase().replace(/\s+/g, "-"), label }));
const optsCode = (items: string[]) => `[${items.map((l) => `{ value: ${jsString(opts([l])[0]!.value)}, label: ${jsString(l)} }`).join(", ")}]`;
const BRUSHES = ["Ink pen", "Watercolor", "Charcoal"];

interface KindSpec {
  name: string;
  imports: string[];
  fields: Field[];
  render: (p: Props) => ReactNode;
  code: (p: Props) => string;
}

export const KINDS: Record<Kind, KindSpec> = {
  button: {
    name: "Button",
    imports: ["Button"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "variant", type: "swatch", label: "Color", options: BUTTON_TONES },
      { key: "mood", type: "choice", label: "Buddy", options: [["none", "None"], ...MOODS.map((m) => [m, BUDDY_CAST[m].name] as [string, string])] },
      SHADOW,
    ],
    render: (p) => (
      <Button variant={str(p.variant) as "ink"} shadow={shadowOf(p)} buddy={p.mood !== "none"} buddyMood={p.mood === "none" ? undefined : (str(p.mood) as BuddyMood)}>
        {str(p.label) || "Button"}
      </Button>
    ),
    code: (p) => `<Button variant="${p.variant}"${shadowCode(p)}${p.mood !== "none" ? ` buddy buddyMood="${p.mood}"` : ""}>${jsxText(p.label)}</Button>`,
  },
  icon: {
    name: "IconButton",
    imports: ["IconButton"],
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "icon", type: "choice", label: "Icon", options: Object.keys(ICONS).map((k) => [k, ICONS[k]!.label] as [string, string]) },
      { key: "variant", type: "swatch", label: "Color", options: BUTTON_TONES },
      SHADOW,
    ],
    render: (p) => <IconButton variant={str(p.variant) as "ink"} shadow={shadowOf(p)} icon={ICONS[str(p.icon)]?.el} label={iconLabel(p)} />,
    code: (p) => `<IconButton variant="${p.variant}"${shadowCode(p)} icon={<${ICONS[str(p.icon)]?.name} />} label=${jsxAttr(iconLabel(p))} />`,
  },
  switch: {
    name: "Switch",
    imports: ["Switch"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "on", type: "toggle", label: "Starts on" },
    ],
    render: (p) => (
      <Switch key={str(p.on)} defaultChecked={!!p.on}>
        {str(p.label) || "Switch"}
      </Switch>
    ),
    code: (p) => `<Switch${p.on ? " defaultChecked" : ""}>${jsxText(p.label)}</Switch>`,
  },
  checkbox: {
    name: "Checkbox",
    imports: ["Checkbox"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "on", type: "toggle", label: "Starts ticked" },
    ],
    render: (p) => (
      <span className={styles.chip} key={str(p.on)}>
        <Checkbox defaultChecked={!!p.on}>{str(p.label) || "Checkbox"}</Checkbox>
      </span>
    ),
    code: (p) => `<Checkbox${p.on ? " defaultChecked" : ""}>${jsxText(p.label)}</Checkbox>`,
  },
  tag: {
    name: "Tag",
    imports: ["Tag"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "tone", type: "swatch", label: "Tape", options: TONES },
    ],
    render: (p) => <Tag tone={str(p.tone) as "ink"}>{str(p.label) || "Tag"}</Tag>,
    code: (p) => `<Tag tone="${p.tone}">${jsxText(p.label)}</Tag>`,
  },
  timeline: {
    name: "StatusTimeline",
    imports: ["StatusTimeline"],
    fields: [
      { key: "steps", type: "text", label: "Steps" },
      { key: "step", type: "step", label: "Current step", min: 0, max: 8 },
    ],
    render: (p) => (
      <span className={`${styles.chip} ${styles.chipTimeline}`}>
        <StatusTimeline steps={list(p.steps, STEPS)} current={Math.min(Number(p.step), list(p.steps, STEPS).length)} orientation="horizontal" label="Sketch" />
      </span>
    ),
    code: (p) => `<StatusTimeline\n  steps={${JSON.stringify(list(p.steps, STEPS))}}\n  current={${p.step}}\n/>`,
  },
  toast: {
    name: "Toast",
    imports: ["Toast"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "kind", type: "choice", label: "Kind", options: [["success", "Success"], ["error", "Error"], ["info", "Info"]] },
      { key: "buddy", type: "toggle", label: "Character on top" },
    ],
    render: (p) => (
      <Toast kind={str(p.kind) as "success"} buddy={!!p.buddy}>
        {str(p.label) || "Toast"}
      </Toast>
    ),
    code: (p) => `toast${p.kind === "info" ? "" : `.${p.kind}`}(${jsString(p.label)}${p.buddy ? ", { buddy: true }" : ""});`,
  },
  count: {
    name: "Count",
    imports: ["Count"],
    fields: [{ key: "n", type: "step", label: "Number", min: 0, max: 99 }],
    render: (p) => <Count label={`${p.n} new`}>{Number(p.n)}</Count>,
    code: (p) => `<Count label="${p.n} new">{${p.n}}</Count>`,
  },
  avatar: {
    name: "Avatar",
    imports: ["Avatar"],
    fields: [
      { key: "name", type: "text", label: "Name (draws the face)" },
      { key: "status", type: "choice", label: "Status", options: [["none", "None"], ["online", "Online"], ["busy", "Busy"], ["offline", "Offline"]] },
    ],
    render: (p) => <Avatar name={str(p.name) || "You"} size="lg" status={p.status === "none" ? undefined : (str(p.status) as "online")} />,
    code: (p) => `<Avatar name=${jsxAttr(p.name)}${p.status !== "none" ? ` status="${p.status}"` : ""} size="lg" />`,
  },
  buddy: {
    name: "Buddy",
    imports: ["Buddy"],
    fields: [{ key: "mood", type: "choice", label: "Character", options: MOODS.map((m) => [m, `${BUDDY_CAST[m].name} · ${m}`] as [string, string]) }],
    render: (p) => <Buddy mood={str(p.mood) as BuddyMood} size="lg" />,
    code: (p) => `<Buddy mood="${p.mood}" size="lg" />`,
  },
  word: {
    name: "WordSticker",
    imports: ["WordSticker"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "tone", type: "swatch", label: "Fill", options: WORD_TONES },
    ],
    render: (p) => <WordSticker tone={str(p.tone) as "mustard"}>{str(p.label) || "Plop!"}</WordSticker>,
    code: (p) => `<WordSticker tone="${p.tone}">${jsxText(p.label)}</WordSticker>`,
  },
  doodle: {
    name: "Doodle",
    imports: ["Doodle"],
    fields: [
      { key: "shape", type: "choice", label: "Shape", options: [["star", "Star"], ["heart", "Heart"], ["sparkle", "Sparkle"], ["burst", "Burst"]] },
      { key: "tone", type: "swatch", label: "Color", options: TONES },
    ],
    render: (p) => <Doodle kind={str(p.shape) as DoodleKind} tone={str(p.tone) as "tomato"} size={72} />,
    code: (p) => `<Doodle kind="${p.shape}" tone="${p.tone}" size={72} />`,
  },
  tooltip: {
    name: "Tooltip",
    imports: ["Button", "Tooltip"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "tip", type: "text", label: "Tip" },
    ],
    // Shown open on the board, so you can see what it says.
    render: (p) => (
      <Tooltip content={str(p.tip) || "Tip"} open side="top">
        <Button size="sm" variant="plain">
          {str(p.label) || "Hover me"}
        </Button>
      </Tooltip>
    ),
    code: (p) => `<Tooltip content=${jsxAttr(p.tip)}>\n  <Button size="sm" variant="plain">${jsxText(p.label)}</Button>\n</Tooltip>`,
  },
  menu: {
    name: "Menu",
    imports: ["Menu"],
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "items", type: "text", label: "Items" },
    ],
    render: (p) => <Menu label={str(p.label) || "More"} items={list(p.items, ["Rename", "Duplicate"]).map((label) => ({ label, onSelect: () => {} }))} />,
    code: (p) =>
      `<Menu\n  label=${jsxAttr(p.label)}\n  items={[\n${list(p.items, ["Rename"]).map((l) => `    { label: ${jsString(l)}, onSelect: () => {} },`).join("\n")}\n  ]}\n/>`,
  },
  dot: {
    name: "StatusDot",
    imports: ["StatusDot"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "tone", type: "choice", label: "Status", options: [["online", "Online"], ["busy", "Busy"], ["offline", "Offline"]] },
    ],
    render: (p) => (
      <span className={styles.chip}>
        <StatusDot tone={str(p.tone) as "online"}>{str(p.label) || "Online"}</StatusDot>
      </span>
    ),
    code: (p) => `<StatusDot tone="${p.tone}">${jsxText(p.label)}</StatusDot>`,
  },
  ticket: {
    name: "TicketCard",
    imports: ["TicketCard"],
    fields: [
      { key: "title", type: "text", label: "Title" },
      { key: "meta", type: "text", label: "Meta" },
      { key: "body", type: "text", label: "Words" },
    ],
    render: (p) => (
      <TicketCard className={styles.card} title={str(p.title) || "Sketch"} meta={str(p.meta) || undefined}>
        {str(p.body)}
      </TicketCard>
    ),
    code: (p) => `<TicketCard title=${jsxAttr(p.title)}${p.meta ? ` meta=${jsxAttr(p.meta)}` : ""}>\n  ${jsxText(p.body)}\n</TicketCard>`,
  },
  unit: {
    name: "UnitCard",
    imports: ["Avatar", "UnitCard"],
    fields: [
      { key: "name", type: "text", label: "Name" },
      { key: "subtitle", type: "text", label: "Subtitle" },
    ],
    render: (p) => <UnitCard className={styles.card} name={str(p.name) || "Rosa"} subtitle={str(p.subtitle) || undefined} avatar={<Avatar name={str(p.name) || "Rosa"} size="md" />} />,
    code: (p) => `<UnitCard name=${jsxAttr(p.name)}${p.subtitle ? ` subtitle=${jsxAttr(p.subtitle)}` : ""} avatar={<Avatar name=${jsxAttr(p.name)} size="md" />} />`,
  },
  note: {
    name: "StickyNote",
    imports: ["StickyNote"],
    fields: [
      { key: "text", type: "text", label: "Words" },
      { key: "tone", type: "choice", label: "Paper", options: [["mustard", "Mustard"], ["mint", "Mint"], ["pink", "Pink"]] },
    ],
    render: (p) => <StickyNote tone={str(p.tone) as "mint"}>{str(p.text) || "Note"}</StickyNote>,
    code: (p) => `<StickyNote tone="${p.tone}">${jsxText(p.text)}</StickyNote>`,
  },
  textfield: {
    name: "TextField",
    imports: ["TextField"],
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "placeholder", type: "text", label: "Placeholder" },
    ],
    render: (p) => (
      <span className={`${styles.chip} ${styles.chipField}`}>
        <TextField label={str(p.label) || "Title"} placeholder={str(p.placeholder)} />
      </span>
    ),
    code: (p) => `<TextField label=${jsxAttr(p.label)} placeholder=${jsxAttr(p.placeholder)} />`,
  },
  textarea: {
    name: "TextArea",
    imports: ["TextArea"],
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "placeholder", type: "text", label: "Placeholder" },
    ],
    render: (p) => (
      <span className={`${styles.chip} ${styles.chipField}`}>
        <TextArea label={str(p.label) || "Notes"} placeholder={str(p.placeholder)} rows={3} ruled />
      </span>
    ),
    code: (p) => `<TextArea label=${jsxAttr(p.label)} placeholder=${jsxAttr(p.placeholder)} rows={3} ruled />`,
  },
  search: {
    name: "SearchField",
    imports: ["SearchField"],
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "placeholder", type: "text", label: "Placeholder" },
    ],
    render: (p) => (
      <span className={`${styles.chip} ${styles.chipField}`}>
        <SearchField label={str(p.label) || "Search"} placeholder={str(p.placeholder)} />
      </span>
    ),
    code: (p) => `<SearchField label=${jsxAttr(p.label)} placeholder=${jsxAttr(p.placeholder)} />`,
  },
  radio: {
    name: "RadioGroup",
    imports: ["Radio", "RadioGroup"],
    fields: [
      { key: "legend", type: "text", label: "Question" },
      { key: "options", type: "text", label: "Options" },
    ],
    render: (p) => {
      const items = list(p.options, ["Ink", "Paint"]);
      return (
        <span className={styles.chip}>
          <RadioGroup legend={str(p.legend) || "Pick one"} defaultValue={items[0]} vertical={false}>
            {items.map((o) => (
              <Radio key={o} value={o}>
                {o}
              </Radio>
            ))}
          </RadioGroup>
        </span>
      );
    },
    code: (p) => {
      const items = list(p.options, ["Ink", "Paint"]);
      return `<RadioGroup legend=${jsxAttr(p.legend)} defaultValue=${jsxAttr(items[0])}>\n${items.map((o) => `  <Radio value=${jsxAttr(o)}>${jsxText(o)}</Radio>`).join("\n")}\n</RadioGroup>`;
    },
  },
  select: {
    name: "Select",
    imports: ["Select"],
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "options", type: "text", label: "Options" },
      { key: "placeholder", type: "text", label: "Placeholder" },
    ],
    render: (p) => (
      <span className={`${styles.chip} ${styles.chipField}`}>
        <Select label={str(p.label) || "Pick"} placeholder={str(p.placeholder) || undefined} options={opts(list(p.options, BRUSHES))} />
      </span>
    ),
    code: (p) => `<Select\n  label=${jsxAttr(p.label)}\n  placeholder=${jsxAttr(p.placeholder)}\n  options={${optsCode(list(p.options, BRUSHES))}}\n/>`,
  },
  multiselect: {
    name: "MultiSelect",
    imports: ["MultiSelect"],
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "options", type: "text", label: "Options" },
      { key: "placeholder", type: "text", label: "Placeholder" },
    ],
    render: (p) => (
      <span className={`${styles.chip} ${styles.chipField}`}>
        <MultiSelect label={str(p.label) || "Pick some"} placeholder={str(p.placeholder) || undefined} options={opts(list(p.options, BRUSHES))} />
      </span>
    ),
    code: (p) => `<MultiSelect\n  label=${jsxAttr(p.label)}\n  placeholder=${jsxAttr(p.placeholder)}\n  options={${optsCode(list(p.options, BRUSHES))}}\n/>`,
  },
  tabs: {
    name: "Tabs",
    imports: ["Tab", "TabList", "TabPanel", "Tabs"],
    fields: [{ key: "labels", type: "text", label: "Tabs" }],
    render: (p) => {
      const labels = list(p.labels, ["Sketch", "Ink", "Color"]);
      return (
        <span className={styles.chip}>
          <Tabs defaultValue={labels[0]}>
            <TabList label="Sketch views">
              {labels.map((l) => (
                <Tab key={l} value={l}>
                  {l}
                </Tab>
              ))}
            </TabList>
            {labels.map((l) => (
              <TabPanel key={l} value={l}>
                {l} goes here.
              </TabPanel>
            ))}
          </Tabs>
        </span>
      );
    },
    code: (p) => {
      const labels = list(p.labels, ["Sketch", "Ink", "Color"]);
      return `<Tabs defaultValue=${jsxAttr(labels[0])}>\n  <TabList label="Sketch views">\n${labels.map((l) => `    <Tab value=${jsxAttr(l)}>${jsxText(l)}</Tab>`).join("\n")}\n  </TabList>\n${labels.map((l) => `  <TabPanel value=${jsxAttr(l)}>…</TabPanel>`).join("\n")}\n</Tabs>`;
    },
  },
  heading: {
    name: "Heading",
    imports: ["Heading"],
    fields: [{ key: "text", type: "text", label: "Words" }],
    render: (p) => (
      <Heading level={2} scribble>
        {str(p.text) || "Sketchbook"}
      </Heading>
    ),
    code: (p) => `<Heading level={2} scribble>${jsxText(p.text)}</Heading>`,
  },
  holo: {
    name: "Holo Pip",
    imports: ["Buddy"],
    fields: [],
    render: () => <HoloPip size={120} />,
    code: () => `{/* Holo Pip: the Ride-along pass reward. The character is <Buddy mood="congrats" />; the foil is yours to style. */}\n<Buddy mood="congrats" size="lg" />`,
  },
};

/** The shelf that appears once the Ride-along pass is full. */
export const REGULARS_SHELF = { id: "regulars", label: "Regulars ★", items: [{ kind: "holo" as Kind, props: {}, hint: "Holo Pip" }] };

export interface TrayEntry {
  kind: Kind;
  props: Props;
  hint: string;
}

/** Small shelves instead of one long list: people pick a shelf, then a sticker. */
export const SHELVES: Array<{ id: string; label: string; items: TrayEntry[] }> = [
  {
    id: "actions",
    label: "Actions",
    items: [
      { kind: "button", props: { label: "Post sketch", variant: "ink", mood: "none" }, hint: "Button" },
      { kind: "button", props: { label: "Retry", variant: "tomato", mood: "error" }, hint: "Button with Bix" },
      { kind: "icon", props: { icon: "plus", label: "New sketch", variant: "mustard" }, hint: "IconButton" },
      { kind: "switch", props: { label: "Live location", on: true }, hint: "Switch" },
      { kind: "checkbox", props: { label: "Notify", on: true }, hint: "Checkbox" },
      { kind: "tooltip", props: { label: "Save", tip: "Saves a copy" }, hint: "Tooltip" },
      { kind: "menu", props: { label: "Sketch actions", items: "Rename, Duplicate, Delete" }, hint: "Menu" },
    ],
  },
  {
    id: "status",
    label: "Status",
    items: [
      { kind: "tag", props: { label: "Wild idea", tone: "tomato" }, hint: "Tag" },
      { kind: "tag", props: { label: "In progress", tone: "mustard" }, hint: "Tag" },
      { kind: "timeline", props: { steps: STEPS.join(", "), step: 2 }, hint: "StatusTimeline" },
      { kind: "toast", props: { label: "Sketch posted", kind: "success", buddy: true }, hint: "Toast" },
      { kind: "count", props: { n: 3 }, hint: "Count" },
      { kind: "dot", props: { label: "Inking now", tone: "online" }, hint: "StatusDot" },
    ],
  },
  {
    id: "cards",
    label: "Cards",
    items: [
      { kind: "ticket", props: { title: "Sketch #1042", meta: "9:14 AM", body: "Rosa inked the café menu." }, hint: "TicketCard" },
      { kind: "unit", props: { name: "Rosa Santos", subtitle: "Inker" }, hint: "UnitCard" },
      { kind: "note", props: { text: "Buy more ink!", tone: "mustard" }, hint: "StickyNote" },
    ],
  },
  {
    id: "forms",
    label: "Forms",
    items: [
      { kind: "textfield", props: { label: "Title", placeholder: "Untitled masterpiece" }, hint: "TextField" },
      { kind: "textarea", props: { label: "Notes", placeholder: "What's it about?" }, hint: "TextArea" },
      { kind: "search", props: { label: "Search sketches", placeholder: "Find a sketch" }, hint: "SearchField" },
      { kind: "radio", props: { legend: "Medium", options: "Ink, Paint, Pencil" }, hint: "RadioGroup" },
    ],
  },
  {
    id: "pickers",
    label: "Pickers",
    items: [
      { kind: "select", props: { label: "Brush", options: BRUSHES.join(", "), placeholder: "Pick a brush" }, hint: "Select" },
      { kind: "multiselect", props: { label: "Colors", options: "Tomato, Mustard, Mint", placeholder: "Pick colors" }, hint: "MultiSelect" },
      { kind: "tabs", props: { labels: "Sketch, Ink, Color" }, hint: "Tabs" },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { kind: "avatar", props: { name: "Rosa Santos", status: "online" }, hint: "Avatar" },
      { kind: "avatar", props: { name: "Jun Reyes", status: "busy" }, hint: "Avatar" },
      { kind: "avatar", props: { name: "You", status: "none" }, hint: "Avatar" },
    ],
  },
  {
    id: "cast",
    label: "Characters",
    items: MOODS.map((mood) => ({ kind: "buddy" as Kind, props: { mood }, hint: `${BUDDY_CAST[mood].name}, ${mood}` })),
  },
  {
    id: "words",
    label: "Words & doodles",
    items: [
      { kind: "word", props: { label: "Plop!", tone: "mustard" }, hint: "WordSticker" },
      { kind: "word", props: { label: "Squish!", tone: "bubblegum" }, hint: "WordSticker" },
      { kind: "doodle", props: { shape: "star", tone: "tomato" }, hint: "Doodle" },
      { kind: "doodle", props: { shape: "heart", tone: "bubblegum" }, hint: "Doodle" },
      { kind: "doodle", props: { shape: "sparkle", tone: "mustard" }, hint: "Doodle" },
      { kind: "heading", props: { text: "Sketchbook" }, hint: "Heading" },
    ],
  },
];

/** A short spoken name for a sticker on the board. */
export function describe(item: Item): string {
  const p = item.props;
  const what = KINDS[item.kind].name;
  const detail = p.label ?? p.name ?? p.title ?? p.text ?? (item.kind === "buddy" ? BUDDY_CAST[p.mood as BuddyMood]?.name : item.kind === "doodle" ? p.shape : "");
  return detail ? `${what}: ${detail}` : what;
}

export function codeFor(item: Item): string {
  return KINDS[item.kind].code(item.props);
}

/** The whole board as one component: each sticker absolutely placed where it sits. */
export function boardCode(items: Item[], paper: string, roundness = 1): string {
  const imports = new Set<string>(["PlopProvider"]);
  for (const it of items) {
    KINDS[it.kind].imports.forEach((i) => imports.add(i));
    if (it.kind === "icon") imports.add(ICONS[str(it.props.icon)]?.name ?? "PlusIcon");
  }
  const toasts = items.filter((i) => i.kind === "toast");
  const placed = [...items]
    .filter((i) => i.kind !== "toast")
    .sort((a, b) => a.z - b.z)
    .map((it) => {
      const t = `translate(-50%, -50%) rotate(${it.tilt}deg)${it.scale !== 1 ? ` scale(${it.scale})` : ""}`;
      const body = codeFor(it).replace(/\n/g, "\n        ");
      return `      <div style={{ position: "absolute", left: "${it.x.toFixed(1)}%", top: "${it.y.toFixed(1)}%", transform: "${t}" }}>\n        ${body}\n      </div>`;
    })
    .join("\n");
  if (toasts.length) imports.add("toast");
  const toastNote = toasts.length ? `\n// Toasts aren't placed; show them when something happens:\n${toasts.map(codeFor).map((c) => `// ${c}`).join("\n")}\n` : "";
  return `import { ${[...imports].filter((i) => i !== "Toast").sort().join(", ")} } from "@plop-ui/react";
${toastNote}
export function MyBoard() {
  return (
    <PlopProvider surface="${paper}"${roundness !== 1 ? ` roundness={${roundness}}` : ""} style={{ position: "relative", height: 520 }}>
${placed}
    </PlopProvider>
  );
}
`;
}

export type { Field };
