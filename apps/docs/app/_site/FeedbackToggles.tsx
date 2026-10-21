"use client";

import { HapticsIcon, IconButton, SoundIcon, Tooltip, useHaptics, useSound } from "@plop-ui/react";
import { useEffect, useRef } from "react";
import { useFeedback } from "../_kit/Providers";

/**
 * Header switches for the kit's tactile feedback: phone haptics and the paper
 * "plop" sound. (Paper or cutting mat lives on the home hero title.) Turning one on gives a sample right away, so people know what
 * they just enabled.
 */
export function FeedbackToggles() {
  const { haptics, sound, setHaptics, setSound } = useFeedback();
  const buzz = useHaptics();
  const play = useSound();
  // Set by a click, read after the provider re-renders with the new setting.
  const sample = useRef<"haptics" | "sound" | null>(null);

  useEffect(() => {
    if (sample.current === "haptics" && haptics) buzz.success();
    if (sample.current === "sound" && sound) play("up");
    sample.current = null;
  }, [haptics, sound, buzz, play]);

  return (
    <div className="feedback-toggles" role="group" aria-label="Feedback">
      <Tooltip content={haptics ? "Haptics on" : "Haptics off"} side="bottom">
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
      </Tooltip>
      <Tooltip content={sound ? "Sound on" : "Sound off"} side="bottom">
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
      </Tooltip>
    </div>
  );
}
