import type { CSSProperties } from "react";
import { useSeed } from "../internal/useSeed.js";
import { Lettering } from "../Lettering/Lettering.js";
import { seededTilt } from "../seed.js";
import { tagClassName } from "./styles.js";
import { TagRemovable } from "./TagRemovable.js";
import type { TagProps } from "./types.js";

export type { TagPattern, TagProps, TagTone } from "./types.js";

/**
 * A strip of washi tape for status labels and filters. Without `onRemove` it
 * renders as a Server Component with no client JavaScript.
 */
export function Tag(props: TagProps) {
  const autoSeed = useSeed(props.seed);
  const tilt = props.tilt ?? seededTilt(autoSeed, 3);
  if (props.onRemove) return <TagRemovable {...props} tilt={tilt} />;
  return (
    <span id={props.id} className={tagClassName(props)} style={{ "--tilt": `${tilt}deg` } as CSSProperties} data-plop-tag="">
      <Lettering amp={1.6}>{props.children}</Lettering>
    </span>
  );
}
