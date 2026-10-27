"use client";

import {
  Avatar,
  BellIcon,
  Button,
  Callout,
  Checkbox,
  CloseIcon,
  Heading,
  IconButton,
  Menu,
  MultiSelect,
  PhoneIcon,
  PinIcon,
  PlopProvider,
  PlusIcon,
  Progress,
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
  toast,
  type ButtonVariant,
  BURST_STYLES,
  type BurstStyle,
} from "@plop-ui/react";
import { surfaceNames, surfaces, type SurfaceName } from "@plop-ui/tokens";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

/* ---------------------------------------------------------------- controls */

type Value = string | number | boolean;
type Values = Record<string, Value>;

type Control =
  | { kind: "select"; name: string; label: string; options: string[]; default: string }
  | { kind: "boolean"; name: string; label: string; default: boolean }
  | { kind: "text"; name: string; label: string; default: string }
  | { kind: "number"; name: string; label: string; default: number; min: number; max: number; step: number };

interface Entry {
  label: string;
  controls: Control[];
  render: (v: Values) => ReactNode;
  code: (v: Values) => string;
}

const VARIANTS = ["ink", "periwinkle", "mint", "tomato", "mustard", "plain"];
const SIZES = ["sm", "md", "lg"];
const ICONS: Record<string, ReactNode> = { plus: <PlusIcon />, phone: <PhoneIcon />, close: <CloseIcon />, bell: <BellIcon />, pin: <PinIcon /> };
const ICON_NAMES: Record<string, string> = { plus: "PlusIcon", phone: "PhoneIcon", close: "CloseIcon", bell: "BellIcon", pin: "PinIcon" };

const s = (v: Value | undefined) => String(v ?? "");
const n = (v: Value | undefined) => Number(v ?? 0);
const b = (v: Value | undefined) => v === true;

/** Writes a JSX prop only when it differs from the component's default. */
function prop(name: string, value: Value | undefined, def?: Value) {
  if (value === undefined) return "";
  if (value === def) return "";
  if (value === true) return ` ${name}`;
  if (value === false) return ` ${name}={false}`;
  if (typeof value === "number") return ` ${name}={${value}}`;
  return ` ${name}="${value}"`;
}

