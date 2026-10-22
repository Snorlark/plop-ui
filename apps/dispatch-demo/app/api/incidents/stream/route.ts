import { initialIncidents, makeIncident, rng, UNITS, type Incident, type Stage, type StreamEvent } from "../../../../lib/incidents";

export const dynamic = "force-dynamic";

const TICK_MS = 4000;

/**
 * Server-Sent Events: the live side of the queue. Each connection runs its own
 * small simulation from the same starting queue the page rendered: every few
 * seconds a new incident comes in or an open one moves to its next stage.
 * Nothing is shared between visitors, so the demo needs no database.
 */
export function GET(request: Request) {
  const encoder = new TextEncoder();
  const r = rng(Date.now());
  const queue: Incident[] = initialIncidents(Date.now());
  let nextId = 1045;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      const tick = () => {
        const now = Date.now();
        const open = queue.filter((i) => i.stage < 4);
        if (open.length < 3 || r() < 0.35) {
          const incident = makeIncident(nextId++, r, now);
          queue.push(incident);
          send({ type: "incident", incident });
          return;
        }
        const target = open[Math.floor(r() * open.length)]!;
        target.stage = (target.stage + 1) as Stage;
        target.times[target.stage] = now;
        if (target.stage === 1) target.unit = UNITS[Math.floor(r() * UNITS.length)]!.name;
        send({ type: "update", id: target.id, stage: target.stage, at: now, unit: target.unit });
      };

      controller.enqueue(encoder.encode("retry: 3000\n\n"));
      const timer = setInterval(tick, TICK_MS);
      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
