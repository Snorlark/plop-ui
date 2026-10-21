# 0010 — A cast of characters, one per state

**Decision.** `Buddy` draws six characters, and each one stands for one state everywhere in the kit: Pip (success), Bix (error), Snooze (stale), Confetti (congrats), Specs (preview) and Hum (thinking). `BuddyPeek` sits any of them on the top edge of any component, head behind and hands in front, like the Button buddy. `Toast` (and `toast()`), and `Callout` take `buddy`: `true` picks the character for the kind or tone, or name a mood.

**Why.** The avatars were decoration; giving each character one job makes them a second, faster way to read state, the way the kit's colors already are.

**Rules.** A character never carries the message alone: it is aria-hidden unless given a `label`, and the words beside it say what happened. One-shot reactions (sparkle, wince, confetti) play once; only "still going" states (Snooze's z's, Hum's bubbles) loop. All of it holds still under reduced motion.
