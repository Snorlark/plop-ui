"use client";

import { CuttingMatIcon, HapticsIcon, IconButton, PaperIcon, SoundIcon, useHaptics, useSound } from "@plop-ui/react";
import { useEffect, useId, useRef, useState } from "react";
import { useFeedback, useSurfaceSwitch } from "../_kit/Providers";
import { SlidersIcon } from "./handIcons";

/**
 * The header's one settings sticker (Hick's law: one choice in the bar, not three).
 * It opens a small taped sheet with the three sticker toggles: paper or cutting mat
 * (the site's light and dark, torn off like the hero's switch), phone haptics and the
 * paper "plop" sound. Turning haptics or sound on gives a sample right away.
 */
export function FeedbackToggles() {
  const { haptics, sound, setHaptics, setSound, surface } = useFeedback();
  const swap = useSurfaceSwitch();
  const mat = surface === "mat";
  const buzz = useHaptics();
  const play = useSound();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // Set by a switch, read after the provider re-renders with the new setting.
  const sample = useRef<"haptics" | "sound" | null>(null);

  useEffect(() => {
    if (sample.current === "haptics" && haptics) buzz.success();
    if (sample.current === "sound" && sound) play("up");
    sample.current = null;
  }, [haptics, sound, buzz, play]);

  // Escape or a press outside closes it; Escape hands focus back to the sticker.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={root} className="site-settings">
      <IconButton
        ref={trigger}
        size="sm"
        variant={open ? "mustard" : "plain"}
        tilt={-4}
        burst={false}
        label="Settings"
        aria-expanded={open}
        aria-controls={`${id}-sheet`}
        icon={<SlidersIcon />}
        onClick={() => setOpen((o) => !o)}
      />
      <div id={`${id}-sheet`} className="site-settings__sheet" role="group" aria-label="Site settings" hidden={!open}>
        <div className="site-settings__item">
          <IconButton
            size="sm"
            variant={mat ? "mint" : "plain"}
            tilt={2}
            burst={false}
            aria-pressed={mat}
            label="Cutting mat"
            icon={mat ? <CuttingMatIcon /> : <PaperIcon />}
            onClick={() => void swap()}
          />
          <span aria-hidden="true">{mat ? "Cutting mat" : "Paper"}</span>
        </div>
        <div className="site-settings__item">
          <IconButton
            size="sm"
            variant={haptics ? "mint" : "plain"}
            tilt={-4}
            burst={false}
            aria-pressed={haptics}
            label="Haptics"
            icon={<HapticsIcon off={!haptics} />}
            onClick={() => {
              sample.current = haptics ? null : "haptics";
              setHaptics(!haptics);
            }}
          />
          <span aria-hidden="true">{haptics ? "Haptics on" : "Haptics off"}</span>
        </div>
        <div className="site-settings__item">
          <IconButton
            size="sm"
            variant={sound ? "mustard" : "plain"}
            tilt={3}
            burst={false}
            aria-pressed={sound}
            label="Sound"
            icon={<SoundIcon off={!sound} />}
            onClick={() => {
              sample.current = sound ? null : "sound";
              setSound(!sound);
            }}
          />
          <span aria-hidden="true">{sound ? "Sound on" : "Sound off"}</span>
        </div>
      </div>
    </div>
  );
}
