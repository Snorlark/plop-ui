"use client";

import { Avatar, BellIcon, CheckIcon, HapticsIcon, PinIcon, PhoneIcon, PlusIcon, SoundIcon } from "@plop-ui/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
 * TEMPORARY: a floating picker to compare the scroll transition from the
 * hero into the open letter. Delete the unused options (and the picker) once
 * a choice is made. Paper vs cutting mat is the header toggle now.
 */

type Anim = "drift" | "burst" | "sheet";

const ANIMS: Array<[Anim, string]> = [
  ["drift", "Drift"],
  ["burst", "Pop burst"],
  ["sheet", "Sheet slide"],
];
const KEY = "plop-home-preview";

const NAMES = ["Rosa Santos", "Jun Reyes", "Mika Tan", "Ana Cruz", "Ben Ocampo", "Gab Reyes", "Lia Torres", "Enzo Lopez", "Kat Robles", "Sol Javier", "Pia Santos", "Leo Garcia"];
const ICONS = [
  { icon: <PlusIcon />, fill: "var(--plop-mustard)" },
  { icon: <BellIcon />, fill: "var(--plop-bubblegum)" },
  { icon: <CheckIcon />, fill: "var(--plop-mint)" },
  { icon: <PinIcon />, fill: "var(--plop-periwinkle)" },
  { icon: <PhoneIcon />, fill: "var(--plop-tomato)" },
  { icon: <HapticsIcon />, fill: "var(--plop-mint)" },
  { icon: <SoundIcon />, fill: "var(--plop-mustard)" },
];

/*
 * Where each burst piece lands, as [x, y] in % of the letter section: down
 * both margins, clear of the text column. Fixed, so it's the same every time.
 */
const LANDINGS: Array<[number, number]> = [
  [2, 4], [6, 28], [1, 52], [5, 76], [2, 98],
  [93, 2], [88, 26], [95, 50], [89, 74], [94, 96],
  [16, -10], [30, -16], [44, -8], [58, -15], [72, -9], [84, -16],
];

/** 2. Avatars and icons burst up out of the crowd and land around the letter, once. */
function Burst({ armed }: { armed: boolean }) {
  return (
    <div className="home-burst" data-in={armed ? "" : undefined} aria-hidden="true" data-plop-motion="reduce">
      {LANDINGS.map(([x, y], i) => (
        <span
          key={i}
          className="home-burst__piece"
          style={{ "--i": i, "--x": `${x}%`, "--y": `${y}%`, "--from": `${50 - x}vw`, "--r": `${((i * 37) % 30) - 15}deg` } as CSSProperties}
        >
          {i % 3 === 1 ? (
            <span className="gap-icon" style={{ "--fill": ICONS[i % ICONS.length]!.fill } as CSSProperties}>
              {ICONS[i % ICONS.length]!.icon}
            </span>
          ) : (
            <Avatar name={NAMES[i % NAMES.length]!} size={i % 4 === 0 ? "xl" : "lg"} />
          )}
        </span>
      ))}
    </div>
  );
}

/** Wraps the hero and the section after it: picks the background and the transition between them. */
export function Preview({ hero, next }: { hero: ReactNode; next: ReactNode }) {
  const [anim, setAnim] = useState<Anim>("drift");
  const [armed, setArmed] = useState(false);
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (ANIMS.some(([v]) => v === saved.anim)) setAnim(saved.anim);
    } catch {
      // No storage: start from the defaults.
    }
  }, []);

  // The burst fires once, when the letter starts coming into view.
  useEffect(() => {
    setArmed(false);
    const el = nextRef.current;
    if (anim !== "burst" || !el) return;
    if (typeof IntersectionObserver === "undefined") return setArmed(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [anim]);

  const save = (next: Anim) => {
    setAnim(next);
    try {
      localStorage.setItem(KEY, JSON.stringify({ anim: next }));
    } catch {
      // Fine: the choice just lasts for this visit.
    }
  };

  return (
    <div className="home-flow" data-anim={anim}>
      <div className="home-top">
        {hero}
      </div>
      <div className="home-next" ref={nextRef}>
        {anim === "burst" && <Burst armed={armed} />}
        {next}
      </div>
      <div className="preview-picker" role="group" aria-label="Preview options (temporary)">
        <span className="preview-picker__title">Preview</span>
        <fieldset>
          <legend>Scroll transition</legend>
          {ANIMS.map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="pv-anim" checked={anim === value} onChange={() => save(value)} />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
