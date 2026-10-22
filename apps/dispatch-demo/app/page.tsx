import { initialIncidents } from "../lib/incidents";
import { Console } from "./Console";

// Rendered per request, so the first queue is "now" and the stream picks up from there.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main id="main">
      <Console initial={initialIncidents(Date.now())} />
    </main>
  );
}
