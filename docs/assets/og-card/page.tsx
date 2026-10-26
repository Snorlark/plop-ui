// Source of apps/docs/app/opengraph-image.png (1200x630), built from the real library.
// To re-render: copy this file to apps/docs/app/og-card/page.tsx, run the docs dev server, screenshot the #og element
// at a 1200x630 viewport, save it as app/opengraph-image.png, then delete the og-card route again.
import { Avatar, Button, Count, StickyNote, Switch, Tag, Toast } from "@plop-ui/react";
import type { CSSProperties, ReactNode } from "react";
import { Wordmark } from "../_site/Wordmark";

/*
 * TEMPORARY: renders the 1200×630 social card (screenshot → app/opengraph-image.png).
 * The desk layout: a cutting mat, the logo on a torn sheet of paper in the middle, and real PlopUI
 * pieces scattered around it: a to-do sticky note, stickers, a polaroid of the crew, pencils.
 */

function At({ x, y, rot = 0, w, z = 3, children, style }: { x: number; y: number; rot?: number; w?: number; z?: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ position: "absolute", left: x, top: y, width: w, zIndex: z, rotate: `${rot}deg`, ...style }}>{children}</div>;
}

const tape = (c: string) =>
  ({
    position: "absolute", height: 26, clipPath: "polygon(3% 0, 97% 0, 100% 20%, 96% 40%, 100% 60%, 96% 80%, 100% 100%, 3% 100%, 0 80%, 4% 60%, 0 40%, 4% 20%)",
    background: `repeating-linear-gradient(-45deg, color-mix(in srgb, ${c} 85%, transparent) 0 7px, color-mix(in srgb, ${c} 55%, white) 7px 14px)`,
  }) as CSSProperties;

function FaceStar({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ overflow: "visible", filter: "drop-shadow(3px 5px 0 rgba(10,30,20,.3))" }}>
      <path d="M0 -50 L14 -17 L49 -15 L22 8 L31 43 L0 24 L-31 43 L-22 8 L-49 -15 L-14 -17 Z" fill="#FFFDF7" stroke="#FFFDF7" strokeWidth="18" strokeLinejoin="round" />
      <path d="M0 -50 L14 -17 L49 -15 L22 8 L31 43 L0 24 L-31 43 L-22 8 L-49 -15 L-14 -17 Z" fill={fill} stroke="var(--plop-ink)" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="-9" cy="-2" r="3.6" fill="var(--plop-ink)" />
      <circle cx="9" cy="-2" r="3.6" fill="var(--plop-ink)" />
      <path d="M-9 8 Q0 16 9 8" fill="none" stroke="var(--plop-ink)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

function Star({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ overflow: "visible", filter: "drop-shadow(2px 4px 0 rgba(10,30,20,.3))" }}>
      <path d="M0 -50 L14 -17 L49 -15 L22 8 L31 43 L0 24 L-31 43 L-22 8 L-49 -15 L-14 -17 Z" fill="#FFFDF7" stroke="#FFFDF7" strokeWidth="18" strokeLinejoin="round" />
      <path d="M0 -50 L14 -17 L49 -15 L22 8 L31 43 L0 24 L-31 43 L-22 8 L-49 -15 L-14 -17 Z" fill={fill} stroke="var(--plop-ink)" strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
}

