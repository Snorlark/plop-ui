# A native number input between two round stickers

NumberStepper is an `<input type="number">` with a real label, so screen readers hear a spinbutton with its value, mobile keyboards open the number pad, and `name` submits with the form. The − and + are `IconButton`s in the `plain` variant at `sm` size, named "Decrease {label}" and "Increase {label}" so a cart full of steppers never reads as a list of identical "Increase" buttons. The browser's own spin arrows are hidden, because the stickers do that job.

ArrowUp, ArrowDown, Home and End are handled in the component rather than left to the browser. Browsers step a number input on the arrows but do nothing on Home/End, and they disagree on how to snap an off-step value. Handling all four keeps the clamping and step rules in one place, shared with the buttons and with controlled values, and makes them testable in JSDOM. A consumer's `preventDefault()` in `onKeyDown` still wins.

What you type is kept as a draft. A typed number that is already in range and on a step commits right away. Anything else (empty, 120 when the max is 20) waits until blur or Enter, then clamps and snaps. Committing every keystroke would make "12" impossible to type when the minimum is 5, because "1" would jump to 5.

The − and + buttons disable at the limits instead of using `aria-disabled`, so they read and behave like any disabled button. When the focused button becomes disabled (pressing + up to the max), focus moves to the input instead of dropping to the page. Button presses are announced through a polite live region, because focus stays on the button and the input's new value wouldn't otherwise be read. Typing and arrow keys don't announce: the spinbutton already does.

The paper box takes a small seeded tilt and TextField's wobbly outline and label highlighter. Reduced motion stops the boil and the highlighter swipe.

Both sizes keep every target at 44px or more: the `sm` IconButtons render at 48px, and the input has a 44px minimum height at `sm` and `md`. `sm` saves width (narrower input, tighter gaps), not height, since the buttons already set the row height.
