"use client";

import { useCallback } from "react";
import { usePlop } from "../PlopProvider/context.js";
import { seed } from "../seed.js";

let ctx: AudioContext | null = null;

/** A tiny paper "plop": a short noise burst plus a pitch blip. Down on press, up on release. */
function plop(kind: "down" | "up") {
  const Ctor = typeof window !== "undefined" ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined;
  if (!Ctor) return;
  ctx ??= new Ctor();
  const t = ctx.currentTime;
  // A short paper "tsk": band-passed noise that fades out (seeded, so every plop sounds the same).
  const len = 0.05;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
  const data = buf.getChannelData(0);
  const rnd = seed(kind);
  for (let i = 0; i < data.length; i++) data[i] = (rnd() * 2 - 1) * (1 - i / data.length) ** 2;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = kind === "down" ? 650 : 1700;
  band.Q.value = 1.1;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.35;
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(t);
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(kind === "down" ? 150 : 320, t);
  osc.frequency.exponentialRampToValueAtTime(kind === "down" ? 90 : 520, t + 0.07);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.22, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Plays a sound only when the person turned sound on in PlopProvider. */
export function useSound(): (kind: "down" | "up") => void {
  const { sound } = usePlop();
  return useCallback(
    (kind) => {
      if (!sound) return;
      try {
        plop(kind);
      } catch {
        // Audio can be blocked; that's fine.
      }
    },
    [sound],
  );
}
