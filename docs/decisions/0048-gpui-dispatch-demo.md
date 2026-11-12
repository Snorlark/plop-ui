# The port gets a second example: a dispatch console

The gallery shows every component, but it is a specimen sheet: each section is independent and nothing needs state. That is not the same as proving the kit builds an app.

`examples/dispatch.rs` rebuilds the React `apps/dispatch-demo` in GPUI. It starts with three open tickets and one resolved, keeps a single selected ticket, and composes `PlopTabs`, `PlopTicketCard`, `PlopSheet`, `PlopStatusTimeline`, `PlopUnitCard`, `PlopTextField`, `PlopEmptyState` and the toast host in one window, the same way an application would.

The state is deliberately small: a `Vec<Ticket>`, a selected id and a search entity. The stage button walks REPORTED → DISPATCHED → EN ROUTE → ON SCENE; the final step sets `resolving` for 900 ms and shows the loading button, because the loading state only earns its keep when something actually waits. Reports append a ticket from the field and select it. Every action that changes the queue shows a toast.

Search is filtered during render: `PlopSearchField` wraps a `gpui-base` input, so the page has to observe the input entity (`cx.observe(&search, …)`) and re-render on every keystroke. Without that subscription the field updates and the list does not. The filter matches kind, place and assigned unit, and one `PlopEmptyState` serves both empty cases: **CLEAR SEARCH** when a query is what emptied the queue, **SHOW RESOLVED** / **SHOW OPEN** when the tab did.

⌘Enter / Ctrl+Enter files the report from anywhere in the window. It is a `capture_key_down` on the root, the same mechanism the command palette uses, so it works while the caret sits in the report field or in the search box. The same handler gives the queue its two search keys: **/** focuses the search unless a text field already has focus (otherwise it would swallow the slash), and **Escape** clears a non-empty query and stops there, so it never closes something the user did not open.

Layout lessons went back into the demo, not the library:

- The queue scrolls independently (`overflow_y_scroll`) so a long list never pushes the report form off the window.
- The report form is a `PlopCard`, not a bare field on the page. That keeps its ink label on cream paper in both themes and exercises the paper rule from ADR 0047.
- The window is 1240×1120 with a 1024×860 minimum; the capture path takes the same height, so the screenshot is the real first frame rather than a cropped one. `PLOP_DISPATCH_QUERY` opens the app pre-filtered, which is how the empty state was captured.

It stays an example: not a published package, no network stream, no persistence. The point is to compile against the public API, not to add a second product to maintain. `cargo clippy --workspace --all-targets` builds it, and `PLOP_CAPTURE_OUT=… cargo run -p plopui-gpui --example dispatch` renders it headlessly.
