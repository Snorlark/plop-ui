"use client";

import {
  Avatar,
  Button,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  UnitCard,
  Loader,
  Progress,
  ProgressRing,
  Sheet,
  Skeleton,
  SkeletonText,
  Spinner,
  StatusTimeline,
  Tag,
  TicketCard,
  toast,
  type LoaderProps,
  type SpinnerKind,
} from "@plop-ui/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Timers that clean up after themselves (and can all be cleared at once for a reset). */
function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach((id) => window.clearTimeout(id)), []);
  return {
    later: (fn: () => void, ms: number) => void ids.current.push(window.setTimeout(fn, ms)),
    clear: () => {
      ids.current.forEach((id) => window.clearTimeout(id));
      ids.current = [];
    },
  };
}

function Section({ id, title, hint, tape, actions, code, children }: { id: string; title: string; hint: string; tape: "mustard" | "periwinkle" | "bubblegum" | "mint"; actions?: ReactNode; code: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="load-sec">
      <Sheet tape={tape} className="load-sheet">
        <div className="load-head">
          <div>
            <h2 id={`${id}-h`} className="load-h">
              {title}
            </h2>
            <p className="load-hint">{hint}</p>
          </div>
          {actions && <div className="load-actions">{actions}</div>}
        </div>
        {children}
        <details className="load-code">
          <summary>Code</summary>
          <pre>
            <code>{code}</code>
          </pre>
        </details>
      </Sheet>
    </section>
  );
}

const KINDS: Array<{ kind: SpinnerKind; name: string; use: string }> = [
  { kind: "ink", name: "Ink loop", use: "The default." },
  { kind: "dots", name: "Hopping dots", use: "Buttons, chat." },
  { kind: "scribble", name: "Scribble", use: "Writing, drawing." },
  { kind: "sticker", name: "Coin flip", use: "The fun waits." },
  { kind: "buddy", name: "Hum", use: "Whole pages." },
];

function Spinners() {
  const { later } = useTimers();
  const [sending, setSending] = useState(false);
  return (
    <Section
      id="spinners"
      title="Spinners"
      tape="mustard"
      hint="For waits under a few seconds. Pick one per product; Hum is for moments with personality."
      actions={
        <Button
          size="sm"
          variant="ink"
          loading={sending}
          loadingLabel="Sending"
          onClick={() => {
            setSending(true);
            later(() => {
              setSending(false);
              toast.success("Sent!", { buddy: true });
            }, 1600);
          }}
        >
          Try it in a button
        </Button>
      }
      code={`<Spinner label="Loading sketches" />
<Spinner kind="dots" showLabel label="Saving your board" />
<Spinner kind="sticker" tone="bubblegum" size="lg" delay={300} />
<Button loading={isSending} loadingLabel="Sending">Send</Button>`}
    >
      <ul className="load-kinds">
        {KINDS.map((k) => (
          <li key={k.kind}>
            <Spinner kind={k.kind} size="lg" label={`Loading (${k.name})`} seed={k.kind} />
            <b>{k.name}</b>
            <small>{k.use}</small>
          </li>
        ))}
      </ul>
      <div className="load-row">
        <Spinner size="sm" seed="s" />
        <Spinner seed="m" />
        <Spinner size="lg" seed="l" />
        <Spinner style={{ color: "var(--plop-tomato)" }} seed="t" />
        <Spinner style={{ color: "var(--plop-leaf)" }} seed="g" />
        <span className="load-onink">
          <Spinner kind="dots" size="sm" showLabel label="On ink" />
        </span>
      </div>
    </Section>
  );
}

const STEPS = ["Drawing the stickers", "Printing in one ink", "Cutting them out", "Packing your board"];

