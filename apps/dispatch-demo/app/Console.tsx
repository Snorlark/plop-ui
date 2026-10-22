"use client";

import {
  Avatar,
  Button,
  Callout,
  Count,
  EmptyState,
  Eta,
  Heading,
  Radio,
  RadioGroup,
  Sheet,
  StatusDot,
  StatusTimeline,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TextArea,
  TextField,
  TicketCard,
  UnitCard,
  UnitCardRow,
  toast,
} from "@plop-ui/react";
import type { Status } from "@plop-ui/tokens";
import { useActionState, useEffect, useOptimistic, useState } from "react";
import { byUrgency, formatTime, PLACES, STAGES, UNITS, type Incident, type StreamEvent } from "../lib/incidents";
import { sendReport, type ReportState } from "./actions";
import styles from "./demo.module.css";

/** Each stage as a status tag: the tape color comes from the ops status mapping in the tokens. */
const STAGE_TAG: Array<{ status?: Status; tone?: "bubblegum"; label: string }> = [
  { status: "unassigned", label: "Unassigned" },
  { status: "dispatched", label: "Dispatched" },
  { status: "en-route", label: "En route" },
  { tone: "bubblegum", label: "On scene" },
  { status: "resolved", label: "Resolved" },
];

type Row = Incident & { sending?: boolean };

function apply(list: Incident[], event: StreamEvent): Incident[] {
  if (event.type === "incident") return list.some((i) => i.id === event.incident.id) ? list : [...list, event.incident];
  return list.map((i) => {
    if (i.id !== event.id || event.stage <= i.stage) return i;
    const times = [...i.times];
    times[event.stage] = event.at;
    return { ...i, stage: event.stage, times, unit: event.unit ?? i.unit };
  });
}

/**
 * The dispatch console. The queue starts from the server-rendered incidents,
 * then follows the SSE stream; new reports go through a Server Action and show
 * up at once as an optimistic ticket while they send.
 */
