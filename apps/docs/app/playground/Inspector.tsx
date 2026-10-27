"use client";

import { Button } from "@plop-ui/react";
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { Choice, Slider, Swatches, Text } from "./controls";
import { KINDS, type Item } from "./stickers";
import styles from "./tools.module.css";

const GAP = 18;

/**
 * Edit the selected sticker right where it is: a panel beside it on wide screens (flipped or clamped to stay
 * on the board), a bottom sheet on phones (CSS). Words first, then color, size and tilt, then actions; the
 * code is folded away.
 */
export function Inspector({
  item,
  area,
  onChange,
  onFront,
  onDuplicate,
  onPeel,
  onClose,
  code,
}: {
  item: Item;
  /** The board's positioned box; the panel is placed inside it. */
  area: RefObject<HTMLElement | null>;
  onChange: (patch: Partial<Item> | ((it: Item) => Partial<Item>)) => void;
  onFront: () => void;
  onDuplicate: () => void;
  onPeel: () => void;
  onClose: () => void;
  code: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
  const spec = KINDS[item.kind];
  const titleId = `insp-${item.id}`;

  useLayoutEffect(() => {
    const place = () => {
      const box = area.current;
      const el = panel.current;
      const sticker = box?.querySelector<HTMLElement>(`[data-id="${item.id}"]`);
      if (!box || !el || !sticker) return;
      const b = box.getBoundingClientRect();
      const s = sticker.getBoundingClientRect();
      // Positioned against its offset parent, measured against the board itself.
      const host = (el.offsetParent ?? box).getBoundingClientRect();
      const w = el.offsetWidth;
      const h = Math.min(el.scrollHeight, b.height);
      // Right of the sticker if it fits, else left of it, else whichever side has more room.
      const right = s.right - b.left + GAP;
      const left = s.left - b.left - GAP - w;
      const x = right + w <= b.width ? right : left >= 0 ? left : Math.max(0, Math.min(b.width - w, right));
      const y = Math.max(0, Math.min(b.height - h, s.top - b.top));
      setPos({ left: Math.round(x + b.left - host.left), top: Math.round(y + b.top - host.top), maxHeight: Math.floor(b.height) });
    };
    place();
    const ro = new ResizeObserver(place);
    if (panel.current) ro.observe(panel.current);
    if (area.current) ro.observe(area.current);
    return () => ro.disconnect();
  }, [area, item.id, item.x, item.y, item.scale, item.tilt, item.props]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    // Not modal: the board stays usable while it's open.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={panel}
      className={styles.editor}
      role="dialog"
      aria-labelledby={titleId}
      style={pos ? { left: pos.left, top: pos.top, maxHeight: pos.maxHeight } : { visibility: "hidden" }}
      onKeyDown={onKey}
    >
      <div className={styles.editorHead}>
        <h2 id={titleId} className={styles.panelTitle}>
          {spec.name}
        </h2>
        <Button size="sm" variant="plain" onClick={onClose}>
          Done
        </Button>
      </div>
      {spec.fields.map((f) => {
        const v = item.props[f.key];
        const set = (nv: string | number | boolean) => onChange((it) => ({ props: { ...it.props, [f.key]: nv } }));
        if (f.type === "text") return <Text key={f.key} label={f.label} value={String(v ?? "")} onChange={set} />;
        if (f.type === "swatch") return <Swatches key={f.key} label={f.label} value={String(v)} options={f.options} onChange={set} />;
        if (f.type === "choice") return <Choice key={f.key} label={f.label} value={String(v)} options={f.options} onChange={set} />;
        if (f.type === "step") return <Slider key={f.key} label={f.label} value={Number(v)} min={f.min} max={f.max} onChange={set} />;
        return <Choice key={f.key} label={f.label} value={v ? "yes" : "no"} options={[["yes", "Yes"], ["no", "No"]]} onChange={(nv) => set(nv === "yes")} />;
      })}
      <Slider label="Size" value={Math.round(item.scale * 100)} min={50} max={180} step={5} unit="%" onChange={(v) => onChange({ scale: v / 100 })} />
      <Slider label="Tilt" value={item.tilt} min={-20} max={20} step={0.5} unit="°" onChange={(v) => onChange({ tilt: v })} />
      <div className={styles.actions}>
        <Button size="sm" variant="plain" onClick={onFront}>
          To front
        </Button>
        <Button size="sm" variant="plain" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button size="sm" variant="tomato" onClick={onPeel}>
          Peel off
        </Button>
      </div>
      <details className={styles.codeFold}>
        <summary>Code</summary>
        {code}
      </details>
    </div>
  );
}
