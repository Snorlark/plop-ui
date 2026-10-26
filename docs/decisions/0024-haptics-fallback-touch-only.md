# 0024: The iOS haptics fallback is for touch devices only

Browsers without the Vibration API (Safari, and Firefox since it dropped it) got the iOS trick: click a hidden `<input type="checkbox" switch>` so iOS 18 plays a system tick. Clicking its label moves focus to that hidden input. On desktop Firefox and Safari that meant every press blurred the control: a sticker let go of its squish mid-press, keyboard focus landed somewhere invisible, tooltips and search results closed.

- The switch trick now runs only when `navigator.maxTouchPoints > 0` (iPhone, iPad). Desktop browsers without vibration simply get no haptics, which is all they could give anyway.
- Where it runs, focus is handed straight back to the control that was pressed, and a sticker ignores the blur caused by the switch (marked `data-plop-haptic`).
- The e2e suite now also runs on Firefox, WebKit (Safari) and an iPhone profile, which is how this was found.
