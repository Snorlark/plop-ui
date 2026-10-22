# 0019: Mega-menu header and a screen-sized 404

**Header**
- Four menu triggers replace the flat link row: Components, Guides, Playground, Community. Each opens a sheet of grouped links and one featured card.
- Each panel follows its trigger in the DOM (a disclosure, not an ARIA menu), so Tab walks straight into it. Escape closes the panel and returns focus to the trigger.
- Panels open on hover or click.
- At the top of the page the bar has no background at all. Once you've scrolled, it hides while you scroll down and returns when you scroll up or tab into it.
- When it returns, it's printed on the page's own background: the grainy paper, or the cutting mat in the dark look. The menu panels and the phone sheet use the same background, pinned so the texture lines up with the page. Their text follows the surface: ink on paper, cream on the mat.
- There's no frosted glass and no rule under the bar.
- The bar publishes its height as `--header-offset`, so sticky sidebars and anchor jumps sit below it.
- A menu opened by hover closes when the cursor moves off it (onto the dimmed page counts too).
- Phones get a burger that opens every menu as one sheet.
- The search pill and the haptics/sound stickers stay as they were. There's no "Get started" button.

**404**
- One screen-sized scene under the site header: the crew still building the page, the buddy as the 0. The only text is one title line, "This page is still on the press."
- Three buttons sit under the scene: Go back, Back to home, Browse components. The pause button covers WCAG 2.2.2, and tapping the buddy makes it talk.
- No footer and no Ride-along ticket, so the scene and the buttons fit on one screen without scrolling.
- On phones the scene is scaled up and its outer edges run off-screen, so the 404 stays big.
