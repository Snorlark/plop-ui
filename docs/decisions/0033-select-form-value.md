# Select submits its value through hidden inputs

Select and MultiSelect have no native `<select>` behind them, so a plain `<form>` or a Next.js Server Action got nothing from them. The `name` prop adds the form value without changing how the field looks or works: the trigger stays a button, and a hidden `<input type="hidden">` carries the value. A hidden input is not focusable and not in the accessibility tree, so the keyboard and screen reader behavior does not change.

A Select always renders one input while it has a name, and its value is an empty string while nothing is picked. A Server Action then reads `formData.get("brush")` as `""` and not as `null`, the same as an empty TextField, and does not have to tell "missing" from "empty". A MultiSelect renders one input per picked option, in the order of `options`, so `getAll(name)` is the list and is empty while nothing is picked.

Only values that are in `options` are submitted. A controlled `value` that no option has shows the placeholder in the trigger, so submitting it would send something the person cannot see.

The inputs are `disabled` when the field is, as a native control is not submitted when disabled. A `loading` field still submits what was picked: its options are on their way, not the choice.

A hidden input does not take part in `form.reset()`: the value follows React state, as it does for every controlled field here, so a form that resets must also reset the state it gave to Select.
