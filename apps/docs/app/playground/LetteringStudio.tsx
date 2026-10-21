"use client";

import { BUDDY_CAST, BuddyPeek, Button, Doodle, PlopProvider, toast, WordSticker, type BuddyMood, type DoodleKind, type WordStickerTone } from "@plop-ui/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Choice, Slider, Swatches, Text } from "./controls";
import { download, toHTML, toPNG, toSVG } from "./lettering-export";
import { stamp } from "../_site/pass";
import { CodeBlock, copy } from "./StickerBoard";
import styles from "./tools.module.css";

type Size = "s" | "m" | "l";
type Format = "react" | "html" | "svg" | "png";

interface Design {
  text: string;
  tone: WordStickerTone;
  size: Size;
  tilt: number;
  wobble: number;
  buddy: BuddyMood | "none";
  side: "start" | "end";
  accent: DoodleKind | "none";
}

const START: Design = { text: "Plop!", tone: "mustard", size: "l", tilt: -4, wobble: 2.5, buddy: "congrats", side: "start", accent: "sparkle" };
const PX: Record<Size, number> = { s: 44, m: 68, l: 104 };
const BUDDY_SIZE: Record<Size, "sm" | "md" | "lg"> = { s: "sm", m: "sm", l: "md" };
/** Accents take the color that sits best next to the fill. */
const ACCENT_TONE: Record<WordStickerTone, "tomato" | "mustard" | "mint" | "bubblegum"> = {
  mustard: "tomato",
  tomato: "mustard",
  mint: "bubblegum",
  bubblegum: "mint",
  periwinkle: "mustard",
  ink: "mustard",
  paper: "tomato",
};
const STORE = "plop-lettering-v1";

/** What the preview draws, and what the React export writes, from the same design. */
function Art({ d }: { d: Design }) {
  const px = PX[d.size];
  const accentSize = Math.round(px * 0.62);
  // Under a character, tuck the word up so the hands grip the letters, not the air above them.
  const word = (
    <WordSticker tone={d.tone} size={px} tilt={d.tilt} jitter={d.wobble} style={d.buddy !== "none" ? { marginTop: tuck(px) } : undefined}>
      {d.text || " "}
    </WordSticker>
  );
  return (
    <span className={styles.art} style={{ "--pad": `${Math.round(px * 0.42)}px` } as CSSProperties}>
      {d.accent !== "none" && <Doodle className={styles.accentA} kind={d.accent} tone={ACCENT_TONE[d.tone]} size={accentSize} tilt={-14} />}
      {d.buddy !== "none" ? (
        <BuddyPeek mood={d.buddy} side={d.side} size={BUDDY_SIZE[d.size]}>
          {word}
        </BuddyPeek>
      ) : (
        word
      )}
      {d.accent !== "none" && <Doodle className={styles.accentB} kind={d.accent} tone="periwinkle" size={Math.round(accentSize * 0.7)} tilt={18} />}
    </span>
  );
}

/** How far the word slides up under a peeking character (the lettering box has headroom above the letters). */
const tuck = (px: number) => -Math.round(px * 0.22);

