---
"@plop-ui/react": minor
---

`NumberStepper` gains `onRemove`: when it's passed, the − button turns into a trash button at `min` instead of disabling, so a cart row can remove an item from its stepper. Name it with `removeLabel` (default "Remove item"). Pressing it announces `removedMessage` (default "Item removed"), even if the row unmounts. The trash button also turns tomato on hover and press. Without `onRemove`, nothing changes.