export function Console({ initial }: { initial: Incident[] }) {
  const [incidents, setIncidents] = useState(initial);
  const [optimistic, addOptimistic] = useOptimistic<Row[], Row>(incidents, (list, row) => [...list, row]);
  const [selected, setSelected] = useState<number>(initial.find((i) => i.stage === 2)?.id ?? initial[0]!.id);
  const [live, setLive] = useState<"connecting" | "live" | "lost">("connecting");
  const [heard, setHeard] = useState("");

  useEffect(() => {
    const source = new EventSource("/api/incidents/stream");
    source.onopen = () => setLive("live");
    source.onerror = () => setLive("lost");
    source.onmessage = (e) => {
      const event = JSON.parse(e.data) as StreamEvent;
      setIncidents((list) => apply(list, event));
      if (event.type === "incident") setHeard(`New report: ${event.incident.kind}, ${event.incident.place}.`);
    };
    return () => source.close();
  }, []);

  const [report, formAction, sending] = useActionState(async (prev: ReportState | null, form: FormData) => {
    const kind = String(form.get("kind") ?? "").trim();
    const place = String(form.get("place") ?? "");
    if (kind.length >= 3 && place) {
      addOptimistic({ id: -1, kind, place, critical: form.get("priority") === "critical", stage: 0, times: [Date.now()], sending: true });
    }
    const result = await sendReport(prev, form);
    if (result.ok) {
      setIncidents((list) => [...list, result.incident]);
      setSelected(result.incident.id);
      toast.success(`Report #${result.incident.id} filed`, { buddy: true });
    }
    return result;
  }, null);

  const sorted = [...optimistic].sort(byUrgency);
  const open = sorted.filter((i) => i.stage < 4);
  const done = sorted.filter((i) => i.stage === 4);
  const critical = open.filter((i) => i.critical).length;
  const current = optimistic.find((i) => i.id === selected);
  const busy = new Set(open.map((i) => i.unit).filter(Boolean));
  const failed = report && !report.ok ? report : null;

  const ticket = (i: Row) => {
    const tag = STAGE_TAG[i.stage]!;
    return (
      <li key={i.id}>
        <TicketCard
          className={styles.ticket}
          data-selected={i.id === selected ? "" : undefined}
          meta={i.sending ? "Sending…" : `Ticket #${i.id} · ${formatTime(i.times[0]!)}`}
          title={i.kind}
          stub={i.sending ? "New" : STAGES[i.stage]}
          tilt={0}
        >
          {i.critical && <Tag status="critical">Critical</Tag>}
          <Tag status={tag.status} tone={tag.tone}>
            {tag.label}
          </Tag>
          <span className={styles.where}>
            {i.place}
            {i.unit && ` · ${i.unit}`}
          </span>
          {!i.sending && (
            <Button size="sm" variant="plain" tilt={0} burst={false} aria-pressed={i.id === selected} onClick={() => setSelected(i.id)}>
              {i.id === selected ? "Showing" : "Details"}
            </Button>
          )}
        </TicketCard>
      </li>
    );
  };

  return (
    <div className={styles.console}>
      <header className={styles.bar}>
        <div>
          <p className={styles.kicker}>Plop! dispatch demo</p>
          <Heading level={1}>Barangay Dispatch</Heading>
        </div>
        <div className={styles.status}>
          <StatusDot tone={live === "live" ? "online" : live === "lost" ? "offline" : "busy"}>
            {live === "live" ? "Live feed" : live === "lost" ? "Reconnecting…" : "Connecting…"}
          </StatusDot>
          <span className={styles.critical}>
            <Count label={`${critical} critical open`}>{critical}</Count> critical open
          </span>
        </div>
      </header>
      <p className={styles.srOnly} aria-live="polite">
        {heard}
      </p>

      {live === "lost" && (
        <Callout tone="warn" title="Lost the live feed" buddy role="status">
          Trying again every few seconds. The queue keeps what it already has.
        </Callout>
      )}

      <div className={styles.grid}>
        <section aria-labelledby="queue-title" className={styles.queue}>
          <Heading level={2} id="queue-title">
            Queue
          </Heading>
          <Tabs defaultValue="open">
            <TabList label="Incidents">
              <Tab value="open" badge={<Count label={`${open.length} open`} tone="ink" size="sm">{open.length}</Count>}>
                Open
              </Tab>
              <Tab value="done">Resolved</Tab>
            </TabList>
            <TabPanel value="open">
              {open.length ? <ul className={styles.list}>{open.map(ticket)}</ul> : <EmptyState>All quiet. Nothing open.</EmptyState>}
            </TabPanel>
            <TabPanel value="done">
              {done.length ? <ul className={styles.list}>{done.map(ticket)}</ul> : <EmptyState>Nothing resolved yet.</EmptyState>}
            </TabPanel>
          </Tabs>
        </section>

        <div className={styles.side}>
          <section aria-labelledby="detail-title">
            <Sheet tape="periwinkle" className={styles.detail}>
              <Heading level={2} id="detail-title">
                {current ? `#${current.id > 0 ? current.id : "…"} ${current.kind}` : "Pick a ticket"}
              </Heading>
              {current && (
                <>
                  <p className={styles.where}>
                    {current.place}
                    {current.note && ` · ${current.note}`}
                  </p>
                  <StatusTimeline
                    label={`Progress of ticket ${current.id}`}
                    steps={[...STAGES]}
                    current={current.stage}
                    times={STAGES.map((_, s) => (current.times[s] ? formatTime(current.times[s]) : undefined))}
                    orientation="auto"
                  />
                </>
              )}
            </Sheet>
          </section>

          <section aria-labelledby="units-title">
            <Heading level={2} id="units-title">
              Units
            </Heading>
            <div className={styles.units}>
              {UNITS.map((u) => {
                const job = open.find((i) => i.unit === u.name);
                return (
                  <UnitCard key={u.id} name={u.name} subtitle={u.crew} avatar={<Avatar name={u.crew} size="sm" status={busy.has(u.name) ? "busy" : "online"} />} tilt={0}>
                    <UnitCardRow>
                      {job ? (
                        <>
                          <Tag status={STAGE_TAG[job.stage]!.status} tone={STAGE_TAG[job.stage]!.tone}>
                            {STAGE_TAG[job.stage]!.label}
                          </Tag>
                          {job.stage === 2 ? <Eta value={4 + (job.id % 5)} unit="min away" /> : <span className={styles.where}>#{job.id}</span>}
                        </>
                      ) : (
                        <Tag status="resolved">Available</Tag>
                      )}
                    </UnitCardRow>
                  </UnitCard>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="report-title">
            <Sheet tape="mustard" className={styles.form}>
              <Heading level={2} id="report-title">
                Send report
              </Heading>
              <form action={formAction} className={styles.fields} noValidate>
                <TextField
                  label="What happened?"
                  name="kind"
                  defaultValue={failed?.values.kind}
                  error={failed?.errors.kind}
                  placeholder="Flooding on the main road"
                  autoComplete="off"
                  required
                />
                <RadioGroup legend="Where?" name="place" vertical={false} defaultValue={failed?.values.place || undefined}>
                  {PLACES.map((p) => (
                    <Radio key={p} value={p}>
                      {p}
                    </Radio>
                  ))}
                </RadioGroup>
                {failed?.errors.place && (
                  <p className={styles.error} role="alert">
                    {failed.errors.place}
                  </p>
                )}
                <RadioGroup legend="Priority" name="priority" vertical={false} defaultValue={failed?.values.critical ? "critical" : "routine"}>
                  <Radio value="routine">Routine</Radio>
                  <Radio value="critical" dotColor="var(--plop-tomato)">
                    Critical
                  </Radio>
                </RadioGroup>
                <TextArea label="Notes" name="note" hint="Optional. Landmarks help the crew find it." defaultValue={failed?.values.note} rows={2} />
                <Button type="submit" loading={sending} loadingLabel="Sending report" buddy="peek">
                  Send report
                </Button>
              </form>
            </Sheet>
          </section>
        </div>
      </div>
    </div>
  );
}