const ENTRIES: Record<string, Entry> = {
  button: {
    label: "Button",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Post sketch" },
      { kind: "select", name: "variant", label: "Variant", options: VARIANTS, default: "ink" },
      { kind: "select", name: "size", label: "Size", options: SIZES, default: "md" },
      { kind: "select", name: "icon", label: "Icon", options: ["none", "pin", "phone", "bell"], default: "none" },
      { kind: "number", name: "tilt", label: "Tilt", default: -2, min: -8, max: 8, step: 0.5 },
      { kind: "boolean", name: "buddy", label: "Buddy", default: false },
      { kind: "boolean", name: "loading", label: "Loading", default: false },
      { kind: "boolean", name: "disabled", label: "Disabled", default: false },
      { kind: "select", name: "burst", label: "Burst", options: ["none", ...BURST_STYLES], default: "none" },
    ],
    render: (v) => (
      <Button
        variant={s(v.variant) as ButtonVariant}
        size={s(v.size) as "sm"}
        tilt={n(v.tilt)}
        buddy={b(v.buddy)}
        loading={b(v.loading)}
        disabled={b(v.disabled)}
        burst={s(v.burst) === "none" ? false : (s(v.burst) as BurstStyle)}
        iconLeft={v.icon !== "none" ? ICONS[s(v.icon)] : undefined}
      >
        {s(v.label) || "Button"}
      </Button>
    ),
    code: (v) =>
      `<Button${prop("variant", v.variant, "ink")}${prop("size", v.size, "md")}${prop("tilt", v.tilt)}${prop("buddy", v.buddy, false)}${prop("loading", v.loading, false)}${prop("disabled", v.disabled, false)}${prop("burst", v.burst, "none")}${
        v.icon !== "none" ? ` iconLeft={<${ICON_NAMES[s(v.icon)]} />}` : ""
      }>\n  ${s(v.label)}\n</Button>`,
  },
  "icon-button": {
    label: "IconButton",
    controls: [
      { kind: "select", name: "icon", label: "Icon", options: ["plus", "phone", "close", "bell", "pin"], default: "phone" },
      { kind: "text", name: "label", label: "Label (accessible name)", default: "Start SOS call" },
      { kind: "select", name: "variant", label: "Variant", options: VARIANTS, default: "tomato" },
      { kind: "select", name: "size", label: "Size", options: SIZES, default: "md" },
      { kind: "number", name: "tilt", label: "Tilt", default: -5, min: -10, max: 10, step: 0.5 },
    ],
    render: (v) => <IconButton icon={ICONS[s(v.icon)]} label={s(v.label) || "Icon button"} variant={s(v.variant) as ButtonVariant} size={s(v.size) as "sm"} tilt={n(v.tilt)} />,
    code: (v) => `<IconButton icon={<${ICON_NAMES[s(v.icon)]} />} label="${s(v.label)}"${prop("variant", v.variant, "ink")}${prop("size", v.size, "md")}${prop("tilt", v.tilt)} />`,
  },
  tag: {
    label: "Tag",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "In progress" },
      { kind: "select", name: "status", label: "Status", options: ["none", "critical", "dispatched", "en-route", "resolved", "unassigned"], default: "en-route" },
      { kind: "select", name: "tone", label: "Tone (when no status)", options: ["periwinkle", "ink", "tomato", "mustard", "mint", "bubblegum"], default: "periwinkle" },
      { kind: "select", name: "pattern", label: "Pattern", options: ["stripes", "dots", "grid"], default: "stripes" },
      { kind: "number", name: "tilt", label: "Tilt", default: -2, min: -8, max: 8, step: 0.5 },
      { kind: "boolean", name: "removable", label: "Removable", default: false },
    ],
    render: (v) => (
      <Tag
        status={v.status === "none" ? undefined : (s(v.status) as "critical")}
        tone={v.status === "none" ? (s(v.tone) as "ink") : undefined}
        pattern={s(v.pattern) as "dots"}
        tilt={n(v.tilt)}
        onRemove={b(v.removable) ? () => toast("Removed") : undefined}
      >
        {s(v.label) || "Tag"}
      </Tag>
    ),
    code: (v) =>
      `<Tag${v.status === "none" ? prop("tone", v.tone, "periwinkle") : prop("status", v.status)}${prop("pattern", v.pattern, "stripes")}${prop("tilt", v.tilt)}${b(v.removable) ? " onRemove={() => remove()}" : ""}>${s(v.label)}</Tag>`,
  },
  switch: {
    label: "Switch",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Share live location" },
      { kind: "select", name: "color", label: "Color when on", options: ["mint", "ink", "tomato"], default: "mint" },
      { kind: "boolean", name: "on", label: "Starts on", default: true },
      { kind: "boolean", name: "disabled", label: "Disabled", default: false },
    ],
    render: (v) => (
      <Switch key={`${v.on}`} defaultChecked={b(v.on)} color={s(v.color) as "mint"} disabled={b(v.disabled)}>
        {s(v.label)}
      </Switch>
    ),
    code: (v) => `<Switch${prop("defaultChecked", v.on, false)}${prop("color", v.color, "mint")}${prop("disabled", v.disabled, false)}>\n  ${s(v.label)}\n</Switch>`,
  },
  checkbox: {
    label: "Checkbox",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Notify my friends" },
      { kind: "boolean", name: "on", label: "Starts checked", default: true },
      { kind: "boolean", name: "indeterminate", label: "Indeterminate", default: false },
      { kind: "select", name: "tick", label: "Tick color", options: ["ink", "leaf", "tomato"], default: "ink" },
      { kind: "boolean", name: "disabled", label: "Disabled", default: false },
    ],
    render: (v) => (
      <Checkbox key={`${v.on}`} defaultChecked={b(v.on)} indeterminate={b(v.indeterminate)} disabled={b(v.disabled)} tickColor={v.tick === "ink" ? undefined : `var(--plop-${s(v.tick)})`}>
        {s(v.label)}
      </Checkbox>
    ),
    code: (v) =>
      `<Checkbox${prop("defaultChecked", v.on, false)}${prop("indeterminate", v.indeterminate, false)}${v.tick === "ink" ? "" : ` tickColor="var(--plop-${s(v.tick)})"`}${prop("disabled", v.disabled, false)}>\n  ${s(v.label)}\n</Checkbox>`,
  },
  "status-timeline": {
    label: "StatusTimeline",
    controls: [
      { kind: "text", name: "steps", label: "Steps (comma separated)", default: "Sketched, Inked, Colored, Shipped" },
      { kind: "number", name: "current", label: "Current step", default: 2, min: 0, max: 8, step: 1 },
      { kind: "select", name: "orientation", label: "Orientation", options: ["auto", "horizontal", "vertical"], default: "auto" },
    ],
    render: (v) => {
      const steps = s(v.steps).split(",").map((x) => x.trim()).filter(Boolean);
      return <StatusTimeline steps={steps.length ? steps : ["Step"]} current={n(v.current)} orientation={s(v.orientation) as "auto"} label="Preview progress" />;
    },
    code: (v) => {
      const steps = s(v.steps).split(",").map((x) => `"${x.trim()}"`).filter((x) => x !== '""');
      return `<StatusTimeline\n  steps={[${steps.join(", ")}]}\n  current={${n(v.current)}}${v.orientation !== "auto" ? `\n  orientation="${s(v.orientation)}"` : ""}\n/>`;
    },
  },
  callout: {
    label: "Callout",
    controls: [
      { kind: "select", name: "tone", label: "Tone", options: ["info", "warn", "error", "success"], default: "warn" },
      { kind: "text", name: "title", label: "Title", default: "Not saved yet" },
      { kind: "text", name: "body", label: "Text", default: "Save your sketch before you close the tab." },
      { kind: "boolean", name: "action", label: "With an action", default: false },
    ],
    render: (v) => (
      <div style={{ width: "min(560px, 100%)" }}>
        <Callout tone={s(v.tone) as "warn"} title={s(v.title)} action={b(v.action) ? <Button size="sm" variant="plain">Try again</Button> : undefined}>
          <p>{s(v.body)}</p>
        </Callout>
      </div>
    ),
    code: (v) =>
      `<Callout${prop("tone", v.tone, "info")} title="${s(v.title)}"${b(v.action) ? ' action={<Button size="sm" variant="plain">Try again</Button>}' : ""}>\n  ${s(v.body)}\n</Callout>`,
  },
  progress: {
    label: "Progress",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Syncing offline sketches" },
      { kind: "number", name: "value", label: "Value", default: 4, min: 0, max: 10, step: 1 },
      { kind: "select", name: "tone", label: "Tone", options: ["ink", "mint", "tomato"], default: "ink" },
      { kind: "boolean", name: "solid", label: "Solid fill", default: false },
    ],
    render: (v) => (
      <div style={{ width: "min(520px, 100%)" }}>
        <Progress label={s(v.label)} value={n(v.value)} max={10} valueText={`${n(v.value)} of 10`} tone={s(v.tone) as "ink"} solid={b(v.solid)} />
      </div>
    ),
    code: (v) => `<Progress label="${s(v.label)}" value={${n(v.value)}} max={10} valueText="${n(v.value)} of 10"${prop("tone", v.tone, "ink")}${prop("solid", v.solid, false)} />`,
  },
  avatar: {
    label: "Avatar",
    controls: [
      { kind: "text", name: "name", label: "Name (picks the face)", default: "Rosa Santos" },
      { kind: "select", name: "size", label: "Size", options: ["sm", "md", "lg", "xl"], default: "xl" },
      { kind: "select", name: "status", label: "Status", options: ["none", "online", "busy", "offline"], default: "online" },
      { kind: "number", name: "tilt", label: "Tilt", default: -4, min: -12, max: 12, step: 1 },
    ],
    render: (v) => <Avatar name={s(v.name) || "Someone"} size={s(v.size) as "xl"} status={v.status === "none" ? undefined : (s(v.status) as "online")} tilt={n(v.tilt)} />,
    code: (v) => `<Avatar name="${s(v.name)}"${prop("size", v.size, "md")}${v.status === "none" ? "" : prop("status", v.status)}${prop("tilt", v.tilt, 0)} />`,
  },
  "text-field": {
    label: "TextField",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Location" },
      { kind: "text", name: "placeholder", label: "Placeholder", default: "Untitled masterpiece" },
      { kind: "text", name: "hint", label: "Hint", default: "Shown above your sketch." },
      { kind: "text", name: "error", label: "Error (empty for none)", default: "" },
      { kind: "boolean", name: "success", label: "Success tick", default: false },
    ],
    render: (v) => (
      <div style={{ width: "min(420px, 100%)" }}>
        <TextField label={s(v.label) || "Label"} placeholder={s(v.placeholder)} hint={s(v.hint) || undefined} error={s(v.error) || undefined} success={b(v.success)} />
      </div>
    ),
    code: (v) =>
      `<TextField\n  label="${s(v.label)}"${v.placeholder ? `\n  placeholder="${s(v.placeholder)}"` : ""}${v.hint ? `\n  hint="${s(v.hint)}"` : ""}${v.error ? `\n  error="${s(v.error)}"` : ""}${b(v.success) ? "\n  success" : ""}\n/>`,
  },
  toast: {
    label: "Toast",
    controls: [
      { kind: "select", name: "kind", label: "Kind", options: ["success", "error", "info"], default: "success" },
      { kind: "text", name: "text", label: "Text", default: "Sketch posted" },
    ],
    render: (v) => (
      <div className="stack" style={{ justifyItems: "center", gap: 30 }}>
        <Toast kind={s(v.kind) as "success"}>{s(v.text)}</Toast>
        <Button size="sm" variant="plain" onClick={() => (v.kind === "info" ? toast(s(v.text)) : toast[s(v.kind) as "success"](s(v.text)))}>
          Show it for real
        </Button>
      </div>
    ),
    code: (v) => (v.kind === "info" ? `toast("${s(v.text)}");` : `toast.${s(v.kind)}("${s(v.text)}");`),
  },
  tooltip: {
    label: "Tooltip",
    controls: [
      { kind: "text", name: "content", label: "Tip", default: "Saves a copy" },
      { kind: "text", name: "label", label: "Button words", default: "Save" },
      { kind: "select", name: "side", label: "Side", options: ["top", "right", "bottom", "left"], default: "top" },
    ],
    render: (v) => (
      <Tooltip content={s(v.content) || "Tip"} side={s(v.side) as "top"} open>
        <Button size="sm" variant="plain">{s(v.label) || "Hover me"}</Button>
      </Tooltip>
    ),
    code: (v) => `<Tooltip content="${s(v.content)}"${prop("side", v.side, "top")}>\n  <Button size="sm" variant="plain">${s(v.label)}</Button>\n</Tooltip>`,
  },
  "radio-group": {
    label: "RadioGroup",
    controls: [
      { kind: "text", name: "legend", label: "Question", default: "Medium" },
      { kind: "text", name: "options", label: "Options (comma separated)", default: "Ink, Paint, Pencil" },
      { kind: "boolean", name: "vertical", label: "Stacked", default: false },
    ],
    render: (v) => {
      const o = items(v.options);
      return (
        <RadioGroup legend={s(v.legend) || "Pick one"} defaultValue={o[0]} vertical={b(v.vertical)} key={o.join()}>
          {o.map((x) => <Radio key={x} value={x}>{x}</Radio>)}
        </RadioGroup>
      );
    },
    code: (v) => `<RadioGroup legend="${s(v.legend)}" defaultValue="${items(v.options)[0]}"${b(v.vertical) ? "" : " vertical={false}"}>\n${items(v.options).map((x) => `  <Radio value="${x}">${x}</Radio>`).join("\n")}\n</RadioGroup>`,
  },
  tabs: {
    label: "Tabs",
    controls: [{ kind: "text", name: "labels", label: "Tabs (comma separated)", default: "Sketch, Ink, Color" }],
    render: (v) => {
      const t = items(v.labels);
      return (
        <Tabs defaultValue={t[0]} key={t.join()}>
          <TabList label="Sketch views">{t.map((x) => <Tab key={x} value={x}>{x}</Tab>)}</TabList>
          {t.map((x) => <TabPanel key={x} value={x}>The {x.toLowerCase()} step.</TabPanel>)}
        </Tabs>
      );
    },
    code: (v) => `<Tabs defaultValue="${items(v.labels)[0]}">\n  <TabList label="Sketch views">\n${items(v.labels).map((x) => `    <Tab value="${x}">${x}</Tab>`).join("\n")}\n  </TabList>\n${items(v.labels).map((x) => `  <TabPanel value="${x}">…</TabPanel>`).join("\n")}\n</Tabs>`,
  },
  "ticket-card": {
    label: "TicketCard",
    controls: [
      { kind: "text", name: "title", label: "Title", default: "Sketch #1042" },
      { kind: "text", name: "meta", label: "Meta", default: "9:14 AM" },
      { kind: "text", name: "body", label: "Words", default: "Rosa inked the café menu." },
      { kind: "number", name: "tilt", label: "Tilt", default: -1, min: -6, max: 6, step: 0.5 },
    ],
    render: (v) => <TicketCard title={s(v.title)} meta={s(v.meta) || undefined} tilt={n(v.tilt)} style={{ width: "min(340px, 100%)" }}>{s(v.body)}</TicketCard>,
    code: (v) => `<TicketCard title="${s(v.title)}"${v.meta ? ` meta="${s(v.meta)}"` : ""}${prop("tilt", v.tilt, -1)}>\n  ${s(v.body)}\n</TicketCard>`,
  },
  "unit-card": {
    label: "UnitCard",
    controls: [
      { kind: "text", name: "name", label: "Name", default: "Rosa Santos" },
      { kind: "text", name: "subtitle", label: "Subtitle", default: "Inker" },
    ],
    render: (v) => <UnitCard name={s(v.name)} subtitle={s(v.subtitle) || undefined} avatar={<Avatar name={s(v.name) || "Rosa"} size="md" />} style={{ width: "min(340px, 100%)" }} />,
    code: (v) => `<UnitCard name="${s(v.name)}"${v.subtitle ? ` subtitle="${s(v.subtitle)}"` : ""} avatar={<Avatar name="${s(v.name)}" size="md" />} />`,
  },
  "sticky-note": {
    label: "StickyNote",
    controls: [
      { kind: "text", name: "text", label: "Words", default: "Buy more ink!" },
      { kind: "select", name: "tone", label: "Paper", options: ["mustard", "mint", "pink"], default: "mustard" },
    ],
    render: (v) => <StickyNote tone={s(v.tone) as "mint"}>{s(v.text)}</StickyNote>,
    code: (v) => `<StickyNote tone="${s(v.tone)}">${s(v.text)}</StickyNote>`,
  },
  select: {
    label: "Select",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Brush" },
      { kind: "text", name: "options", label: "Options (comma separated)", default: "Ink pen, Watercolor, Charcoal" },
      { kind: "text", name: "placeholder", label: "Placeholder", default: "Pick a brush" },
      { kind: "boolean", name: "searchable", label: "Searchable", default: false },
    ],
    render: (v) => (
      <div style={{ width: "min(320px, 100%)" }}>
        <Select label={s(v.label) || "Pick"} placeholder={s(v.placeholder) || undefined} searchable={b(v.searchable)} options={toOptions(items(v.options))} />
      </div>
    ),
    code: (v) => `<Select\n  label="${s(v.label)}"\n  placeholder="${s(v.placeholder)}"${b(v.searchable) ? "\n  searchable" : ""}\n  options={${optionsCode(items(v.options))}}\n/>`,
  },
  "multi-select": {
    label: "MultiSelect",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Colors" },
      { kind: "text", name: "options", label: "Options (comma separated)", default: "Tomato, Mustard, Mint" },
      { kind: "text", name: "placeholder", label: "Placeholder", default: "Pick colors" },
    ],
    render: (v) => (
      <div style={{ width: "min(320px, 100%)" }}>
        <MultiSelect label={s(v.label) || "Pick"} placeholder={s(v.placeholder) || undefined} options={toOptions(items(v.options))} />
      </div>
    ),
    code: (v) => `<MultiSelect\n  label="${s(v.label)}"\n  placeholder="${s(v.placeholder)}"\n  options={${optionsCode(items(v.options))}}\n/>`,
  },
  menu: {
    label: "Menu",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Sketch actions" },
      { kind: "text", name: "items", label: "Items (comma separated)", default: "Rename, Duplicate, Delete" },
    ],
    render: (v) => <Menu label={s(v.label) || "More"} items={items(v.items).map((label) => ({ label, onSelect: () => toast(`${label}!`) }))} />,
    code: (v) => `<Menu\n  label="${s(v.label)}"\n  items={[\n${items(v.items).map((x) => `    { label: "${x}", onSelect: () => {} },`).join("\n")}\n  ]}\n/>`,
  },
  "text-area": {
    label: "TextArea",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Notes" },
      { kind: "text", name: "placeholder", label: "Placeholder", default: "What's it about?" },
      { kind: "boolean", name: "ruled", label: "Ruled lines", default: true },
    ],
    render: (v) => (
      <div style={{ width: "min(420px, 100%)" }}>
        <TextArea label={s(v.label) || "Notes"} placeholder={s(v.placeholder)} ruled={b(v.ruled)} rows={4} />
      </div>
    ),
    code: (v) => `<TextArea label="${s(v.label)}" placeholder="${s(v.placeholder)}"${b(v.ruled) ? " ruled" : ""} rows={4} />`,
  },
  "search-field": {
    label: "SearchField",
    controls: [
      { kind: "text", name: "label", label: "Label", default: "Search sketches" },
      { kind: "text", name: "placeholder", label: "Placeholder", default: "Find a sketch" },
    ],
    render: (v) => (
      <div style={{ width: "min(420px, 100%)" }}>
        <SearchField label={s(v.label) || "Search"} placeholder={s(v.placeholder)} />
      </div>
    ),
    code: (v) => `<SearchField label="${s(v.label)}" placeholder="${s(v.placeholder)}" />`,
  },
  "status-dot": {
    label: "StatusDot",
    controls: [
      { kind: "text", name: "label", label: "Words", default: "Inking now" },
      { kind: "select", name: "tone", label: "Status", options: ["online", "busy", "offline"], default: "online" },
    ],
    render: (v) => <StatusDot tone={s(v.tone) as "online"}>{s(v.label)}</StatusDot>,
    code: (v) => `<StatusDot tone="${s(v.tone)}">${s(v.label)}</StatusDot>`,
  },
  heading: {
    label: "Heading",
    controls: [
      { kind: "text", name: "text", label: "Words", default: "Sketchbook" },
      { kind: "select", name: "level", label: "Level", options: ["1", "2", "3", "4"], default: "2" },
      { kind: "boolean", name: "scribble", label: "Scribble underline", default: true },
    ],
    render: (v) => <Heading level={Number(v.level) as 2} scribble={b(v.scribble)}>{s(v.text)}</Heading>,
    code: (v) => `<Heading level={${s(v.level)}}${b(v.scribble) ? " scribble" : ""}>${s(v.text)}</Heading>`,
  },
};

