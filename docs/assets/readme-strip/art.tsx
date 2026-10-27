// Source of apps/docs/public/readme/tokens.png and fonts.png (1200x440 at 2x), the pictures in the tokens and fonts READMEs.
// To re-render: copy to apps/docs/app/readme-art/page.tsx, run the docs dev server, hide the Ride-along ticket,
// screenshot #tokens and #fonts at deviceScaleFactor 2 into public/readme/, then delete the route again.
"use client";

import { PlopProvider, WordSticker } from "@plop-ui/react";
import { onFill, surfaceNames, surfaces } from "@plop-ui/tokens";

const FILLS = ["ink", "tomato", "mustard", "mint", "periwinkle", "bubblegum"] as const;

/** Pictures for the tokens and fonts READMEs (1200x440 each), rendered from the real packages. */
export default function ReadmeArt() {
  return (
    <PlopProvider surface="poster" haptics={false}>
      <div style={{ display: "grid", gap: 40, padding: 0 }}>
        {/* tokens: the fills with their AA text color and ratio, and the five papers */}
        <div id="tokens" className="plop-surface" style={{ width: 1200, height: 440, padding: "46px 56px", background: "var(--plop-bg)", display: "grid", gap: 34, alignContent: "center" }}>
          <div style={{ display: "flex", gap: 22, justifyContent: "center" }}>
            {FILLS.map((f, i) => (
              <div key={f} style={{ width: 160, height: 150, padding: "16px 16px 14px", display: "grid", alignContent: "space-between", background: `var(--plop-${f})`, color: onFill[f].text, border: "3px solid var(--plop-ink-text)", borderRadius: "16px 12px 18px 13px", boxShadow: "0 0 0 6px var(--plop-paper), 5px 8px 0 6px var(--plop-shadow)", transform: `rotate(${[-3, 2, -1, 3, -2, 1][i]}deg)` }}>
                <span style={{ font: "italic 900 30px var(--plop-font-letter)", textTransform: "uppercase" }}>Aa</span>
                <span style={{ font: "italic 700 14px var(--plop-font-letter)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  {f}
                  <br />
                  <span style={{ font: "400 13px var(--plop-font-body)", textTransform: "none" }}>{onFill[f].ratio}:1 · AA</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
            {surfaceNames.map((s, i) => (
              <div key={s} style={{ borderRadius: "12px 9px 13px 10px", overflow: "hidden", transform: `rotate(${[1.5, -1, 2, -2, 1][i]}deg)`, boxShadow: "4px 6px 0 var(--plop-shadow)" }}>
                <PlopProvider surface={s} haptics={false}>
                  <div style={{ width: 196, height: 110, display: "grid", placeItems: "end start", padding: 12, border: "2.5px solid var(--plop-on)", borderRadius: "12px 9px 13px 10px" }}>
                    <span style={{ font: "italic 700 15px var(--plop-font-letter)", textTransform: "uppercase", color: "var(--plop-on)" }}>{surfaces[s].label}</span>
                  </div>
                </PlopProvider>
              </div>
            ))}
          </div>
        </div>
        {/* fonts: Sketchpop in its weights, italic and upright */}
        <div id="fonts" className="plop-surface" style={{ position: "relative", width: 1200, height: 440, padding: "40px 64px", background: "var(--plop-bg)", color: "var(--plop-ink)", display: "grid", alignContent: "center", gap: 6 }}>
          <div style={{ position: "absolute", right: 70, top: 46 }}><WordSticker tone="mustard" size={56} tilt={-6}>Plop!</WordSticker></div>
          <div style={{ font: "italic 900 104px/1 var(--plop-font-letter)" }}>Sketchpop</div>
          <div style={{ font: "italic 300 34px/1.3 var(--plop-font-letter)" }}>Light · The quick brown fox jumps over the lazy dog</div>
          <div style={{ font: "normal 400 34px/1.3 var(--plop-font-letter)" }}>Regular · Hand-drawn UI, imperfect on purpose</div>
          <div style={{ font: "italic 700 34px/1.3 var(--plop-font-letter)" }}>Bold · AaBbCc 0123456789 !?&amp;</div>
          <div style={{ font: "normal 900 34px/1.3 var(--plop-font-letter)" }}>Black · Squish! Peel! Shipped!</div>
          <div style={{ marginTop: 10, font: "400 18px var(--plop-font-body)", color: "var(--plop-ink-soft)" }}>4 weights × italic and upright · 3 hand-drawn versions of every letter · SIL OFL 1.1</div>
        </div>
      </div>
    </PlopProvider>
  );
}