function ProgressSection() {
  const { later, clear } = useTimers();
  const [sync, setSync] = useState(0);
  const [ring, setRing] = useState(0);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const run = () => {
    clear();
    setRunning(true);
    setSync(0);
    setRing(0);
    setStep(0);
    for (let i = 1; i <= 10; i++) later(() => setSync(i), i * 380);
    for (let i = 1; i <= 20; i++) later(() => setRing(i * 5), i * 190);
    for (let i = 1; i <= STEPS.length; i++) later(() => setStep(i), i * 950);
    later(() => setRunning(false), 3900);
  };
  return (
    <Section
      id="progress"
      title="Progress"
      tape="periwinkle"
      hint="When you know how long it takes, say so. When you don't, keep it moving and honest."
      actions={
        <Button size="sm" variant="periwinkle" onClick={run} disabled={running}>
          {sync === 10 ? "Run it again" : "Run it"}
        </Button>
      }
      code={`<Progress label="Syncing reports" value={4} max={10} valueText="4 of 10" />
<Progress label="Finding the closest unit" indeterminate tone="tomato" />
<ProgressRing label="Uploading photos" value={64} />
<StatusTimeline steps={steps} current={1} />`}
    >
      <div className="load-split">
        <div className="load-stack">
          <Progress label="Syncing reports" value={sync} max={10} valueText={`${sync} of 10`} />
          <Progress label="Finding the closest unit" indeterminate tone="tomato" />
          <Progress label="Storage used" value={72} valueText="72%" tone="mint" />
        </div>
        <div className="load-ringstep">
          <ProgressRing label="Uploading photos" value={ring} size="lg" seed="ring" />
          <StatusTimeline steps={STEPS} current={Math.min(step, STEPS.length - 1)} orientation="vertical" label="Publishing your board" />
        </div>
      </div>
    </Section>
  );
}

const PEOPLE = [
  { name: "Rosa Santos", text: "Inked the café menu", tag: "Done", tone: "mint" as const },
  { name: "Jun Reyes", text: "Coloring the poster", tag: "Now", tone: "mustard" as const },
  { name: "Mika Tan", text: "Cutting the stickers", tag: "Next", tone: "periwinkle" as const },
];

function Skeletons() {
  const { later } = useTimers();
  const [state, setState] = useState<"waiting" | "loading" | "loaded">("waiting");
  const busy = state !== "loaded";
  const load = () => {
    setState("loading");
    later(() => setState("loaded"), 1400);
  };
  return (
    <Section
      id="skeletons"
      title="Skeletons"
      tape="bubblegum"
      hint="For layouts that take a second or more. The scraps match the real shapes, so nothing jumps when it lands."
      actions={
        state === "loaded" ? (
          <Button size="sm" variant="plain" onClick={() => setState("waiting")}>
            Back to skeletons
          </Button>
        ) : (
          <Button size="sm" variant="mustard" onClick={load} loading={state === "loading"} loadingLabel="Loading">
            Load it
          </Button>
        )
      }
      code={`<section aria-busy={isLoading} aria-label="Crew">
  {isLoading ? (
    <>
      <Skeleton shape="circle" width={52} height={52} />
      <SkeletonText lines={2} />
    </>
  ) : (
    <CrewList people={people} />
  )}
</section>`}
    >
      <div className="load-split">
        <section aria-busy={busy} aria-label="Crew" className="load-card">
          {PEOPLE.map((p, i) => (
            <div key={p.name} className={busy ? "load-person" : "load-person load-land"} style={{ animationDelay: `${i * 60}ms` }}>
              {busy ? (
                <>
                  <Skeleton shape="circle" width={52} height={52} seed={`a${i}`} />
                  <span className="load-lines">
                    <Skeleton shape="title" width="55%" height={16} seed={`t${i}`} />
                    <Skeleton width="80%" height={12} seed={`l${i}`} />
                  </span>
                  <Skeleton shape="pill" width={58} seed={`p${i}`} />
                </>
              ) : (
                <>
                  <Avatar name={p.name} />
                  <span className="load-lines">
                    <b>{p.name}</b>
                    <span>{p.text}</span>
                  </span>
                  <Tag tone={p.tone}>{p.tag}</Tag>
                </>
              )}
            </div>
          ))}
        </section>
        <div className="load-stack">
          <section aria-busy={busy} aria-label="Ticket">
            {busy ? (
              <div className="load-ticket">
                <Skeleton width="40%" height={12} seed="tm" />
                <Skeleton shape="title" seed="tt" />
                <Skeleton shape="pill" seed="tp" />
              </div>
            ) : (
              <div className="load-land">
                <TicketCard meta="Sketch #1042, 9:14 AM" title="Café menu, round two" stub="Open">
                  <Tag tone="mustard">Inking</Tag>
                </TicketCard>
              </div>
            )}
          </section>
          <article aria-busy={busy} aria-label="Note">
            {busy ? (
              <SkeletonText lines={3} seed="article" />
            ) : (
              <p className="load-land" style={{ margin: 0 }}>
                The café wants the menu by Friday. Rosa inked the drinks and Mika is cutting it into stickers for the window.
              </p>
            )}
          </article>
        </div>
      </div>
      <p className="vh" role="status">
        {state === "loaded" ? "Crew, ticket and note loaded" : ""}
      </p>
    </Section>
  );
}

