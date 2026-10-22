"use server";

import { PLACES, type Incident } from "../lib/incidents";

export type ReportState =
  | { ok: true; incident: Incident }
  | { ok: false; errors: { kind?: string; place?: string }; values: { kind: string; place: string; note: string; critical: boolean } };

let nextId = 2001;

/**
 * Files a new report. A real app would write to a database here; the demo
 * waits a moment (so the loading button and the optimistic ticket show) and
 * hands the new incident back to the queue.
 */
export async function sendReport(_prev: ReportState | null, form: FormData): Promise<ReportState> {
  const kind = String(form.get("kind") ?? "").trim();
  const place = String(form.get("place") ?? "");
  const note = String(form.get("note") ?? "").trim();
  const critical = form.get("priority") === "critical";

  const errors: { kind?: string; place?: string } = {};
  if (kind.length < 3) errors.kind = "Say what happened in a few words, like “Flooding on the main road”.";
  if (!PLACES.includes(place)) errors.place = "Pick where it is.";
  if (errors.kind || errors.place) return { ok: false, errors, values: { kind, place, note, critical } };

  await new Promise((done) => setTimeout(done, 900));
  return { ok: true, incident: { id: nextId++, kind, place, critical, note: note || undefined, stage: 0, times: [Date.now()] } };
}
