/**
 * The SVG filters every hand-drawn outline points at: three "wobble"
 * displacement filters (swapped to make lines boil) and a "crayon" filter
 * for lettering. Rendered once by PlopProvider; safe in Server Components.
 */
const wobble = (id: string, seedA: number, seedB: number, scale = 3.5, frequency = 0.035) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%" key={id}>
    <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={2} seed={seedA} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" result="d" />
    <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={1} seed={seedB} result="g" />
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 2.75" result="m" />
    <feComposite in="d" in2="m" operator="in" />
  </filter>
);

export const BOIL_FILTERS = ["plop-wob1", "plop-wob2", "plop-wob3"] as const;

export function PlopFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {wobble("plop-wob1", 2, 21)}
        {wobble("plop-wob2", 7, 33)}
        {wobble("plop-wob3", 13, 47)}
        {wobble("plop-crayon", 4, 17, 2.4, 0.5)}
      </defs>
    </svg>
  );
}
