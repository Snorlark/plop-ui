---
"@plop-ui/react": patch
---

Slider draws its full marker track in Safari and on iPhone. With the hand-drawn wobble on, WebKit squashed the track to a hairline; the wobble now sits on a wrapper around the track, so it looks the same in every browser.