const WHEN = [
  { what: "Spinner", when: "A wait of up to a few seconds, when you can't show the shape of what's coming: sending, saving, a button press.", time: "0.3 to 3 s", tape: "mustard" as const, href: "#spinners" },
  { what: "Skeleton", when: "A layout you know the shape of, taking a second or more: lists, cards, profiles. Nothing jumps when it lands.", time: "1 s and up", tape: "bubblegum" as const, href: "#skeletons" },
  { what: "Progress", when: "You know how far along it is: uploads, syncs, steps. Switch from indeterminate to a value as soon as you know one.", time: "Any length", tape: "periwinkle" as const, href: "#progress" },
];

/** Spinner vs. skeleton vs. progress, and the timing rules underneath. */
function WhenToUse() {
  return (
    <section id="when" aria-labelledby="when-h" className="load-sec">
      <h2 id="when-h" className="load-h">
        Which one?
      </h2>
      <ul className="load-when">
        {WHEN.map((w) => (
          <li key={w.what}>
            <Sheet tape={w.tape} className="load-when__card">
              <a href={w.href} className="load-when__what">
                {w.what}
              </a>
              <span className="load-when__time">{w.time}</span>
              <p>{w.when}</p>
            </Sheet>
          </li>
        ))}
      </ul>
      <p className="load-hint">
        Under 300 ms, show nothing (<code>useDelayedLoading</code>). Past a few seconds, say what&apos;s slow and offer Cancel (<code>Loader</code>). Put <code>aria-busy</code> on the region that&apos;s loading, and never spin forever in silence.
      </p>
    </section>
  );
}

const BRUSHES = [
  { value: "pencil", label: "Pencil" },
  { value: "marker", label: "Marker" },
];

/** Components that fetch have a loading look built in: one prop, no custom CSS. */
function BuiltIn() {
  const { later } = useTimers();
  const [loading, setLoading] = useState(true);
  return (
    <Section
      id="built-in"
      title="Built in"
      tape="periwinkle"
      hint="Cards, Select, Avatar and Tabs panels each have a loading prop: the same shape with paper scraps, aria-busy, and no custom CSS."
      actions={
        loading ? (
          <Button size="sm" variant="periwinkle" onClick={() => later(() => setLoading(false), 200)}>
            Load it
          </Button>
        ) : (
          <Button size="sm" variant="plain" onClick={() => setLoading(true)}>
            Back to loading
          </Button>
        )
      }
      code={`<TicketCard loading title="" />
<UnitCard loading name="" />
<Select label="Brush" options={[]} loading />
<Avatar name="Rosa Santos" loading />
<TabPanel value="drafts" loading />`}
    >
      <div className="load-split">
        <div className="load-stack">
          <TicketCard loading={loading} meta="Sketch #1042, 9:14 AM" title="Café menu, round two" stub="Open">
            <Tag tone="mustard">Inking</Tag>
          </TicketCard>
          <UnitCard loading={loading} name="Rosa Santos" subtitle="Inker" avatar={<Avatar name="Rosa Santos" />}>
            <span>Inking the café menu</span>
          </UnitCard>
        </div>
        <div className="load-stack">
          <Select label="Brush" options={BRUSHES} loading={loading} />
          <div className="load-row">
            <Avatar name="Rosa Santos" loading={loading} />
            <Avatar name="Jun Reyes" size="lg" loading={loading} />
            <Avatar name="Mika Tan" size="sm" loading={loading} />
          </div>
          <Tabs defaultValue="drafts">
            <TabList label="Sketch views">
              <Tab value="drafts">Drafts</Tab>
              <Tab value="shipped">Shipped</Tab>
            </TabList>
            <TabPanel value="drafts" loading={loading}>
              Three drafts: the café menu, the poster and the window stickers.
            </TabPanel>
            <TabPanel value="shipped" loading={loading}>
              Eleven sketches shipped this month.
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </Section>
  );
}

const PAPERS: Array<NonNullable<LoaderProps["paper"]>> = ["dots", "lined", "kraft", "plain"];
const TAPES = { dots: "mustard", lined: "periwinkle", kraft: "mint", plain: "bubblegum" } as const;

