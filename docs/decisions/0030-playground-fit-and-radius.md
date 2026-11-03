# 0030: Measured tray previews, and a Radius slider only where it does something

Two Playground fixes that each had a simpler-looking option.

- **Tray previews are measured, not hand-scaled.** Each preview is shrunk to fit its tile and centered by what you
  can see, including what hangs outside its layout box (a Buddy's head, a Tooltip's bubble). A scale per kind was the
  smaller change, but it only holds for today's labels, font and tile width, and it can't see those overhangs. The
  cost is a little layout measuring per tile, and a CSS fallback scale until hydration. Scale is capped at 0.6, so a
  small sticker doesn't balloon to fill its tile.
- **The Radius slider is hidden, not disabled, on components it can't change.** Percent radii and circles ignore
  `--plop-roundness` (IconButton, Avatar, Tag, ...), and a disabled control would still promise an option that doesn't
  exist for them. Each Playground entry declares `rounds`, and an e2e test measures real corners to keep that honest. A
  hidden slider's value is kept for the next component but stays out of the preview and the copied code. The sticker
  board's slider stays: it applies to the whole board.