const IMPORTS: Record<string, string> = {
  button: "Button",
  "icon-button": "IconButton",
  tag: "Tag",
  switch: "Switch",
  checkbox: "Checkbox",
  "status-timeline": "StatusTimeline",
  callout: "Callout",
  progress: "Progress",
  avatar: "Avatar",
  "text-field": "TextField",
  toast: "toast",
  tooltip: "Button, Tooltip",
  "radio-group": "Radio, RadioGroup",
  tabs: "Tab, TabList, TabPanel, Tabs",
  "ticket-card": "TicketCard",
  "unit-card": "Avatar, UnitCard",
  "sticky-note": "StickyNote",
  select: "Select",
  "multi-select": "MultiSelect",
  menu: "Menu",
  "text-area": "TextArea",
  "search-field": "SearchField",
  "status-dot": "StatusDot",
  heading: "Heading",
};

/** "Ink, Paint" → ["Ink", "Paint"]. */
const items = (v: Value | undefined) => {
  const list = s(v).split(",").map((x) => x.trim()).filter(Boolean);
  return list.length ? list : ["One", "Two"];
};
const toOptions = (list: string[]) => list.map((label) => ({ value: label.toLowerCase().replace(/\s+/g, "-"), label }));
const optionsCode = (list: string[]) => `[${toOptions(list).map((o) => `{ value: "${o.value}", label: "${o.label}" }`).join(", ")}]`;