function InContext() {
  const { later, clear } = useTimers();
  const [busy, setBusy] = useState<"send" | "cancel" | null>(null);
  const [crew, setCrew] = useState<"idle" | "loading" | "done">("idle");
  const [upload, setUpload] = useState(0);
  const [page, setPage] = useState<NonNullable<LoaderProps["paper"]> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (page && !d.open) d.showModal();
    if (!page && d.open) d.close();
  }, [page]);

  const press = (which: "send" | "cancel") => {
    setBusy(which);
    later(() => {
      setBusy(null);
      if (which === "send") toast.success("Report sent", { buddy: true });
      else toast.error("Couldn't cancel. Try again.", { buddy: true });
    }, 1500);
  };

  return (
    <Section
      id="in-context"
      title="In context"
      tape="mint"
      hint="Buttons keep their size, slow loads explain themselves, long jobs show what's happening, and a whole-page wait can always be left."
      code={`<Loader label="Loading the crew" slowAfter={4000} onCancel={stop} />
<Loader variant="card" paper="dots" label="Pressing your page"
  tips={["Checking the ink."]} onClose={close} onCancel={close} />
const showSpinner = useDelayedLoading(isPending);`}
    >
      <div className="load-ctx">
        <div className="load-tile">
          <b>Buttons</b>
          <div className="load-row">
            <Button variant="ink" size="sm" loading={busy === "send"} loadingLabel="Sending" onClick={() => press("send")}>
              Send report
            </Button>
            <Button variant="tomato" size="sm" loading={busy === "cancel"} loadingLabel="Cancelling" onClick={() => press("cancel")}>
              Cancel order
            </Button>
          </div>
          <Spinner kind="dots" size="sm" showLabel label="Saving your board" />
        </div>

        <div className="load-tile">
          <b>A slow load</b>
          {crew === "loading" ? (
            <Loader
              label="Loading the crew"
              slowAfter={2200}
              slowMessage="Taking longer than usual. The studio's wifi is slow."
              onCancel={() => {
                clear();
                setCrew("idle");
                toast("Stopped loading.");
              }}
            />
          ) : (
            <div className="load-row">
              <Button
                size="sm"
                variant="plain"
                onClick={() => {
                  setCrew("loading");
                  later(() => setCrew("done"), 6500);
                }}
              >
                Load the crew
              </Button>
              {crew === "done" && <span>Rosa, Jun and Mika are in.</span>}
            </div>
          )}
        </div>

        <div className="load-tile">
          <b>An upload</b>
          <div className="load-upload">
            <span className="load-file" aria-hidden="true">
              PDF
            </span>
            <Progress label="menu.pdf" value={upload} valueText={upload >= 100 ? "Done" : `${upload}%`} tone={upload >= 100 ? "mint" : "ink"} />
          </div>
          <div>
            <Button
              size="sm"
              variant="mustard"
              disabled={upload > 0 && upload < 100}
              onClick={() => {
                setUpload(1);
                for (let i = 1; i <= 10; i++) later(() => setUpload(i * 10), i * 280);
              }}
            >
              {upload >= 100 ? "Upload again" : "Upload"}
            </Button>
          </div>
        </div>

        <div className="load-tile">
          <b>A whole page</b>
          <small>Opens a page loader. Close it, press Cancel or Escape.</small>
          <div className="load-row">
            {PAPERS.map((p) => (
              <Button key={p} size="sm" variant="plain" onClick={() => setPage(p)}>
                {p[0]!.toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <dialog ref={dialog} aria-label="Loading your page" onClose={() => setPage(null)} className="demo-overlay">
        {page && (
          <Loader
            variant="card"
            paper={page}
            tape={TAPES[page]}
            label="Pressing your page"
            tips={["Rosa is checking the ink.", "Cutting the stickers out.", "Peeling off the backing paper."]}
            slowAfter={5000}
            onCancel={() => setPage(null)}
            onClose={() => setPage(null)}
          />
        )}
      </dialog>
    </Section>
  );
}

/** The Loading page: spinners, progress, skeletons and the in-between states, each on its own taped sheet. */
export function LoadingShowcase() {
  return (
    <div className="load">
      <nav aria-label="On this page" className="load-jump">
        <a href="#when">Which one?</a>
        <a href="#spinners">Spinners</a>
        <a href="#progress">Progress</a>
        <a href="#skeletons">Skeletons</a>
        <a href="#built-in">Built in</a>
        <a href="#in-context">In context</a>
      </nav>
      <WhenToUse />
      <Spinners />
      <ProgressSection />
      <Skeletons />
      <BuiltIn />
      <InContext />
    </div>
  );
}
