# The GPUI port keeps one live toast in an entity

React's `toast()` is a module-level store: any component can push a message without holding state, and one `Toaster` at the root renders whatever is current. The port needs the same ergonomics without a browser singleton, so `ToastQueue` is an ordinary GPUI entity and the app decides where it lives.

`init_toasts(cx)` creates the queue and stores it in a `gpui_kit::Global`; `show_toast(cx, tone, message)` and `dismiss_toast(cx, id)` look that global up. An app that prefers passing state explicitly can create its own `Entity<ToastQueue>` with `cx.new(|_| ToastQueue::new())` and call `show`/`dismiss` directly. The global is a convenience, not the only path.

The queue shows **one toast at a time**, matching the React store: a new message replaces the current one and gets a new id. Auto-dismiss is a spawned task that checks the id before clearing, so an older timer cannot remove a newer toast. The default duration is 4000 ms; `show_for` overrides it. This is deliberately not a stacking queue. The static `PlopToaster` remains available for a design that shows several at once.

`PlopToastHost::new(queue)` is the view. It observes the queue on first render and paints the current toast bottom-centre, above the rest of the UI. The card is a `Role::Status` region with the message as its accessible label; a left click dismisses it by id. Keyboard dismissal is the host app's choice (usually Escape or the action that opened the toast), because the queue is not focusable on its own.

The test drives the queue without a window: show two messages, check that the second replaces the first, dismiss it, and check that the queue is empty. A headless test renders the host and asserts that the callout card and its lettering reach the image.