const defaults = (entry: Entry): Values => Object.fromEntries(entry.controls.map((c) => [c.name, c.default]));

/* ------------------------------------------------------------- the editor */

function ControlField({ control, value, onChange }: { control: Control; value: Value; onChange: (v: Value) => void }) {
  switch (control.kind) {
    case "select":
      return control.options.length <= 6 ? (
        <RadioGroup legend={control.label} value={s(value)} onValueChange={onChange} vertical={false}>
          {control.options.map((o) => (
            <Radio key={o} value={o}>
              {o}
            </Radio>
          ))}
        </RadioGroup>
      ) : (
        // Long lists use the kit's own Select.
        <Select label={control.label} size="sm" value={s(value)} onValueChange={onChange} options={control.options.map((o) => ({ value: o, label: o }))} />
      );
    case "boolean":
      return (
        <Switch checked={b(value)} onCheckedChange={onChange}>
          {control.label}
        </Switch>
      );
    case "text":
      return <TextField label={control.label} value={s(value)} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <label className="pg-range">
          <span>
            {control.label} <output>{n(value)}</output>
          </span>
          {/* Named on the input itself: the wrapping label's <output> kept browsers from naming it. */}
          <input type="range" aria-label={control.label} min={control.min} max={control.max} step={control.step} value={n(value)} onChange={(e) => onChange(Number(e.target.value))} />
        </label>
      );
  }
}

