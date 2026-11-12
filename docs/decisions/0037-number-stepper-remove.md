# NumberStepper turns − into a trash button at the minimum

Cart rows needed a separate "Remove" button because − disables at `min`. With the optional `onRemove`, − becomes a trash button at `min` instead (#148). Without `onRemove`, nothing changes.

It is the same `<button>` element with a new icon, name (`removeLabel`, default "Remove item") and click handler, not a second button swapped in. React keeps the DOM node, so a keyboard user who presses − down to the minimum keeps focus on it and hears the new name. For the same reason the "hand focus to the input when − disables" rule is skipped when `onRemove` is passed: − never disables there. `aria-controls` is dropped while it is trash, since it no longer changes the input.

Arrow keys and Home on the input never remove. Removing is a deliberate press, not something that happens when you overshoot.

The removal is announced through a shared polite region appended to `document.body` (`internal/announce.ts`), not the stepper's own live region, because the row usually unmounts in the same render and its region would go with it. The text is `removedMessage` (default "Item removed"), so it can be translated or name the item. Moving focus after the row is gone is the app's job, and the docs say so.

The trash button rests as a plain sticker, like −, because a tomato sticker in every cart row read as an alarm. It turns tomato only on hover and while pressed. The icon pops in when it swaps, and reduced motion stops that like every other animation in the stepper. The trash button is the same 48px `sm` IconButton as −.

An opt-in confirm step (`confirmRemove`, a native modal dialog) was built alongside this but left for a follow-up PR: #148 agreed one-press removal, and the dialog's CSS takes `styles.css` past its 16 kB budget, which is a maintainer call.