function Clip({ color, h = 54 }: { color: string; h?: number }) {
  return (
    <svg width={h * 0.42} height={h} viewBox="0 0 20 48" style={{ overflow: "visible" }}>
      <path d="M6 14 L6 36 C6 42, 14 42, 14 36 L14 8 C14 2, 3 2, 3 8 L3 38 C3 47, 17 47, 17 38 L17 16" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Pencil({ len, body, stripe }: { len: number; body: string; stripe: string }) {
  return (
    <svg width={len} height={34} viewBox={`0 0 ${len} 34`} style={{ overflow: "visible", filter: "drop-shadow(3px 6px 0 rgba(10,30,20,.3))" }}>
      <rect x="0" y="4" width={len - 70} height="26" fill={body} stroke="var(--plop-ink)" strokeWidth="2.5" />
      <path d={`M0 13 L${len - 70} 13 M0 21 L${len - 70} 21`} stroke={stripe} strokeWidth="3" />
      <path d={`M${len - 70} 4 L${len - 8} 17 L${len - 70} 30 Z`} fill="#F2D7B0" stroke="var(--plop-ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d={`M${len - 26} 13 L${len - 8} 17 L${len - 26} 21 Z`} fill={body} />
    </svg>
  );
}

const sheetEdge = (() => {
  const top = [0, 3, 1, 4, 2, 5, 1, 3, 0, 4, 2, 3];
  const n = 30;
  const t = Array.from({ length: n + 1 }, (_, i) => `${((i / n) * 100).toFixed(2)}% ${top[i % top.length]}%`);
  const b = Array.from({ length: n + 1 }, (_, i) => `${(100 - (i / n) * 100).toFixed(2)}% ${100 - top[(i + 5) % top.length]!}%`);
  return `polygon(${t.join(", ")}, ${b.join(", ")})`;
})();

export default function OgCard() {
  return (
    <div id="og" data-plop-surface="mat" data-plop-theme="light" className="plop-surface" style={{ position: "relative", width: 1200, height: 630, overflow: "hidden", fontFamily: "var(--plop-font-letter)" }}>
      <style>{`[class*=ridealong_corner], .skip-link, nextjs-portal { display: none !important; } body { margin: 0; }`}</style>

      {/* mat texture: grain and a soft light in the middle */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\"), radial-gradient(ellipse 60% 55% at 50% 50%, rgba(255,255,255,.12), transparent 70%), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.28))",
          backgroundSize: "220px 220px, 100% 100%, 100% 100%",
        }}
      />

      {/* top left: smiling star, to-do note, hand-drawn tape label */}
      <At x={22} y={18} rot={-8}><FaceStar size={118} fill="var(--plop-mustard)" /></At>
      <At x={146} y={30} rot={-4} w={196}>
        <StickyNote tone="mustard">
          <span style={{ display: "block", font: "italic 700 16px var(--plop-font-letter)", textTransform: "uppercase", borderBottom: "2px solid var(--plop-ink)", paddingBottom: 4, marginBottom: 8 }}>To-do</span>
          <span style={{ display: "grid", gap: 4, fontSize: 17 }}>
            <span><b style={{ color: "var(--plop-tomato)" }}>✓</b> Squish</span>
            <span><b style={{ color: "var(--plop-tomato)" }}>✓</b> Peel</span>
            <span><b style={{ color: "var(--plop-ink)" }}>○</b> Plop!</span>
          </span>
        </StickyNote>
      </At>
      <At x={318} y={52} rot={22} z={5}><Clip color="var(--plop-tomato)" /></At>
      <At x={334} y={146} rot={-6} z={6}><Tag tone="mustard" tilt={0}>Hand-drawn</Tag></At>
      <At x={70} y={214} rot={-12}><Star size={56} fill="var(--plop-bubblegum)" /></At>

      {/* top middle: button and switch */}
      <At x={436} y={40} rot={4}><Button size="lg" tilt={0}>Post sketch</Button></At>
      <At x={642} y={44} rot={-3}><Switch defaultChecked aria-label="Sound" /></At>

      {/* top right: avatar sticker and the crew polaroid */}
      <At x={740} y={104} rot={4} z={4}>
        <span style={{ display: "inline-grid", padding: 6, borderRadius: "50%", background: "#FFFDF7", boxShadow: "3px 6px 0 rgba(10,30,20,.3)" }}>
          <Avatar name="Jun Bautista" size="xl" />
        </span>
      </At>
      <At x={888} y={12} rot={4} z={3}>
        <figure style={{ margin: 0, padding: "14px 14px 8px", width: 248, background: "#FFFDF7", boxShadow: "4px 8px 0 rgba(10,30,20,.3)" }}>
          <div style={{ height: 168, display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(160deg, var(--plop-periwinkle), color-mix(in srgb, var(--plop-periwinkle) 50%, white))" }}>
            {["Mara Dela Cruz", "Kiko Bautista", "Joy Mendoza"].map((n) => (
              <span key={n} style={{ margin: "0 -6px" }}><Avatar name={n} size="lg" /></span>
            ))}
          </div>
          <figcaption style={{ font: "italic 700 18px var(--plop-font-letter)", color: "var(--plop-ink)", paddingTop: 6 }}>the crew</figcaption>
        </figure>
        <span style={{ ...tape("var(--plop-mustard)"), width: 86, left: 92, top: -12, rotate: "6deg" }} />
      </At>
      <At x={1114} y={192} rot={10}><FaceStar size={68} fill="var(--plop-mustard)" /></At>

      {/* the torn sheet with the logo */}
      <div style={{ position: "absolute", left: 292, top: 184, width: 616, height: 262, zIndex: 4, rotate: "-1.5deg", filter: "drop-shadow(4px 8px 0 rgba(10,30,20,.32))" }}>
        <div
          style={{
            position: "absolute", inset: 0, clipPath: sheetEdge, background: "#FBF8EF",
            backgroundImage: "radial-gradient(rgba(40,72,216,.13) 1.2px, transparent 1.6px), url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4  0 0 0 0 .35  0 0 0 0 .25  0 0 0 .4 -.05'/></filter><rect width='100%' height='100%' filter='url(%23p)'/></svg>\")",
            backgroundSize: "12px 12px, 200px 200px",
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", alignContent: "center", gap: 14 }}>
          <Wordmark size={92} />
          <p style={{ margin: 0, font: "400 27px var(--plop-font-body)", color: "var(--plop-ink-text)", rotate: "-2deg" }}>Hand-drawn UI, imperfect on purpose</p>
        </div>
        <span style={{ ...tape("var(--plop-periwinkle)"), width: 104, left: -34, top: 12, rotate: "-38deg" }} />
        <span style={{ ...tape("var(--plop-bubblegum)"), width: 104, right: -36, bottom: 12, rotate: "-38deg" }} />
      </div>

      {/* left side: tag and an avatar with a status dot */}
      <At x={44} y={306} rot={-8}><Tag tone="tomato" tilt={0}>New!</Tag></At>
      <At x={112} y={378} rot={-4} z={5}>
        <span style={{ display: "inline-grid", padding: 6, borderRadius: "50%", background: "#FFFDF7", boxShadow: "3px 6px 0 rgba(10,30,20,.3)" }}>
          <Avatar name="Rosa Dela Cruz" size="lg" status="online" />
        </span>
      </At>

      {/* under the sheet: year tag and the install line */}
      <At x={334} y={446} rot={-6} z={6}><Tag tone="tomato" tilt={0}>2026</Tag></At>
      <At x={642} y={436} rot={2} z={5}>
        <span style={{ display: "inline-block", padding: "12px 20px", background: "#FFFDF7", font: "600 19px ui-monospace, Menlo, monospace", color: "var(--plop-ink-text)", boxShadow: "3px 6px 0 rgba(10,30,20,.3)" }}>
          npm i @plop-ui/react
        </span>
      </At>
      <At x={866} y={428} rot={18} z={7}><Clip color="var(--plop-mustard)" h={50} /></At>

      {/* right side: a count and a toast */}
      <At x={1004} y={308} z={5}>
        <span style={{ display: "inline-grid", scale: "1.9", transformOrigin: "left top" }}><Count label="3 new">3</Count></span>
      </At>
      <At x={932} y={396} rot={-4} z={5}><Toast kind="success">Saved!</Toast></At>
      <At x={1092} y={470} rot={-10}><Star size={56} fill="var(--plop-bubblegum)" /></At>

      {/* bottom: the sticker pack and the pencils */}
      <At x={460} y={482} rot={-3} z={4} w={244}>
        <div style={{ background: "#F3F3F1", border: "2.5px solid #C9CFDF", borderRadius: "12px 12px 0 0", padding: "14px 12px 40px", boxShadow: "3px 6px 0 rgba(10,30,20,.3)", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 2px, transparent 2px 6px)", backgroundSize: "100% 18px", backgroundRepeat: "no-repeat" }}>
          <div style={{ width: 70, height: 14, margin: "0 auto 12px", borderRadius: 8, background: "var(--plop-bg)" }} />
          <div style={{ background: "var(--plop-ink)", color: "var(--plop-on-ink)", padding: "8px 14px", font: "italic 900 24px var(--plop-font-letter)", rotate: "-2deg" }}>Sticker Pack</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 18px 0" }}>
            <Avatar name="Bea Soriano" size="sm" />
            <Star size={28} fill="var(--plop-tomato)" />
            <span style={{ width: 46, height: 22, borderRadius: 11, background: "var(--plop-mustard)", border: "2.5px solid var(--plop-ink)" }} />
          </div>
        </div>
      </At>
      <At x={-30} y={466} rot={-16} z={6}><Pencil len={330} body="var(--plop-ink)" stripe="color-mix(in srgb, var(--plop-ink) 70%, white)" /></At>
      <At x={-20} y={560} rot={-9} z={6}><Pencil len={300} body="var(--plop-periwinkle)" stripe="color-mix(in srgb, var(--plop-periwinkle) 60%, white)" /></At>
      <At x={268} y={508} rot={-60} z={7}><Clip color="var(--plop-ink)" h={46} /></At>
      <At x={890} y={524} rot={14} z={6}><Pencil len={360} body="var(--plop-ink)" stripe="color-mix(in srgb, var(--plop-ink) 70%, white)" /></At>
      <At x={940} y={594} rot={5} z={6}><Pencil len={320} body="var(--plop-mint)" stripe="color-mix(in srgb, var(--plop-mint) 60%, white)" /></At>
    </div>
  );
}
