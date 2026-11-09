"use client";

import {
  Avatar, AvatarStack, Button, Callout, EmptyState, Pagination, PlopProvider, Progress, Radio, RadioGroup, Select, Sheet, Skeleton,
  SkeletonText, Switch, Tag, TextField, useDelayedLoading, type PaginationProps,
} from "@plop-ui/react";
import { surfaceNames } from "@plop-ui/tokens";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

/* ---------- a fake incident queue ---------- */
type Status = "critical" | "en-route" | "dispatched" | "unassigned" | "resolved";
const PEOPLE = ["Rosa Santos", "Jun Reyes", "Mika Tan", "Ben Ocampo", "Ana Cruz", "Leo Garcia", "Tala Ramos", "Nico Valdez"];
const KINDS = ["Flooding", "Road accident", "Noise complaint", "Fallen tree", "Power line down", "Grass fire", "Lost child", "Stray dog", "Blocked drain", "Medical call"];
const PLACES = ["Purok 4", "Brgy. 3", "Maharlika Hwy", "Rizal St.", "Sitio Malinao", "town plaza", "Brgy. 7", "Poblacion"];
const STATUS: Array<[Status, string]> = [["critical", "Critical"], ["en-route", "En route"], ["dispatched", "Dispatched"], ["unassigned", "Unassigned"], ["resolved", "Resolved"]];
const ALL = Array.from({ length: 168 }, (_, i) => ({
  id: 1042 + i, kind: KINDS[(i * 7) % KINDS.length]!, place: PLACES[(i * 3) % PLACES.length]!,
  who: PEOPLE[(i * 5) % PEOPLE.length]!, status: STATUS[(i * 11) % STATUS.length]!, mins: (i * 13) % 59 + 1,
}));

type Sim = "ok" | "slow" | "error" | "empty";

/* ---------- layout bits (tokens only) ---------- */
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 22 };
const cell: CSSProperties = { display: "grid", gap: 14, alignContent: "space-between", minWidth: 0, padding: "20px 16px 14px", border: "2px dashed var(--plop-ink-soft)", borderRadius: "16px 12px 17px 13px" };
const stage: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "center", minHeight: 70 };
const soft: CSSProperties = { margin: 0, color: "var(--plop-on-soft)", fontFamily: "var(--plop-font-body)" };

function Cell({ title, note, children, testId }: { title: string; note: string; children: ReactNode; testId?: string }) {
  return (
    <div style={cell} data-testid={testId}>
      <div style={stage}>{children}</div>
      <p style={soft}><b style={{ color: "var(--plop-on)" }}>{title}.</b> {note}</p>
    </div>
  );
}

/** Pagination with its own page state, for the variant and state cells. */
function Local({ initial = 1, ...props }: Omit<PaginationProps, "page" | "onPageChange"> & { initial?: number }) {
  const [page, setPage] = useState(initial);
  return <Pagination {...props} page={page} onPageChange={setPage} />;
}