function reactCode(d: Design): string {
  const px = PX[d.size];
  const pad = Math.round(px * 0.42);
  const accentSize = Math.round(px * 0.62);
  const imports = ["WordSticker", ...(d.buddy !== "none" ? ["BuddyPeek"] : []), ...(d.accent !== "none" ? ["Doodle"] : [])].sort();
  const text = d.text.replace(/[{}<>"]/g, "");
  const word = `<WordSticker tone="${d.tone}" size={${px}} tilt={${d.tilt}} jitter={${d.wobble}}${d.buddy !== "none" ? ` style={{ marginTop: ${tuck(px)} }}` : ""}>${text}</WordSticker>`;
  const body =
    d.buddy !== "none"
      ? `<BuddyPeek mood="${d.buddy}"${d.side === "end" ? ` side="end"` : ""} size="${BUDDY_SIZE[d.size]}">\n        ${word}\n      </BuddyPeek>`
      : word;
  const a = d.accent !== "none";
  return `import { ${imports.join(", ")} } from "@plop-ui/react";

/** "${text}", lettered in Sketchpop. Made in the PlopUI playground. */
export function ${pascal(text) || "Lettering"}Sticker() {
  return (
    <span style={{ position: "relative", display: "inline-block", padding: ${pad} }}>
${a ? `      <Doodle kind="${d.accent}" tone="${ACCENT_TONE[d.tone]}" size={${accentSize}} tilt={-14} style={{ position: "absolute", left: 0, top: 0 }} />\n` : ""}      ${body}
${a ? `      <Doodle kind="${d.accent}" tone="periwinkle" size={${Math.round(accentSize * 0.7)}} tilt={18} style={{ position: "absolute", right: 0, bottom: 0 }} />\n` : ""}    </span>
  );
}
`;
}

function pascal(s: string) {
  return s
    .replace(/[^a-z0-9 ]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase())
    .join("")
    .replace(/^\d+/, "");
}

const FORMATS: Array<[Format, ReactNode]> = [
  ["react", "React"],
  ["html", "HTML"],
  ["svg", "SVG"],
  ["png", "PNG"],
];
const ACTION: Record<Format, string> = { react: "Copy React code", html: "Copy HTML", svg: "Download SVG", png: "Download PNG" };

/**
 * Type anything in Sketchpop and turn it into a die-cut sticker: pick a fill,
 * size, tilt and wobble, add a character peeking over it and a couple of
 * doodles, then take it away as a React component, HTML, SVG or PNG.
 */
export function LetteringStudio() {
  const [d, setD] = useState<Design>(START);
  const [format, setFormat] = useState<Format>("react");
  const [busy, setBusy] = useState(false);
  const art = useRef<HTMLDivElement>(null);
  const set = <K extends keyof Design>(k: K, v: Design[K]) => setD((cur) => ({ ...cur, [k]: v }));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
      if (saved) setD({ ...START, ...saved });
    } catch {
      // Start fresh.
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(d));
    } catch {
      // Fine: the design just lasts for this visit.
    }
  }, [d]);

  const code = useMemo(() => reactCode(d), [d]);
  const name = (pascal(d.text) || "lettering").toLowerCase();

  const exportIt = async () => {
    stamp("lettering");
    if (format === "react") return copy(code, "React code");
    const root = art.current?.firstElementChild as HTMLElement | null;
    if (!root) return;
    setBusy(true);
    try {
      await document.fonts.ready;
      const label = d.text.trim() || "Lettering";
      const { svg, width, height } = await toSVG(root, label);
      if (format === "html") await copy(toHTML(svg, label), "HTML");
      else if (format === "svg") {
        download(svg, `${name}.svg`);
        toast.success("SVG downloaded", { buddy: true });
      } else {
        download(await toPNG(svg, width, height, 3), `${name}.png`);
        toast.success("PNG downloaded", { buddy: true });
      }
    } catch {
      toast.error("Couldn't export that. Try again.", { buddy: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.letterTool}>
      <section className={styles.letterPreview} aria-labelledby="lt-preview-h">
        <h2 id="lt-preview-h" className="vh">
          Preview
        </h2>
        <PlopProvider surface="poster" theme="light" toaster={false} className={styles.letterStage}>
          <div ref={art} className={styles.letterArt}>
            <Art d={d} />
          </div>
        </PlopProvider>
      </section>

      <aside className={styles.inspector} aria-labelledby="lt-h">
        <h2 id="lt-h" className={styles.panelTitle}>
          Lettering
        </h2>

        <h3 className={styles.step}>1. Words</h3>
        <Text label="Type anything" value={d.text} maxLength={24} onChange={(v) => set("text", v)} />

        <h3 className={styles.step}>2. Look</h3>
        <Swatches label="Fill" value={d.tone} options={["mustard", "tomato", "mint", "bubblegum", "periwinkle", "ink"]} onChange={(v) => set("tone", v as WordStickerTone)} />
        <Choice label="Size" value={d.size} options={[["s", "Small"], ["m", "Medium"], ["l", "Large"]]} onChange={(v) => set("size", v as Size)} />
        <Slider label="Tilt" value={d.tilt} min={-15} max={15} step={0.5} unit="°" onChange={(v) => set("tilt", v)} />
        <Slider label="Wobble" value={d.wobble} min={0} max={6} step={0.5} onChange={(v) => set("wobble", v)} />

        <h3 className={styles.step}>3. Extras</h3>
        <Choice
          label="Character on top"
          value={d.buddy}
          options={[["none", "None"], ...(Object.keys(BUDDY_CAST) as BuddyMood[]).map((m) => [m, BUDDY_CAST[m].name] as [string, string])]}
          onChange={(v) => set("buddy", v as Design["buddy"])}
        />
        {d.buddy !== "none" && <Choice label="Peeks from" value={d.side} options={[["start", "Left"], ["end", "Right"]]} onChange={(v) => set("side", v as Design["side"])} />}
        <Choice
          label="Doodles"
          value={d.accent}
          options={[["none", "None"], ["star", "Stars"], ["heart", "Hearts"], ["sparkle", "Sparkles"], ["burst", "Bursts"]]}
          onChange={(v) => set("accent", v as Design["accent"])}
        />

        <h3 className={styles.step}>4. Take it away</h3>
        <Choice label="As" value={format} options={FORMATS} onChange={(v) => setFormat(v as Format)} />
        <div className={styles.actions}>
          <Button variant="ink" loading={busy} loadingLabel="Exporting" onClick={exportIt}>
            {ACTION[format]}
          </Button>
          <Button size="sm" variant="plain" onClick={() => setD(START)}>
            Start over
          </Button>
        </div>
        {format === "react" ? (
          <CodeBlock title="Component" code={code} what="React code" />
        ) : (
          <p className={styles.help}>
            {format === "png"
              ? "A transparent PNG at 3× size, ready for slides and social posts."
              : "Self-contained: the Sketchpop font is embedded, so it looks the same anywhere."}
          </p>
        )}
      </aside>
    </div>
  );
}
