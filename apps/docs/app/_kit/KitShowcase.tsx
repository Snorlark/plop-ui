"use client";

/**
 * The v0.6 prototype page, rebuilt from @plop-ui/react components.
 * Same sections, same copy, same behavior, but every piece is the real library.
 */
import {
  Avatar,
  AvatarStack,
  BellIcon,
  Button,
  Callout,
  Checkbox,
  CloseIcon,
  contrastRatio,
  Count,
  EmptyState,
  Eta,
  Heading,
  IconButton,
  InfoIcon,
  onColor,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  Progress,
  Radio,
  RadioGroup,
  Sheet,
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
  toast,
  Tooltip,
  UnitCard,
  UnitCardRow,
  useHaptics,
} from "@plop-ui/react";
import { color } from "@plop-ui/tokens";
import { useState, type ReactNode } from "react";
import { useFeedback } from "./Providers";

function Section({ id, title, lede, children, code, tape }: { id: string; title: string; lede: string; children: ReactNode; code?: string; tape?: "mustard" | "periwinkle" | "bubblegum" | "mint" }) {
  return (
    <section className="sec" id={id} aria-labelledby={`h-${id}`}>
      <div className="sec__head">
        <Heading id={`h-${id}`}>{title}</Heading>
        <p>{lede}</p>
      </div>
      <Sheet tape={tape}>{children}</Sheet>
      {code && (
        <pre tabIndex={0}>
          <code>{code}</code>
        </pre>
      )}
    </section>
  );
}

/* ---------------- Tokens ---------------- */

const PALETTE: Array<[string, string, number]> = [
  ["Cobalt ink", color.ink, -6],
  ["Tomato", color.tomato, 4],
  ["Mustard", color.mustard, -3],
  ["Bubblegum", color.bubblegum, 7],
  ["Periwinkle", color.periwinkle, -8],
  ["Mint", color.mint, 3],
  ["Paper", color.paper, 5],
];

const ROLES: Array<[string, string, string, string]> = [
  ["Ink", color.ink, color.onInk, "--plop-on-fill-ink"],
  ["Tomato", color.tomato, color.onInk, "--plop-on-fill-tomato"],
  ["Periwinkle", color.periwinkle, color.inkText, "--plop-on-fill-periwinkle"],
  ["Mint", color.mint, color.inkText, "--plop-on-fill-mint"],
  ["Mustard", color.mustard, color.inkText, "--plop-on-fill-mustard"],
  ["Bubblegum", color.bubblegum, color.inkText, "--plop-on-fill-bubblegum"],
  ["Paper", color.paper, color.ink, "--plop-ink"],
  ["Sheet, soft", color.sheet, color.inkSoft, "--plop-ink-soft"],
];

