# A native range input with a marker track and a sticker thumb

Slider uses the browser's range input for pointer/touch dragging, keyboard adjustment, focus, forms and accessibility. It adds no slider role or replacement keyboard algorithm. A real label supplies its name; formatted values become aria-valuetext, and the optional visible value is hidden from assistive technology to avoid duplicate announcements.

The visual vocabulary comes from Button, Switch and Progress: a seeded curved marker line, a mustard sticker thumb, an irregular radius, a paper cut edge, an offset ink shadow, a fast squish and a spring release. Colors, fonts, radii and motion use existing tokens. The track itself never animates behind the moving input. Reduced motion removes the thumb transforms and transitions; forced colors restore the browser's native control.

The native thumb stays native rather than introducing a second positioned thumb or custom drag handlers. The decorative SVG track is inset by half a thumb so its endpoints match the native thumb's travel. A clip rectangle reveals the fill at the thumb’s horizontal position. SVG dashes combined with non-scaling strokes can wrap and lag behind the thumb after resizing, so they are not used for the fill. RTL mirrors the marker track. Surface text roles provide contrast across the five surfaces, in light and dark.

Value props are numeric. Controlled and uncontrolled values share clamping and step alignment so labels, marker fill and the native thumb agree. An uncontrolled slider resets to its initial value with its owning form, including external form associations; a cancelled reset is respected.

Both Playground radius controls, numeric prop controls and sticker inspector controls reuse Slider. Remove the old global range pseudo-element CSS so it cannot override the library's styling. Two-thumb ranges remain outside this issue's scope.
