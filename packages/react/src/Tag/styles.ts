import { status as statusTone } from "@plop-ui/tokens";
import { cx } from "../internal/cx.js";
import styles from "./Tag.module.css";
import type { TagProps } from "./types.js";

export { styles };

export function tagClassName({ tone, status, pattern = "stripes", className }: Pick<TagProps, "tone" | "status" | "pattern" | "className">) {
  const resolved = tone ?? (status ? statusTone[status] : "periwinkle");
  return cx(styles.root, styles[resolved], styles[pattern], className);
}

export function textOf(children: TagProps["children"]): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}