const grade = (r: number) => (r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large" : "Fails");

function Tokens() {
  const [fill, setFill] = useState("#7FB3E8");
  const on = onColor(fill);
  return (
    <Section
      id="tokens"
      title="Tokens"
      lede="One cobalt marker for every line. A few spot colors picked by gut, printed underneath and slightly off. One hand-drawn font family, Sketchpop: slanted for lettering, upright for reading."
    >
      <h3 className="sub">Color</h3>
      <div className="palette">
        {PALETTE.map(([name, c, r]) => (
          <div className="chip" key={name}>
            <span className="chip__dot" style={{ ["--c" as string]: c, ["--r" as string]: `${r}deg` }} />
            <strong>{name}</strong>
            <span>{c}</span>
          </div>
        ))}
      </div>
      <h3 className="sub" style={{ marginTop: 44 }}>
        Contrast roles
      </h3>
      <p className="cap" style={{ maxWidth: "60ch", fontSize: 17, marginTop: -4 }}>
        Like Material’s “on” colors: every fill comes with the text color that reads on it. The bright blue draws lines; a deeper blue carries text.
      </p>
      <div className="roles">
        {ROLES.map(([name, bg, fg, role]) => {
          const r = contrastRatio(fg, bg);
          return (
            <div className="role" key={name} style={{ ["--rf" as string]: bg, ["--rt" as string]: fg }}>
              <span className="role__aa" aria-hidden="true">
                Aa
              </span>
              <strong>{name}</strong>
              <span className="role__pair">{role}</span>
              <span className="role__ratio">
                {r.toFixed(1)}:1 {grade(r)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="tryit">
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 17, color: "var(--plop-ink-text)", cursor: "pointer" }}>
          <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} style={{ width: 48, height: 40, padding: 0, border: "2.5px solid var(--plop-ink)", borderRadius: 10 }} />
          Pick any fill color
        </label>
        <span style={{ background: fill, color: on.color, padding: "6px 16px", fontStyle: "italic", fontWeight: 700, textTransform: "uppercase", fontSize: 13, letterSpacing: ".05em", transform: "rotate(-2deg)", display: "inline-block" }}>
          Auto contrast
        </span>
        <Button size="sm" tilt={2} style={{ ["--fill" as string]: fill, ["--label" as string]: on.color }}>
          Try me
        </Button>
        <span aria-live="polite" className="cap" style={{ fontSize: 16 }}>
          Text switched to {on.color === "#1C2E8C" ? "deep ink" : "cream"}: {on.ratio.toFixed(1)}:1, {grade(on.ratio)}
        </span>
      </div>
      <h3 className="sub" style={{ marginTop: 44 }}>
        Type
      </h3>
      <div className="typespec">
        <span className="big" aria-hidden="true">
          Aa
        </span>
        <p className="ts-1">Sketchpop Bold Italic for anything lettered</p>
        <p className="ts-2">Sketchpop Regular, upright, for everything people actually read.</p>
        <p className="ts-3">One family, 4 weights, italic and upright. Every letter has 3 hand-drawn versions that rotate, so repeats never look copy-pasted.</p>
      </div>
      <div className="principles">
        <div>
          <strong>One ink</strong>Every outline, letter and face is the same cobalt marker. Color is a second ink printed under it, a little off-register.
        </div>
        <div>
          <strong>Stickers, not boxes</strong>Things you press are die-cut stickers with a paper border and a real shadow. Everything else is paper, tape, and ink.
        </div>
        <div>
          <strong>Imperfect on purpose</strong>Outlines boil, fills print off-register, nothing sits at exactly 0°. Randomness is seeded, so it stays put.
        </div>
        <div>
          <strong>Every press answers</strong>Squish on press, spring on release, a buzz on phones. Motion only happens when someone acts.
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Button ---------------- */

function Buttons() {
  const haptics = useHaptics();
  const [saving, setSaving] = useState(false);
  return (
    <Section
      id="button"
      title="Button"
      lede="The hero sticker. Peels on hover, squishes on press, springs back with an ink burst. Add a buddy for the one action that matters most on a screen."
      code={`// one component, tilt and color are props
<Button variant="ink" size="lg" tilt={-3} buddy>Send report</Button>
<Button variant="tomato" loading={saving}>Cancel dispatch</Button>
<IconButton icon={<PhoneIcon />} label="Start SOS call" />`}
    >
      <div style={{ display: "grid", justifyItems: "center", padding: "30px 0 46px" }}>
        <Button
          size="lg"
          tilt={-3}
          buddy
          onClick={() => {
            haptics.success();
            toast.success("Report sent");
          }}
        >
          Send report
        </Button>
      </div>
      <h3 className="sub">Variants</h3>
      <div className="specimens">
        <div className="spec">
          <Button
            tilt={-2}
            loading={saving}
            loadingLabel="Saving"
            onClick={() => {
              setSaving(true);
              setTimeout(() => {
                setSaving(false);
                haptics.success();
                toast.success("Changes saved");
              }, 1500);
            }}
          >
            Save changes
          </Button>
          <span className="cap">Cobalt, with loading</span>
        </div>
        <div className="spec">
          <Button variant="periwinkle" tilt={1.5} onClick={() => toast("Note added")}>
            Add note
          </Button>
          <span className="cap">Periwinkle</span>
        </div>
        <div className="spec">
          <Button variant="mint" tilt={-1} onClick={() => toast.success("Marked resolved")}>
            Mark resolved
          </Button>
          <span className="cap">Mint</span>
        </div>
        <div className="spec">
          <Button
            variant="tomato"
            tilt={2}
            onClick={() => {
              haptics.error();
              toast.error("Dispatch cancelled");
            }}
          >
            Cancel dispatch
          </Button>
          <span className="cap">Tomato, destructive</span>
        </div>
        <div className="spec">
          <Button variant="plain" tilt={-1.5}>
            Skip for now
          </Button>
          <span className="cap">Plain</span>
        </div>
        <div className="spec">
          <Button variant="periwinkle" tilt={2.5} disabled>
            Archived
          </Button>
          <span className="cap">Disabled, half-peeled</span>
        </div>
      </div>
      <h3 className="sub" style={{ marginTop: 46 }}>
        Sizes and icons
      </h3>
      <div className="row">
        <Button size="sm" tilt={-2} iconLeft={<PinIcon />}>
          Share pin
        </Button>
        <Button size="sm" variant="mustard" tilt={2} iconLeft={<PhoneIcon />}>
          Call back
        </Button>
        <Button tilt={-1} iconLeft={<BellIcon />}>
          Page unit
        </Button>
        <IconButton variant="mustard" tilt={6} icon={<PlusIcon />} label="New incident" />
        <IconButton variant="tomato" tilt={-5} icon={<PhoneIcon />} label="Start SOS call" />
        <IconButton variant="plain" size="sm" tilt={4} icon={<CloseIcon />} label="Close" />
      </div>
    </Section>
  );
}

/* ---------------- Tooltip ---------------- */

function Tooltips() {
  return (
    <Section id="tooltip" title="Tooltip" lede="A speech bubble that pops out of whatever it explains. Opens on hover and keyboard focus.">
      <div className="row" style={{ paddingTop: 80, justifyContent: "space-around" }}>
        <Tooltip content="Priority sets who gets paged first.">
          <IconButton variant="plain" size="sm" tilt={-4} icon={<InfoIcon size={22} />} label="What does priority do?" burst={false} />
        </Tooltip>
        <Tooltip content="GPS accuracy is ±200 m. Ask the caller for a landmark." open>
          <button type="button" className="bare">
            <Tag tone="mustard" tilt={-2}>
              Approx. location
            </Tag>
          </button>
        </Tooltip>
        <Tooltip content="Sends your live location for 30 minutes." side="right">
          <Button size="sm" tilt={2} iconLeft={<PinIcon />}>
            Share pin
          </Button>
        </Tooltip>
      </div>
    </Section>
  );
}

/* ---------------- Switch ---------------- */

function Switches() {
  return (
    <Section
      id="switch"
      title="Switch"
      lede="The knob is a little face. It sleeps when off and wakes up when you flip it on."
      code={`<Switch checked={sharing} onCheckedChange={setSharing} color="mint">Share live location</Switch>`}
    >
      <div className="stack">
        <Switch defaultChecked>Share live location</Switch>
        <Switch color="ink">Night mode for dispatch console</Switch>
        <Switch color="tomato">Silence non-critical alerts</Switch>
        <Switch disabled>Auto-assign (needs admin)</Switch>
      </div>
    </Section>
  );
}

/* ---------------- Checkbox & radio ---------------- */

function Checkboxes() {
  return (
    <Section id="checkbox" title="Checkbox & radio" lede="Ticks are drawn in one stroke and overshoot the box, like a pen would. Radios fill with an ink blob.">
      <div className="row" style={{ alignItems: "flex-start", gap: "40px 70px" }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: 14 }}>
          <legend className="sub" style={{ margin: "0 0 12px" }}>
            Notify on dispatch
          </legend>
          <Checkbox defaultChecked>Responders on shift</Checkbox>
          <Checkbox>Barangay captain</Checkbox>
          <Checkbox defaultChecked tickColor="var(--plop-leaf)">
            Caller, by SMS
          </Checkbox>
          <Checkbox disabled>Provincial office (off hours)</Checkbox>
        </fieldset>
        <RadioGroup legend="Priority" defaultValue="medium">
          <Radio value="low" dotColor="var(--plop-ink)">
            Low
          </Radio>
          <Radio value="medium" dotColor="var(--plop-mustard)">
            Medium
          </Radio>
          <Radio value="high" dotColor="var(--plop-tomato)">
            High, page everyone
          </Radio>
        </RadioGroup>
      </div>
    </Section>
  );
}

/* ---------------- Text field ---------------- */

function Fields() {
  return (
    <Section
      id="field"
      title="Text field"
      lede="Focus swipes a highlighter across the label and makes the outline boil. Errors switch to tomato ink and say how to fix it."
      code={`<TextField label="Location" error="Add a street, barangay, or landmark…" />
<TextArea label="What happened?" ruled />`}
    >
      <div className="fields">
        <TextField label="Caller name" placeholder="e.g. Maria Santos" hint="Optional. Anonymous reports are fine." autoComplete="off" />
        <TextField label="Location" error="Add a street, barangay, or landmark so responders can find it." autoComplete="off" />
        <TextField label="Callback number" defaultValue="0917 555 0142" inputMode="tel" success hint="Looks good." autoComplete="off" />
        <TextArea className="field--wide" label="What happened?" placeholder="Write it like you’d say it on the phone." />
      </div>
    </Section>
  );
}

/* ---------------- Tags & badges ---------------- */

function Tags() {
  const initial = [
    { label: "Barangay 3", tone: "bubblegum" as const, pattern: "dots" as const },
    { label: "Last 24 hours", tone: "periwinkle" as const, pattern: "stripes" as const },
    { label: "Fire", tone: "mint" as const, pattern: "grid" as const },
  ];
  const [filters, setFilters] = useState(initial);
  return (
    <Section
      id="tags"
      title="Tags & badges"
      lede="Status labels are strips of washi tape. Removable tags peel off when you dismiss them."
      code={`<Tag tone="mustard" pattern="stripes">En route</Tag>
<Tag onRemove={() => clear("brgy-3")}>Barangay 3</Tag>`}
    >
      <h3 className="sub">Status</h3>
      <div className="row">
        <Tag status="critical" tilt={-3}>Critical</Tag>
        <Tag status="dispatched" tilt={2}>Dispatched</Tag>
        <Tag status="en-route" tilt={-1}>En route</Tag>
        <Tag status="resolved" tilt={3}>Resolved</Tag>
        <Tag status="unassigned" tilt={-2}>Unassigned</Tag>
      </div>
      <h3 className="sub">Patterns</h3>
      <div className="row">
        <Tag tone="bubblegum" pattern="dots" tilt={2}>Dots</Tag>
        <Tag tone="mint" pattern="grid" tilt={-3}>Grid</Tag>
        <Tag tone="mustard" tilt={1}>Stripes</Tag>
      </div>
      <h3 className="sub">Removable filters</h3>
      <div className="row" style={{ minHeight: 40 }}>
        {filters.map((f, i) => (
          <Tag key={f.label} tone={f.tone} pattern={f.pattern} tilt={[-2, 2, -1][i]} onRemove={() => setFilters((all) => all.filter((x) => x.label !== f.label))}>
            {f.label}
          </Tag>
        ))}
        {filters.length === 0 && (
          <>
            <span className="cap">All filters cleared.</span>
            <Button size="sm" variant="plain" onClick={() => setFilters(initial)}>
              Put them back
            </Button>
          </>
        )}
      </div>
      <h3 className="sub">Counts and dots</h3>
      <div className="row">
        <Count label="3 unread">3</Count>
        <Count label="12 queued" tone="ink">12</Count>
        <StatusDot tone="online">Online</StatusDot>
        <StatusDot tone="busy">On a call</StatusDot>
        <StatusDot tone="offline">Offline</StatusDot>
      </div>
    </Section>
  );
}

/* ---------------- Avatar ---------------- */

const CREW: Array<[string, string]> = [
  ["Rosa Santos", "Dispatcher"],
  ["Jun Reyes", "Mobile 2"],
  ["Mika Tan", "Medic"],
  ["Ben Ocampo", "Fire unit"],
  ["Ana Cruz", "Front desk"],
  ["Paolo Lim", "Barangay 3"],
  ["Carla Diaz", "Mobile 5"],
  ["Nico Ramos", "IT support"],
];

function Avatars() {
  return (
    <Section id="avatar" title="Avatar" lede="Doodle faces generated from a name, so the same person always gets the same face. Real photos can drop in too.">
      <div className="crew">
        {CREW.map(([name, role], i) => (
          <figure key={name}>
            <Avatar name={name} size="xl" tilt={i % 2 ? 4 : -5} />
            <figcaption>
              <strong>{name.split(" ")[0]}</strong>
              <small>{role}</small>
            </figcaption>
          </figure>
        ))}
      </div>
      <h3 className="sub" style={{ marginTop: 44 }}>
        Sizes, status and groups
      </h3>
      <div className="row" style={{ gap: "28px 34px" }}>
        <Avatar name="Rosa Santos" size="lg" />
        <Avatar name="Jun Reyes" status="online" />
        <Avatar name="Ana Cruz" status="busy" statusLabel="on a call" />
        <Avatar name="Leo Garcia" size="sm" />
        <AvatarStack names={["Rosa Santos", "Jun Reyes", "Ana Cruz", "Mika Tan", "Ben Ocampo", "Paolo Lim", "Carla Diaz"]} />
      </div>
    </Section>
  );
}

/* ---------------- Cards ---------------- */

function Cards() {
  return (
    <Section id="cards" title="Cards" lede="Three paper objects for three jobs: a ticket stub for queue items, a taped unit card for people, a sticky note for quick context.">
      <div className="kit-cards">
        <TicketCard meta="Ticket #1042, 9:14 AM" title="Printer on 3F jams on every second page" stub="Open">
          <Tag tone="mustard" tilt={-2}>Medium</Tag>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Avatar name="Leo Garcia" size="sm" />
            Leo
          </span>
        </TicketCard>
        <UnitCard name="Mobile 2" subtitle="PO2 Jun Reyes, 2 riders" avatar={<Avatar name="Jun Reyes" status="online" />}>
          <UnitCardRow>
            <Tag status="en-route" tilt={-2}>En route</Tag>
            <Eta value={6} unit="min away" />
          </UnitCardRow>
          <UnitCardRow>
            <Button size="sm" tilt={-1.5} iconLeft={<PhoneIcon />}>
              Call unit
            </Button>
            <Button size="sm" variant="plain" tilt={2} iconLeft={<PinIcon />}>
              Track
            </Button>
          </UnitCardRow>
        </UnitCard>
        <StickyNote footer="Added by dispatcher Ana, 9:06 AM">Caller says the front gate is locked. Use the side entrance by the sari-sari store.</StickyNote>
      </div>
    </Section>
  );
}

/* ---------------- Tabs ---------------- */

function TabsDemo() {
  return (
    <Section id="tabs" title="Tabs" lede="Index-card dividers. The active one comes forward and joins the page. Arrow keys move between them.">
      <Tabs defaultValue="active">
        <TabList label="Incident queue">
          <Tab value="active" badge={<Count label="3 active" size="sm">3</Count>}>
            Active
          </Tab>
          <Tab value="resolved">Resolved</Tab>
          <Tab value="flagged">Flagged</Tab>
        </TabList>
        <TabPanel value="active">
          <ul className="list">
            <li>
              <span><strong>Flooding, Purok 4</strong><span className="when">2 min ago</span></span>
              <Tag status="critical" tilt={-2}>Critical</Tag>
            </li>
            <li>
              <span><strong>Road accident, Maharlika Hwy</strong><span className="when">9 min ago</span></span>
              <Tag status="en-route" tilt={2}>En route</Tag>
            </li>
            <li>
              <span><strong>Noise complaint, Brgy. 3</strong><span className="when">21 min ago</span></span>
              <Tag status="unassigned" tilt={-1}>Unassigned</Tag>
            </li>
          </ul>
        </TabPanel>
        <TabPanel value="resolved">
          <ul className="list">
            <li>
              <span><strong>Lost child, town plaza</strong><span className="when">1 h ago</span></span>
              <Tag status="resolved" tilt={2}>Resolved</Tag>
            </li>
            <li>
              <span><strong>Power line down, Brgy. 7</strong><span className="when">3 h ago</span></span>
              <Tag status="resolved" tilt={-2}>Resolved</Tag>
            </li>
          </ul>
        </TabPanel>
        <TabPanel value="flagged">
          <EmptyState>Nothing flagged. Flag an incident to follow up on it here.</EmptyState>
        </TabPanel>
      </Tabs>
    </Section>
  );
}

/* ---------------- Progress ---------------- */

function ProgressDemo() {
  const [synced, setSynced] = useState(4);
  const [syncing, setSyncing] = useState(false);
  const sync = () => {
    setSyncing(true);
    setSynced(0);
    let n = 0;
    const iv = setInterval(() => {
      n++;
      setSynced(n);
      if (n >= 10) {
        clearInterval(iv);
        setSyncing(false);
        toast.success("10 reports synced");
      }
    }, 200);
  };
  return (
    <Section id="progress" title="Progress" lede="Filled with crayon hatching instead of a flat bar. The leading edge is a single heavier stroke.">
      <div className="stack" style={{ gap: 28, maxWidth: 560 }}>
        <Progress label="Syncing offline reports" value={synced} max={10} valueText={`${synced} of 10`} />
        <Progress label="Units available" value={7} max={9} valueText="7 of 9" tone="mint" />
        <Progress label="Response time target" value={92} valueText="92% used" tone="tomato" solid />
        <div>
          <Button size="sm" variant="mint" tilt={-2} loading={syncing} loadingLabel="Syncing" onClick={sync}>
            Sync now
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Timeline ---------------- */

const STEPS = ["Reported", "Dispatched", "En route", "Resolved"];
const TIMES = ["9:02 AM", "9:04 AM", "9:05 AM", "9:17 AM"];

function Timeline() {
  const [step, setStep] = useState(2);
  return (
    <Section
      id="timeline"
      title="Status timeline"
      lede="Where an incident is right now. Done steps get a cobalt tick, the current step boils, the rest are pencilled in."
      code={`<StatusTimeline steps={["Reported", "Dispatched", "En route", "Resolved"]} current={2} />`}
    >
      <StatusTimeline
        steps={STEPS}
        current={step}
        label="Incident progress"
        times={STEPS.map((_, i) => (i < step ? TIMES[i] : i === step ? (i === 2 ? "6 min away" : "Now") : "Waiting"))}
      />
      <div className="row" style={{ marginTop: 36, gap: 18 }}>
        <Button
          size="sm"
          tilt={-2}
          disabled={step >= STEPS.length}
          onClick={() => {
            const next = step + 1;
            setStep(next >= STEPS.length - 1 ? STEPS.length : next);
            if (next >= STEPS.length - 1) toast.success("Incident resolved");
          }}
        >
          Next step
        </Button>
        <Button size="sm" variant="plain" tilt={2} onClick={() => setStep(0)}>
          Start over
        </Button>
      </div>
    </Section>
  );
}

/* ---------------- Callout ---------------- */

function Callouts() {
  const [trying, setTrying] = useState(false);
  return (
    <Section id="callout" title="Callout" lede="A strip torn off a pad. Use it for things people need to know before they act, not for decoration.">
      <div className="stack" style={{ gap: 18 }}>
        <Callout title="Two responders are near this pin">
          <p>Mobile 2 and Mobile 5 are both within 2 km. Assign the closer one first.</p>
        </Callout>
        <Callout tone="warn" title="Location is approximate" tilt={0.6}>
          <p>The caller’s GPS is accurate to about 200 m. Confirm a landmark before dispatching.</p>
        </Callout>
        <Callout
          tone="error"
          title="Couldn’t reach the station"
          action={
            <Button
              size="sm"
              variant="plain"
              tilt={-1.5}
              loading={trying}
              loadingLabel="Trying"
              onClick={() => {
                setTrying(true);
                setTimeout(() => {
                  setTrying(false);
                  toast.success("Report sent");
                }, 1300);
              }}
            >
              Try again
            </Button>
          }
        >
          <p>Your report is saved on this phone and will send when you’re back online.</p>
        </Callout>
        <Callout tone="success" title="Report received">
          <p>Reference number 24-1187. Keep your phone nearby in case the station calls back.</p>
        </Callout>
      </div>
    </Section>
  );
}

/* ---------------- Toast ---------------- */

function Toasts() {
  const haptics = useHaptics();
  return (
    <Section
      id="toast"
      title="Toast"
      lede="Slaps onto the bottom of the screen like a stamp, then lifts off after a few seconds."
      code={`toast.success("Report sent")
toast.error("Couldn’t send. Saved for later.")`}
    >
      <div className="row" style={{ gap: 26 }}>
        <Toast kind="success">Report sent</Toast>
        <Toast kind="error">Couldn’t send. Saved for later.</Toast>
      </div>
      <div className="row" style={{ marginTop: 34 }}>
        <Button size="sm" variant="mint" tilt={-2} onClick={() => toast.success("Report sent")}>
          Show success
        </Button>
        <Button
          size="sm"
          variant="tomato"
          tilt={2}
          onClick={() => {
            haptics.error();
            toast.error("Couldn’t send. Saved for later.");
          }}
        >
          Show error
        </Button>
        <Button size="sm" variant="plain" tilt={-1} onClick={() => toast("Mobile 2 is 6 min away")}>
          Show info
        </Button>
      </div>
    </Section>
  );
}

function Footer() {
  const { haptics, sound, setHaptics, setSound } = useFeedback();
  return (
    <footer className="kit-foot">
      <Switch checked={haptics} onCheckedChange={setHaptics}>
        Haptics
      </Switch>
      <Switch checked={sound} onCheckedChange={setSound} color="ink">
        Sound
      </Switch>
      <p>Haptics work on Android Chrome and iPhone Safari (iOS 18 or later). Your surface choice is remembered on this device.</p>
    </footer>
  );
}

export function KitShowcase() {
  return (
    <>
      <Tokens />
      <Buttons />
      <Tooltips />
      <Switches />
      <Checkboxes />
      <Fields />
      <Tags />
      <Avatars />
      <Cards />
      <TabsDemo />
      <ProgressDemo />
      <Timeline />
      <Callouts />
      <Toasts />
      <Footer />
    </>
  );
}
