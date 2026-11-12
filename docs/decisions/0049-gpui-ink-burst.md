# Sticker buttons throw ink again

React's press feedback is part of the kit's identity: a sticker squishes and throws a short ink burst. The GPUI port only had a click.

The burst is implemented as an app-wide queue, the same shape as the toast queue. `PlopButton` and `PlopIconButton` post `(click position, page ink)` from their click wrapper; `PlopInkBurstHost` renders each entry as an 84 px canvas centered on that position and removes it after the animation. A host installs both with `install_ink_bursts(cx)` and renders the returned view last in the root. If nobody installs it, `ink_burst` is a no-op, so component tests and small embeds never need the host.

Geometry is seeded: nine radial strokes with seeded bend, plus five droplets, all from `seed("ink-burst")`. No `random()` runs at paint time, matching the rest of the port. The color is `theme.mode().on`, so the splat is cobalt on cream and cream on dark paper; it never borrows the sticker's fill and disappears into it.

The animation is a one-shot `with_animation` on a fresh element id per burst, 460 ms. GPUI's `AnimationElement` already renders one-shots at their end frame under `App::reduce_motion`, and the painter's alpha is zero at the end, so reduced motion gets no burst without a branch in our code.

What is not here: the squish and the haptics. A squish needs the pressed state of a `RenderOnce` button, which the port has no place to keep without making every button an entity; the burst only needs a click, which the wrapper already sees. Haptics are a phone feature. Both stay recorded as known limits.

Tests: `pressing_a_button_throws_an_ink_burst` counts one entry after Space, two after Enter and three after a pointer click; `ink_burst_paints_warm_marks` renders the painter on black and fails if fewer than 30 tomato pixels arrive.
