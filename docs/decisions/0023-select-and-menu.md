# 0023: Select, MultiSelect and Menu, hand-rolled

Ported from the standalone dropdown reference (plopui-dropdown.html), with its look and keyboard contract kept.

- No Radix underneath. The kit already hand-rolls a listbox in SearchField; Radix Select and DropdownMenu would add two dependencies and portals that fight the taped-sheet styling. The sheets render in place (absolute) and always drop down; near the bottom of the screen the page scrolls just enough to show them. Flipping upward covered whatever sat above the field.
- Select and MultiSelect share one listbox: focus moves to the list (or the search box when `searchable`) and `aria-activedescendant` tracks the active option. Menu uses real focus on `menuitem` buttons (roving focus), as the menu pattern expects.
- One `Select` with `searchable`, not a separate Combobox: a people picker is a Select with a filter box.
- Picked is never color alone: a tick, a ticked box, or tape with the label on it.
- Menu takes `label` (and `icon` for the round version) instead of a trigger element, so it can wire aria-haspopup, aria-expanded and focus return itself.
- styles.css budget goes from 12 kB to 13 kB: the two components add about 0.6 kB of CSS.
- Examples follow the rebrand: brushes, papers, collaborators, sketch tags and sketch actions.
