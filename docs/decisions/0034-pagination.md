# Pagination reuses sticker controls and the changelog uses page URLs

Pagination composes Button and ButtonLink rather than drawing a second sticker system. Ink marks the current page; paper stickers keep other destinations quiet. The existing seeded tilt, offset shadow, paper edge, keyboard press and reduced-motion behavior stay consistent with the kit. The root and href builder can run on the server; event handlers live in a small client control.

Native anchors handle URL navigation and native buttons handle local page changes. aria-current identifies the selected page. Ellipses have no interaction. Keep first/last and neighbouring pages visible, with a bounded number of controls even for very large counts. Native disabled buttons replace unavailable links at the bounds, so they cannot navigate or enter keyboard order.

The changelog renders four minor-version cards per page on the server. Next.js output tracing explicitly includes package changelogs and changeset notes because this query-driven route reads them at runtime, rather than only during static generation. Package filtering runs before pagination, so it never leaves empty pages of hidden cards. Page and package live in the query string; links support browser Back, bookmarking and operation without JavaScript. The existing radio filter pushes those URLs when JavaScript is available and has a native GET form with a noscript submit button otherwise.

Release timelines and the phone jump selector navigate to the release's page. Existing fragment-only release links are resolved to their new page by a small client bridge; folded releases still open when addressed. Static fragment-only links to old pages require JavaScript to resolve because URL fragments are not sent to the server.
