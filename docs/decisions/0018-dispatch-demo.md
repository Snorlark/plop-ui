# 0018: Dispatch demo runs on a per-visitor simulation

`apps/dispatch-demo` is a live incident queue, built only from Plop! components, to prove the kit holds up in a real Next.js ops screen.

- **Data:**
  - The page renders the starting queue on the server for each request, so it is always "now".
  - A Server-Sent Events Route Handler then moves it forward: every few seconds a new incident comes in, or an open one reaches its next stage.
  - Each connection runs its own small seeded simulation, so the demo needs no database and visitors never see each other's reports.
- **Reports:**
  - "Send report" is a Server Action called through `useActionState`.
  - `useOptimistic` puts a "Sending…" ticket in the queue at once, and the loading button shows the wait.
  - Validation errors come back from the server and keep what was typed.
- **Times:** formatted with one fixed time zone (Asia/Manila), so the server render and hydration match.
- **Not done yet:** deployment, the footer link and a case study page (tracked privately).
