import "./styles/global.css";

export { PlopProvider, type PlopProviderProps, type PlopTheme } from "./PlopProvider/PlopProvider.js";
export { usePlop, type PlopSettings, type ReducedMotionSetting } from "./PlopProvider/context.js";
export { PlopFilters } from "./PlopFilters.js";

export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./Button/Button.js";
export { IconButton, type IconButtonProps } from "./IconButton/IconButton.js";
export { Tag, type TagPattern, type TagProps, type TagTone } from "./Tag/Tag.js";
export { Switch, type SwitchColor, type SwitchProps } from "./Switch/Switch.js";
export { Checkbox, type CheckboxProps } from "./Checkbox/Checkbox.js";
export { StatusTimeline, type StatusTimelineProps, type TimelineStep } from "./StatusTimeline/StatusTimeline.js";
export { Toast, Toaster, type ToastProps } from "./Toast/Toaster.js";
export { toast, type ToastKind, type ToastOptions } from "./Toast/store.js";
export { Lettering, type LetteringProps } from "./Lettering/Lettering.js";
export { useInkBurst } from "./InkBurst/useInkBurst.js";
export { BURST_COLORS } from "./InkBurst/burst.js";

export { useHaptics, HAPTIC_PATTERNS, type Haptics } from "./hooks/useHaptics.js";
export { useBoil, type UseBoilOptions } from "./hooks/useBoil.js";
export { useReducedMotion } from "./hooks/useReducedMotion.js";
export { useSound } from "./hooks/useSound.js";

export { onColor, contrastRatio, parseColor, luminance, DEEP_INK, CREAM, type OnColorResult } from "./contrast.js";
export { seed, seededTilt, seededPick, hashString, type Seed } from "./seed.js";
export { PlusIcon, CloseIcon, PinIcon, PhoneIcon, BellIcon, CheckIcon, InfoIcon, WarnIcon, ErrorIcon, SuccessIcon } from "./icons.js";