/* ---------- live example ---------- */
function LiveQueue() {
  const [sim, setSim] = useState<Sim>("ok");
  const [size, setSize] = useState(5);
  const [page, setPage] = useState(1);
  const [shown, setShown] = useState(1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [said, setSaid] = useState("");
  const req = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const skeleton = useDelayedLoading(loading);
  const data = sim === "empty" ? [] : ALL;
  const pageCount = Math.ceil(data.length / size);

  // Latest request wins, so fast clicking never shows an older page.
  function load(target: number, focus = true) {
    const id = ++req.current;
    setPage(target); setLoading(true); setFailed(false); setSaid(`Loading page ${target}`);
    window.setTimeout(() => {
      if (id !== req.current) return;
      setLoading(false);
      if (sim === "error") { setFailed(true); setSaid(`Couldn't load page ${target}. The station's connection dropped.`); return; }
      setShown(target);
      const from = (target - 1) * size + 1, to = Math.min(target * size, data.length);
      setSaid(`Page ${target} of ${pageCount}, showing ${from} to ${to} of ${data.length}`);
      if (focus) heading.current?.focus();
    }, sim === "slow" ? 2200 : 650);
  }
  // A new state or page size starts over at page one.
  useEffect(() => { req.current++; setPage(1); setShown(1); setLoading(false); setFailed(false); }, [sim, size]);

  const rows = data.slice((shown - 1) * size, shown * size);
  const from = data.length ? (shown - 1) * size + 1 : 0, to = Math.min(shown * size, data.length);
  return (
    <section aria-labelledby="queue-h" data-testid="live">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", alignItems: "end", justifyContent: "space-between", marginBottom: 16 }}>
        <RadioGroup legend="Simulate" value={sim} onValueChange={(v) => setSim(v as Sim)} vertical={false}>
          <Radio value="ok">Normal</Radio><Radio value="slow">Slow network</Radio><Radio value="error">Error</Radio><Radio value="empty">No results</Radio>
        </RadioGroup>
        <RadioGroup legend="Rows per page" value={String(size)} onValueChange={(v) => setSize(Number(v))} vertical={false}>
          <Radio value="5">5</Radio><Radio value="10">10</Radio><Radio value="25">25</Radio>
        </RadioGroup>
      </div>
      <h3 id="queue-h" ref={heading} tabIndex={-1} style={{ margin: "0 0 12px", fontFamily: "var(--plop-font-letter)", color: "var(--plop-ink-text)" }}>Incident queue</h3>
      <div aria-busy={loading} style={{ minHeight: 120 }}>
        {failed ? (
          <Callout tone="error" title={`Couldn't load page ${page}`} buddy="error" role="alert"
            action={<Button size="sm" variant="tomato" buddyMood="error" onClick={() => load(page)}>Try again</Button>}>
            The station&apos;s connection dropped. Try again in a moment.
          </Callout>
        ) : data.length === 0 ? (
          <EmptyState>No incidents match these filters. Clear one to see more.</EmptyState>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
            {skeleton
              ? Array.from({ length: Math.min(size, 8) }, (_, i) => (
                <li key={i} aria-hidden="true" style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 2px" }}>
                  <Skeleton shape="circle" width={36} height={36} seed={`s${i}`} />
                  <span style={{ flex: 1 }}><SkeletonText lines={2} seed={`t${i}`} /></span>
                </li>
              ))
              : rows.map((r) => (
                <li key={r.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 2px", borderBottom: "2px dashed var(--plop-ink-soft)" }}>
                  <Avatar name={r.who} size="sm" />
                  <span style={{ flex: 1, minWidth: 0, display: "grid" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.kind}, {r.place}</span>
                    <span style={{ ...soft, fontSize: 14 }}>{r.who}, {r.mins} min ago · #{r.id}</span>
                  </span>
                  <Tag status={r.status[0]}>{r.status[1]}</Tag>
                </li>
              ))}
          </ul>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
        <span style={soft} aria-hidden="true">{data.length ? `Showing ${from} to ${to} of ${data.length}` : "Showing 0 of 0"}</span>
        <Pagination page={page} pageCount={pageCount} loading={loading} loadingLabel={`Loading page ${page}`} onPageChange={(p) => load(p)} />
      </div>
      <p role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{said}</p>
    </section>
  );
}

/* ---------- recipes built from kit components ---------- */
function PerPage() {
  const [size, setSize] = useState("10");
  const [page, setPage] = useState(2);
  const count = Math.ceil(168 / Number(size));
  return (
    <>
      <RadioGroup legend="Items per page" value={size} onValueChange={(v) => { setSize(v); setPage(1); }} vertical={false}>
        <Radio value="10">10</Radio><Radio value="25">25</Radio><Radio value="50">50</Radio>
      </RadioGroup>
      <Pagination variant="compact" page={page} pageCount={count} onPageChange={setPage} aria-label="Items pages" />
    </>
  );
}

function Showing() {
  const [page, setPage] = useState(2);
  const size = 10, items = 100;
  return <Pagination variant="compact" page={page} pageCount={items / size} onPageChange={setPage} aria-label="Showing pages"
    formatCount={(p) => `Showing ${(p - 1) * size + 1}–${Math.min(p * size, items)} of ${items}`} />;
}

function Dropdown() {
  const [page, setPage] = useState(1);
  const count = 24;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end" }}>
      <div style={{ width: 160 }}>
        <Select label="Page" size="sm" value={String(page)} onValueChange={(v) => setPage(Number(v))}
          options={Array.from({ length: count }, (_, i) => ({ value: String(i + 1), label: `${i + 1} of ${count}` }))} />
      </div>
      <Pagination variant="compact" page={page} pageCount={count} onPageChange={setPage} aria-label="Dropdown pages" />
    </div>
  );
}

function GoTo() {
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string>();
  const count = 24;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("goto") as HTMLInputElement;
    const n = Number(input.value);
    if (!Number.isInteger(n) || n < 1 || n > count) { setError(`Pick a page from 1 to ${count}.`); return; }
    setError(undefined); setPage(n); input.value = "";
  }
  return (
    <>
      <Pagination page={page} pageCount={count} onPageChange={setPage} aria-label="Go to pages" />
      <form noValidate onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "start" }}>
        <TextField label="Go to page" name="goto" inputMode="numeric" placeholder="e.g. 14" error={error} style={{ width: 120 }} />
        <Button type="submit" size="sm" style={{ marginTop: 30 }}>Go</Button>
      </form>
    </>
  );
}

function LoadMore() {
  const total = 48;
  const [shown, setShown] = useState(10);
  const [busy, setBusy] = useState(false);
  const done = shown >= total;
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <Button variant="plain" loading={busy} loadingLabel="Loading more" disabled={done}
        onClick={() => { setBusy(true); window.setTimeout(() => { setShown((s) => Math.min(total, s + 10)); setBusy(false); }, 900); }}>
        {done ? "That's everything" : "Load 10 more"}
      </Button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "center" }}>
        <AvatarStack names={PEOPLE.slice(0, 3)} max={3} label="Recent reporters" />
        <div style={{ width: 180 }}><Progress label={`Showing ${shown} of ${total}`} value={shown} max={total} /></div>
      </div>
    </div>
  );
}