export function Playground() {
  const params = useSearchParams();
  const initial = params.get("c") && ENTRIES[params.get("c")!] ? params.get("c")! : "button";
  const [component, setComponent] = useState(initial);
  const [values, setValues] = useState<Values>(() => defaults(ENTRIES[initial]!));
  const [surface, setSurface] = useState<SurfaceName>(() => (surfaceNames.includes(params.get("surface") as SurfaceName) ? (params.get("surface") as SurfaceName) : "poster"));
  const [theme, setTheme] = useState<"light" | "dark">(params.get("theme") === "dark" ? "dark" : "light");
  const [roundness, setRoundness] = useState(1);
  const entry = ENTRIES[component]!;

  // Keep the address shareable: component, surface and theme.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("c", component);
    url.searchParams.set("surface", surface);
    url.searchParams.set("theme", theme);
    window.history.replaceState(null, "", url);
  }, [component, surface, theme]);

  const code = useMemo(() => {
    const name = IMPORTS[component]!;
    if (roundness === 1) return `import { ${name} } from "@plop-ui/react";\n\n${entry.code(values)}`;
    // Roundness lives on the provider (or --plop-roundness in CSS), so the snippet shows it wrapped.
    return `import { PlopProvider, ${name} } from "@plop-ui/react";\n\n<PlopProvider roundness={${roundness}}>\n  ${entry.code(values).replace(/\n/g, "\n  ")}\n</PlopProvider>`;
  }, [component, entry, values, roundness]);

  const pick = (id: string) => {
    setComponent(id);
    setValues(defaults(ENTRIES[id]!));
  };

  return (
    <div className="pg">
      <nav className="pg-picker" aria-label="Components">
        <div className="doc-nav__label">Component</div>
        <ul>
          {Object.entries(ENTRIES).map(([id, e]) => (
            <li key={id}>
              <button type="button" aria-pressed={component === id} onClick={() => pick(id)}>
                {e.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pg-main">
        <div className="pg-toolbar">
          <RadioGroup legend="Surface" value={surface} onValueChange={(v) => setSurface(v as SurfaceName)} vertical={false}>
            {surfaceNames.map((sn) => (
              <Radio key={sn} value={sn}>
                {surfaces[sn].label}
              </Radio>
            ))}
          </RadioGroup>
          <label className="pg-range pg-radius">
            <span>
              Radius <output>{roundness}×</output>
            </span>
            <input type="range" aria-label="Radius" min={0} max={2} step={0.1} value={roundness} onChange={(e) => setRoundness(Number(e.target.value))} />
          </label>
          <Switch checked={theme === "dark"} onCheckedChange={(on) => setTheme(on ? "dark" : "light")} color="ink">
            Dark
          </Switch>
        </div>

        <section aria-label={`${entry.label} preview`} className="pg-preview">
          <PlopProvider surface={surface} theme={theme} toaster={false} roundness={roundness} className="pg-stage">
            {entry.render(values)}
          </PlopProvider>
        </section>

        <div className="pg-panels">
          <section className="pg-controls" aria-label="Props">
            <h2 className="pg-h">Props</h2>
            <div className="pg-controls__list">
              {entry.controls.map((c) => (
                <div key={`${component}-${c.name}`} className="pg-control">
                  <ControlField control={c} value={values[c.name] ?? c.default} onChange={(v) => setValues((cur) => ({ ...cur, [c.name]: v }))} />
                </div>
              ))}
            </div>
            <Button size="sm" variant="plain" onClick={() => setValues(defaults(entry))}>
              Reset props
            </Button>
          </section>

          <section className="pg-code" aria-label="Code">
            <div className="pg-code__bar">
              <h2 className="pg-h">Code</h2>
              <Button
                size="sm"
                variant="mustard"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code);
                    toast.success("Code copied");
                  } catch {
                    toast.error("Couldn't copy. Select it instead.");
                  }
                }}
              >
                Copy code
              </Button>
            </div>
            <pre tabIndex={0}>
              <code>{code}</code>
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
