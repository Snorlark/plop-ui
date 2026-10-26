/** Hand-drawn icons in the kit's marker stroke (see packages/react/src/icons.tsx), for the site's own scenes. */
export const marker = { fill: "none", stroke: "currentColor", strokeWidth: 2.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path {...marker} strokeWidth={3.4} d="M8.5 5 C 8.2 9.5, 8.8 14.5, 8.4 19 M15.6 5.2 C 15.9 9.8, 15.3 14.2, 15.7 18.8" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path {...marker} fill="currentColor" d="M7.5 4.8 C 11.5 6.8, 15.5 9.4, 19 12.2 C 15.4 14.6, 11.6 17, 7.8 19.3 C 7.2 14.5, 7.4 9.6, 7.5 4.8 Z" />
    </svg>
  );
}

/** Two slider knobs: the header's settings sticker. */
export function SlidersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path {...marker} d="M4 7.5 C 9 7.2, 15 7.8, 20 7.4 M4 16.6 C 9 16.9, 15 16.3, 20 16.7" />
      <circle cx="9" cy="7.4" r="2.6" fill="var(--plop-paper)" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="15.5" cy="16.6" r="2.6" fill="var(--plop-paper)" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}