/* ---------- the board ---------- */
export function PaginationBoard() {
  const [dark, setDark] = useState(false);
  const [rtl, setRtl] = useState(false);
  const theme = dark ? "dark" : "light";
  return (
    <PlopProvider surface="notebook" theme={theme}>
      <main data-testid="pagination-lab" dir={rtl ? "rtl" : undefined} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 36, maxWidth: 1120, margin: "0 auto", padding: "40px 20px 120px" }}>
        <header style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--plop-font-letter)", color: "var(--plop-ink-text)" }}>Pagination lab</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <Switch checked={dark} onCheckedChange={setDark}>Dark</Switch>
            <Switch checked={rtl} onCheckedChange={setRtl}>Right to left</Switch>
          </div>
        </header>

        <Sheet tape="mustard">
          <h2 style={{ marginTop: 0 }}>Live example</h2>
          <LiveQueue />
        </Sheet>

        <Sheet tape="periwinkle">
          <h2 style={{ marginTop: 0 }}>Variants</h2>
          <div style={grid}>
            <Cell title="Full" note="Default for tables."><Local initial={2} pageCount={17} aria-label="Full" /></Cell>
            <Cell title="Compact" note="Cards, sidebars, tight toolbars."><Local initial={2} pageCount={17} variant="compact" aria-label="Compact" /></Cell>
            <Cell title="Per page + compact" note="RadioGroup sets the size; changing it goes back to page 1."><PerPage /></Cell>
            <Cell title="Showing count" note="formatCount says how much is left."><Showing /></Cell>
            <Cell title="First and last" note="showEnds, for long lists people jump through."><Local initial={5} pageCount={40} showEnds aria-label="Ends" /></Cell>
            <Cell title="Compact with ends" note="showEnds on compact."><Local initial={5} pageCount={40} showEnds variant="compact" aria-label="Compact ends" /></Cell>
            <Cell title="Page dropdown" note="Select picks any page; Previous/Next step."><Dropdown /></Cell>
            <Cell title="Go to page" note="TextField with validation, for logs people know by number."><GoTo /></Cell>
            <Cell title="Load more" note="Button loading + Progress, for feeds."><LoadMore /></Cell>
          </div>
        </Sheet>

        <Sheet tape="bubblegum">
          <h2 style={{ marginTop: 0 }}>States</h2>
          <div style={grid}>
            <Cell title="First page" note="Previous is disabled." testId="st-first"><Local initial={1} pageCount={17} aria-label="First page state" /></Cell>
            <Cell title="Last page" note="Next is disabled." testId="st-last"><Local initial={17} pageCount={17} aria-label="Last page state" /></Cell>
            <Cell title="Loading" note="Spinner in the page you picked; the rest stay usable." testId="st-loading"><Pagination page={3} pageCount={17} loading aria-label="Loading state" /></Cell>
            <Cell title="Loading, compact" note="A status spinner next to the count." testId="st-loading-compact"><Pagination page={3} pageCount={17} loading variant="compact" aria-label="Compact loading state" /></Cell>
            <Cell title="Disabled" note="Everything waits." testId="st-disabled"><Pagination page={4} pageCount={17} disabled aria-label="Disabled state" /></Cell>
            <Cell title="Only one page" note="Hide the control, keep the count." testId="st-one"><span style={soft}>Showing all 6 incidents</span></Cell>
            <Cell title="Huge" note="100,000 pages still renders 9 controls." testId="st-huge"><Local initial={50000} pageCount={100000} showEnds aria-label="Huge state" /></Cell>
            <Cell title="Links" note="Real anchors; the server can build them." testId="st-links"><Pagination page={2} pageCount={9} href={(p) => `#page-${p}`} aria-label="Links state" /></Cell>
          </div>
        </Sheet>

        <Sheet tape="mint">
          <h2 style={{ marginTop: 0 }}>Stress</h2>
          <p style={soft}>Narrow containers, stretched grid and flex parents, every surface in light and dark.</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 18 }} data-testid="narrow">
            {[200, 280, 375].map((w) => (
              <div key={w} style={{ width: w, maxWidth: "100%", outline: "2px dashed var(--plop-ink-soft)" }}>
                <Local initial={10} pageCount={40} showEnds aria-label={`Narrow ${w}`} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", minHeight: 200, marginTop: 18 }} data-testid="stretch-grid"><Local initial={3} pageCount={9} aria-label="Stretched grid" /></div>
          <div style={{ display: "flex", height: 160, marginTop: 18 }} data-testid="stretch-flex"><Local initial={3} pageCount={9} variant="compact" aria-label="Stretched flex" /></div>
          <div style={{ display: "grid", gap: 12, marginTop: 18 }} data-testid="surfaces">
            {(["light", "dark"] as const).flatMap((t) => surfaceNames.map((s) => (
              <PlopProvider key={`${t}-${s}`} surface={s} theme={t} style={{ padding: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                  <Pagination page={2} pageCount={12} loading href={(p) => `#${s}-${p}`} aria-label={`${s} ${t}`} />
                  <Pagination page={2} pageCount={12} variant="compact" showEnds href={(p) => `#${s}-${p}`} aria-label={`${s} ${t} compact`} />
                </div>
              </PlopProvider>
            )))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }} data-testid="mass">
            {Array.from({ length: 60 }, (_, i) => (
              <Pagination key={i} page={(i % 20) + 1} pageCount={20 + i} variant={i % 3 ? "full" : "compact"} showEnds={i % 4 === 0} seed={`m${i}`} aria-label={`Mass ${i}`} />
            ))}
          </div>
        </Sheet>
      </main>
    </PlopProvider>
  );
}
