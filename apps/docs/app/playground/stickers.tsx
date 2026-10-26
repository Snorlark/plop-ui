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
  IconButton,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  StatusTimeline,
  Switch,
  Tag,
  Toast,
  WordSticker,
  type BuddyMood,
  type DoodleKind,
} from "@plop-ui/react";
import type { ReactNode } from "react";
import { HoloPip } from "../_site/RideAlong";
import styles from "./tools.module.css";

/*
 * The sticker catalog shared by the board: every sticker is a real
 * @plop-ui/react component. For each kind we know how to draw it, how to
 * write its code, and which few settings are worth showing (Hick's law:
 * the inspector only ever shows the controls for the selected sticker).
 */

export type Kind = "button" | "icon" | "switch" | "checkbox" | "tag" | "timeline" | "toast" | "count" | "avatar" | "buddy" | "word" | "doodle" | "holo";
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
const SHADOW: Field = { key: "shadow", type: "choice", label: "Shadow", options: [["soft", "Soft"], ["solid", "Solid"], ["stripes", "Stripes"], ["outline", "Outline"], ["none", "None"]] };
const shadowOf = (p: Props) => (str(p.shadow) || "soft") as "soft";
const shadowCode = (p: Props) => (shadowOf(p) !== "soft" ? ` shadow="${shadowOf(p)}"` : "");
const jsx = (v: unknown) => str(v).replace(/[{}<>"]/g, "");

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
    code: (p) => `<Button variant="${p.variant}"${shadowCode(p)}${p.mood !== "none" ? ` buddy buddyMood="${p.mood}"` : ""}>${jsx(p.label)}</Button>`,
  },
  icon: {
    name: "IconButton",
    imports: ["IconButton"],
    fields: [
      { key: "icon", type: "choice", label: "Icon", options: Object.keys(ICONS).map((k) => [k, ICONS[k]!.label] as [string, string]) },
      { key: "variant", type: "swatch", label: "Color", options: BUTTON_TONES },
      SHADOW,
    ],
    render: (p) => <IconButton variant={str(p.variant) as "ink"} shadow={shadowOf(p)} icon={ICONS[str(p.icon)]?.el} label={ICONS[str(p.icon)]?.label ?? "Action"} />,
    code: (p) => `<IconButton variant="${p.variant}"${shadowCode(p)} icon={<${ICONS[str(p.icon)]?.name} />} label="${ICONS[str(p.icon)]?.label}" />`,
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
    code: (p) => `<Switch${p.on ? " defaultChecked" : ""}>${jsx(p.label)}</Switch>`,
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
    code: (p) => `<Checkbox${p.on ? " defaultChecked" : ""}>${jsx(p.label)}</Checkbox>`,
  },
  tag: {
    name: "Tag",
    imports: ["Tag"],
    fields: [
      { key: "label", type: "text", label: "Words" },
      { key: "tone", type: "swatch", label: "Tape", options: TONES },
    ],
    render: (p) => <Tag tone={str(p.tone) as "ink"}>{str(p.label) || "Tag"}</Tag>,
    code: (p) => `<Tag tone="${p.tone}">${jsx(p.label)}</Tag>`,
  },
  timeline: {
    name: "StatusTimeline",
    imports: ["StatusTimeline"],
    fields: [{ key: "step", type: "step", label: "Current step", min: 0, max: STEPS.length }],
    render: (p) => (
      <span className={`${styles.chip} ${styles.chipTimeline}`}>
        <StatusTimeline steps={STEPS} current={Number(p.step)} orientation="horizontal" label="Sketch" />
      </span>
    ),
    code: (p) => `<StatusTimeline\n  steps={${JSON.stringify(STEPS)}}\n  current={${p.step}}\n/>`,
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
    code: (p) => `toast${p.kind === "info" ? "" : `.${p.kind}`}("${jsx(p.label)}"${p.buddy ? ", { buddy: true }" : ""});`,
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
    code: (p) => `<Avatar name="${jsx(p.name)}"${p.status !== "none" ? ` status="${p.status}"` : ""} size="lg" />`,
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
    code: (p) => `<WordSticker tone="${p.tone}">${jsx(p.label)}</WordSticker>`,
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

/** Five small shelves instead of one long list: people pick a shelf, then a sticker. */
export const SHELVES: Array<{ id: string; label: string; items: TrayEntry[] }> = [
  {
    id: "actions",
    label: "Actions",
    items: [
      { kind: "button", props: { label: "Post sketch", variant: "ink", mood: "none" }, hint: "Button" },
      { kind: "button", props: { label: "Retry", variant: "tomato", mood: "error" }, hint: "Button with Bix" },
      { kind: "icon", props: { icon: "plus", variant: "mustard" }, hint: "IconButton" },
      { kind: "switch", props: { label: "Live location", on: true }, hint: "Switch" },
      { kind: "checkbox", props: { label: "Notify", on: true }, hint: "Checkbox" },
    ],
  },
  {
    id: "status",
    label: "Status",
    items: [
      { kind: "tag", props: { label: "Wild idea", tone: "tomato" }, hint: "Tag" },
      { kind: "tag", props: { label: "In progress", tone: "mustard" }, hint: "Tag" },
      { kind: "timeline", props: { step: 2 }, hint: "StatusTimeline" },
      { kind: "toast", props: { label: "Sketch posted", kind: "success", buddy: true }, hint: "Toast" },
      { kind: "count", props: { n: 3 }, hint: "Count" },
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
    ],
  },
];

/** A short spoken name for a sticker on the board. */
export function describe(item: Item): string {
  const p = item.props;
  const what = KINDS[item.kind].name;
  const detail = p.label ?? p.name ?? (item.kind === "buddy" ? BUDDY_CAST[p.mood as BuddyMood]?.name : item.kind === "doodle" ? p.shape : "");
  return detail ? `${what}: ${detail}` : what;
}

export function codeFor(item: Item): string {
  return KINDS[item.kind].code(item.props);
}

/** The whole board as one component: each sticker absolutely placed where it sits. */
export function boardCode(items: Item[], paper: string): string {
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
    <PlopProvider surface="${paper}" style={{ position: "relative", height: 520 }}>
${placed}
    </PlopProvider>
  );
}
`;
}

export type { Field };
