"use client";

/**
 * Live demos for the docs pages. MDX pages are Server Components; anything
 * that needs state or event handlers lives here.
 */
import {
  BellIcon,
  Button,
  Checkbox,
  CloseIcon,
  IconButton,
  onColor,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  StatusTimeline,
  Switch,
  Tag,
  useBoil,
  useHaptics,
  type TagTone,
} from "@plop-ui/react";
import { color } from "@plop-ui/tokens";
import Link from "next/link";
import { useState } from "react";

export function HeroActions() {
  const [sent, setSent] = useState(false);
  return (
    <div className="hero__actions">
      <Button size="lg" tilt={-3} buddy onClick={() => setSent(true)}>
        {sent ? "Report sent!" : "Send report"}
      </Button>
      <Link href="/docs/getting-started" style={{ fontSize: 20 }}>
        Read the docs →
      </Link>
    </div>
  );
}

export function ButtonHero() {
  return (
    <div style={{ display: "grid", justifyItems: "center", padding: "40px 0 20px" }}>
      <Button size="lg" tilt={-3} buddy>
        Send report
      </Button>
    </div>
  );
}

export function ButtonVariants() {
  return (
    <div className="row">
      <Button variant="ink" seed="v1">Save changes</Button>
      <Button variant="periwinkle" seed="v2">Add note</Button>
      <Button variant="mint" seed="v3">Mark resolved</Button>
      <Button variant="tomato" seed="v4">Cancel dispatch</Button>
      <Button variant="mustard" seed="v5">Call back</Button>
      <Button variant="plain" seed="v6">Skip for now</Button>
      <Button variant="periwinkle" disabled seed="v7">Archived</Button>
    </div>
  );
}

export function ButtonSizes() {
  return (
    <div className="row">
      <Button size="sm" iconLeft={<PinIcon />}>Share pin</Button>
      <Button iconLeft={<BellIcon />}>Page unit</Button>
      <Button size="lg">Dispatch</Button>
    </div>
  );
}

export function ButtonLoading() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="row">
      <Button
        loading={saving}
        loadingLabel="Saving"
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1600);
        }}
      >
        Save changes
      </Button>
      <span className="cap">{saving ? "aria-busy=\"true\" while saving" : "Press to try the loading state"}</span>
    </div>
  );
}

export function IconButtons() {
  return (
    <div className="row">
      <IconButton icon={<PlusIcon />} label="New incident" variant="mustard" tilt={6} />
      <IconButton icon={<PhoneIcon />} label="Start SOS call" variant="tomato" tilt={-5} />
      <IconButton icon={<CloseIcon />} label="Close" variant="plain" size="sm" tilt={4} />
      <IconButton icon={<BellIcon />} label="Page unit" size="lg" tilt={-2} />
    </div>
  );
}

export function TagStatuses() {
  return (
    <div className="row">
      <Tag status="critical">Critical</Tag>
      <Tag status="dispatched">Dispatched</Tag>
      <Tag status="en-route">En route</Tag>
      <Tag status="resolved">Resolved</Tag>
      <Tag status="unassigned">Unassigned</Tag>
      <Tag tone="bubblegum" pattern="dots">Dots</Tag>
      <Tag tone="mint" pattern="grid">Grid</Tag>
    </div>
  );
}

export function TagFilters() {
  const initial: Array<[string, TagTone]> = [
    ["Barangay 3", "bubblegum"],
    ["Last 24 hours", "periwinkle"],
    ["Fire", "mint"],
  ];
  const [tags, setTags] = useState(initial);
  return (
    <div className="row" style={{ minHeight: 44 }}>
      {tags.map(([t, tone]) => (
        <Tag key={t} tone={tone} pattern={tone === "bubblegum" ? "dots" : tone === "mint" ? "grid" : "stripes"} onRemove={() => setTags((all) => all.filter(([x]) => x !== t))}>
          {t}
        </Tag>
      ))}
      {tags.length === 0 && (
        <>
          <span className="cap">All filters cleared.</span>
          <Button size="sm" variant="plain" onClick={() => setTags(initial)}>
            Put them back
          </Button>
        </>
      )}
    </div>
  );
}

