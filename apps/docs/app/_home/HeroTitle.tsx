"use client";

import { CuttingMatIcon, IconButton, Lettering, PaperIcon, Tooltip, useReducedMotion } from "@plop-ui/react";
import { useEffect, useId, useState } from "react";
import { useFeedback, useSurfaceSwitch, type SiteSurface } from "../_kit/Providers";

/** The first word of the headline is the surface: drawn by hand on paper, die-cut on the mat. */
const WORD: Record<SiteSurface, string> = { poster: "Hand-drawn", mat: "Die-cut" };
/** The rest of the headline, one entry per line: the first rides along after the word. */
const REST = ["UI,", "imperfect on purpose."] as const;

/**
 * The hero headline, with the site's light/dark switch built in: a round
 * sticker before the first word. Paper says "Hand-drawn"; the cutting mat
 * says "Die-cut". The letters write on at load, and the swapped word writes
 * itself on again after each switch.
 */
export function HeroTitle() {
  const { surface } = useFeedback();
  const swap = useSurfaceSwitch();
  const reduced = useReducedMotion();
  const id = useId();
  const mat = surface === "mat";
  const word = WORD[surface];
  // Rendered fully written on the server; letters only hide once JavaScript can bring them back.
  const [armed, setArmed] = useState(false);
  const [restIn, setRestIn] = useState(false);
  const [wordIn, setWordIn] = useState(false);

  useEffect(() => {
    if (reduced) return;
    setArmed(true);
    const raf = requestAnimationFrame(() => {
      setRestIn(true);
      setWordIn(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Each switch: the new word starts hidden for a frame, then writes on.
  useEffect(() => {
    if (!armed) return;
    setWordIn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setWordIn(true)));
    return () => cancelAnimationFrame(raf);
  }, [surface, armed]);

  return (
    <h1 className="home-h1 hero-title" aria-labelledby={id}>
      {/* The brand leads the heading's text, so search engines and screen readers both hear "PlopUI" first; the logo above shows it. */}
      <span id={id} className="vh">
        PlopUI: {word} {REST.join(" ")}
      </span>
      <span className="hero-title__switch">
        <Tooltip content={mat ? "Back to paper" : "Lay it on the cutting mat"} side="bottom">
          <IconButton
            variant={mat ? "mint" : "mustard"}
            tilt={mat ? 6 : -6}
            burst={false}
            aria-pressed={mat}
            label="Cutting mat"
            icon={mat ? <CuttingMatIcon /> : <PaperIcon />}
            onClick={() => void swap()}
          />
        </Tooltip>
      </span>
      <span className="hero-title__text" aria-hidden="true">
        <span key={word} className="hero-title__word" data-in={wordIn || !armed ? "" : undefined}>
          <Lettering amp={3.4} writeOn={armed}>
            {word}
          </Lettering>
        </span>{" "}
      </span>
      <span className="hero-title__text" aria-hidden="true">
        <span data-in={restIn || !armed ? "" : undefined}>
          <Lettering amp={3.4} writeOn={armed}>
            {REST[0]}
          </Lettering>
          <br />
          <Lettering amp={3.4} writeOn={armed}>
            {REST[1]}
          </Lettering>
        </span>
      </span>
    </h1>
  );
}