export function Switches() {
  const [sharing, setSharing] = useState(true);
  return (
    <div className="stack">
      <Switch checked={sharing} onCheckedChange={setSharing}>
        Share live location {sharing ? "(on)" : "(off)"}
      </Switch>
      <Switch color="ink">Night mode for dispatch console</Switch>
      <Switch color="tomato">Silence non-critical alerts</Switch>
      <Switch disabled>Auto-assign (needs admin)</Switch>
    </div>
  );
}

export function Checkboxes() {
  const people = ["Responders on shift", "Barangay captain", "Caller, by SMS"];
  const [picked, setPicked] = useState<string[]>(["Responders on shift"]);
  const all = picked.length === people.length;
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 14 }}>
      <legend style={{ fontStyle: "italic", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Notify on dispatch</legend>
      <Checkbox checked={all} indeterminate={!all && picked.length > 0} onCheckedChange={(c) => setPicked(c ? people : [])}>
        Everyone
      </Checkbox>
      {people.map((p) => (
        <Checkbox
          key={p}
          style={{ marginLeft: 32 }}
          checked={picked.includes(p)}
          tickColor={p === "Caller, by SMS" ? "var(--plop-leaf)" : undefined}
          onCheckedChange={(c) => setPicked((cur) => (c ? [...cur, p] : cur.filter((x) => x !== p)))}
        >
          {p}
        </Checkbox>
      ))}
      <Checkbox disabled>Provincial office (off hours)</Checkbox>
    </fieldset>
  );
}

const steps = ["Reported", "Dispatched", "En route", "Resolved"];
const times = ["9:02 AM", "9:04 AM", "9:05 AM", "9:17 AM"];

export function TimelineDemo({ orientation = "auto" }: { orientation?: "auto" | "horizontal" | "vertical" }) {
  const [current, setCurrent] = useState(2);
  return (
    <div style={{ display: "grid", gap: 34 }}>
      <StatusTimeline
        steps={steps}
        current={current}
        orientation={orientation}
        label="Incident progress"
        times={steps.map((_, i) => (i < current ? times[i] : i === current ? (i === 2 ? "6 min away" : "Now") : "Waiting"))}
      />
      <div className="row" style={{ gap: 18 }}>
        <Button size="sm" disabled={current >= steps.length} onClick={() => setCurrent((c) => c + 1)}>
          Next step
        </Button>
        <Button size="sm" variant="plain" onClick={() => setCurrent(0)}>
          Start over
        </Button>
      </div>
    </div>
  );
}

export function TryOnColor() {
  const [fill, setFill] = useState("#7FB3E8");
  const on = onColor(fill);
  return (
    <div className="row">
      <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} style={{ width: 48, height: 40 }} />
        Pick any fill
      </label>
      <span style={{ background: fill, color: on.color, padding: "8px 16px", fontStyle: "italic", fontWeight: 700, textTransform: "uppercase" }}>Auto contrast</span>
      <span aria-live="polite">
        Text: {on.color === "#1C2E8C" ? "deep ink" : "cream"}, {on.ratio.toFixed(1)}:1 {on.passesAA ? "AA" : "fails AA"}
      </span>
    </div>
  );
}

export function BoilDemo() {
  const [active, setActive] = useState(true);
  const boil = useBoil({ seed: "star", active });
  return (
    <div className="row">
      <svg width="110" height="110" viewBox="0 0 120 120" style={boil} aria-hidden="true">
        <path d="M60 10 L 74 44 L 110 46 L 82 68 L 92 104 L 60 84 L 28 104 L 38 68 L 10 46 L 46 44 Z" fill={color.mustard} stroke={color.ink} strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <Button size="sm" variant="plain" onClick={() => setActive((a) => !a)}>
        {active ? "Hold still" : "Boil"}
      </Button>
    </div>
  );
}

export function HapticsDemo() {
  const h = useHaptics();
  return (
    <div className="row">
      <Button size="sm" onClick={h.tap}>Tap</Button>
      <Button size="sm" variant="mint" onClick={h.success}>Success</Button>
      <Button size="sm" variant="tomato" onClick={h.error}>Error</Button>
      <span className="cap">Try it on an Android phone or an iPhone (iOS 18+).</span>
    </div>
  );
}
