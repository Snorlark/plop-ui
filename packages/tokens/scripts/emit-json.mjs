// Builds dist/tokens.json from the compiled token object, in the W3C Design Tokens (DTCG) format that
// Tokens Studio for Figma and other design tools import. Same source as tokens.css, so a design kit built
// from this file can't drift from the code.
//
// Values use the string forms Tokens Studio reads ("#2848D8", "19px", "500ms"). Every color is plain hex
// (8 digits when it's translucent) and every dimension is px, so the file passes the DTCG value rules.
// What a token can't express (irregular CSS radii, italic, uppercase, the surface paper patterns) goes in
// $extensions under "com.plopui".
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tokens } from "../dist/index.js";

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"));
const { color, onFill, status, font, fontWeight, fontSize, radius, roundness, stroke, hatch, motion, surfaces } = tokens;

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const ext = (data) => ({ $extensions: { "com.plopui": data } });
const token = (type, value, description, extensions) => ({
  $type: type,
  $value: value,
  ...(description ? { $description: description } : {}),
  ...(extensions ? ext(extensions) : {}),
});
/** A reference to another token, e.g. {color.ink}. */
const ref = (path) => `{${path}}`;

/** Any CSS color the tokens use as DTCG hex: #rrggbb, or #rrggbbaa when it's translucent. */
const hex = (css) => {
  const v = css.trim();
  if (v === "transparent") return "#00000000";
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
  if (/^#[0-9a-f]{8}$/i.test(v)) return v.toUpperCase();
  const m = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (!m) throw new Error(`emit-json: can't turn "${css}" into hex`);
  const byte = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  const a = m[4] === undefined ? 1 : Number(m[4]);
  return `#${byte(+m[1])}${byte(+m[2])}${byte(+m[3])}${a < 1 ? byte(a * 255) : ""}`.toUpperCase();
};
/** The color token whose value is `css`, if there is one, so on-fill and status colors stay linked. */
const colorRef = (css) => {
  const name = Object.entries(color).find(([, v]) => hex(v) === hex(css))?.[0];
  return name ? ref(`color.${kebab(name)}`) : hex(css);
};
/** A CSS font stack as a list of family names: `var(--plop-sketchpop, "Sketchpop")` becomes "Sketchpop". */
const familyList = (css) =>
  css
    .replace(/var\(--plop-[\w-]+,\s*("[^"]+")\)/g, "$1")
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter((name, i, all) => all.indexOf(name) === i);
const bezier = (css) => css.match(/cubic-bezier\(([^)]+)\)/)[1].split(",").map(Number);
const px = (n) => `${Math.round(n * 100) / 100}px`;

/** An irregular CSS radius ("a b c d / e f g h") as one value per corner, which design tools take. */
const corners = (name, css) => {
  if (css.includes("%")) {
    // A blob (percent) radius isn't a DTCG dimension: keep it as a described group.
    return { $description: "A blob: draw it as a circle or ellipse in design tools. The CSS is in $extensions.", ...ext({ css }) };
  }
  const [h, v = h] = css.split("/").map((s) => s.trim().split(/\s+/));
  const names = ["top-left", "top-right", "bottom-right", "bottom-left"];
  return {
    $description: `Irregular on purpose. CSS: border-radius: ${css}. Every px length scales with roundness.`,
    ...ext({ css }),
    ...Object.fromEntries(names.map((n, i) => [n, token("dimension", h[i], `Vertical radius: ${v[i]}`)])),
  };
};

/**
 * Text styles as the components set them (Heading, the sticker label, body copy). Letter spacing is em in
 * the CSS; DTCG wants px, so it's converted at each size and the em value is kept in $extensions.
 */
const textStyle = ({ family, weight, size, lineHeight, letterSpacingEm = 0, italic = false, uppercase = false, note }) =>
  token(
    "typography",
    {
      fontFamily: ref(`font.family.${family}`),
      fontWeight: ref(`font.weight.${weight}`),
      fontSize: typeof size === "string" ? size : px(size),
      letterSpacing: px(letterSpacingEm * (typeof size === "string" ? parseFloat(size) : size)),
      lineHeight,
    },
    note,
    { fontStyle: italic ? "italic" : "normal", textTransform: uppercase ? "uppercase" : "none", letterSpacingEm },
  );

const colorGroup = Object.fromEntries(Object.entries(color).map(([k, v]) => [kebab(k), token("color", hex(v))]));
colorGroup.ink.$description = "One cobalt ink draws everything; spot colors fill shapes but never draw lines.";
colorGroup.shadow.$description = "Flat, printed drop shadow under sheets.";
colorGroup["shadow-strong"].$description = "Flat, printed drop shadow under stickers.";

const out = {
  $description: `PlopUI design tokens (@plop-ui/tokens v${pkg.version}), generated from packages/tokens/src/tokens.ts. Do not edit by hand. MIT licensed. https://plopui.com`,
  color: colorGroup,
  "on-fill": {
    $description: "The text color that passes WCAG AA on each fill. The measured contrast is in $extensions.",
    ...Object.fromEntries(Object.entries(onFill).map(([k, v]) => [k, token("color", colorRef(v.text), undefined, { contrastRatio: v.ratio })])),
  },
  fill: {
    $description: "Colors a component can be printed in. `plain` is paper.",
    ...Object.fromEntries(Object.keys(onFill).map((k) => [k, token("color", ref(k === "plain" ? "color.paper" : `color.${kebab(k)}`))])),
  },
  status: {
    $description: "Status → fill. Every status also carries a text label, never color alone.",
    ...Object.fromEntries(Object.entries(status).map(([k, fill]) => [k, token("color", ref(`fill.${fill}`))])),
  },
  font: {
    family: Object.fromEntries(Object.entries(font).map(([k, v]) => [k, token("fontFamily", familyList(v))])),
    weight: Object.fromEntries(Object.entries(fontWeight).map(([k, v]) => [k, token("fontWeight", v)])),
    size: Object.fromEntries(Object.entries(fontSize).map(([k, v]) => [k, token("dimension", px(v))])),
  },
  typography: {
    $description: "Text styles as the components set them. Italic and uppercase are in $extensions (DTCG typography has no font style or case).",
    "heading-1": textStyle({ family: "letter", weight: "heading", size: 64, lineHeight: 1.05, letterSpacingEm: 0.03, italic: true, uppercase: true, note: "Heading level 1. Fluid in CSS: 40px on phones up to 64px." }),
    "heading-2": textStyle({ family: "letter", weight: "heading", size: 38, lineHeight: 1.05, letterSpacingEm: 0.03, italic: true, uppercase: true, note: "Heading level 2. Fluid in CSS: 28px on phones up to 38px." }),
    "heading-3": textStyle({ family: "letter", weight: "heading", size: 22, lineHeight: 1.05, letterSpacingEm: 0.03, italic: true, uppercase: true }),
    "heading-4": textStyle({ family: "letter", weight: "heading", size: 17, lineHeight: 1.05, letterSpacingEm: 0.03, italic: true, uppercase: true }),
    label: textStyle({ family: "letter", weight: "letter", size: 16, lineHeight: 1.1, letterSpacingEm: 0.05, italic: true, uppercase: true, note: "Button and sticker labels (md size; sm is 13px, lg is 24px)." }),
    body: textStyle({ family: "body", weight: "body", size: fontSize.body, lineHeight: 1.5, note: "Body copy." }),
  },
  radius: {
    roundness: token("number", roundness, "Multiplies every px radius length: 1 is the default look, 0 is square, 2 is very round."),
    ...Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, corners(k, v)])),
  },
  stroke: Object.fromEntries(Object.entries(stroke).map(([k, v]) => [k, token("dimension", v)])),
  hatch: Object.fromEntries(Object.entries(hatch).map(([k, v]) => [kebab(k), token("dimension", v)])),
  shadow: {
    $description: "Flat, offset 'printed' shadows: no blur, no spread.",
    sticker: token("shadow", { color: ref("color.shadow-strong"), offsetX: ref("hatch.offset-x"), offsetY: ref("hatch.offset-y"), blur: "0px", spread: "0px" }, "Under buttons and other stickers."),
    sheet: token("shadow", { color: ref("color.shadow"), offsetX: "7px", offsetY: "9px", blur: "0px", spread: "0px" }, "Under Sheets and cards."),
  },
  focus: {
    ring: token(
      "border",
      { color: ref("surface.poster.light.focus"), width: ref("stroke.sm"), style: "dashed" },
      "The 'cut here' focus line, 4px outside the element. Its color is each surface's own `focus` token (this one is Poster, light).",
      { offset: "4px" },
    ),
  },
  motion: {
    spring: { ease: token("cubicBezier", bezier(motion.spring)), duration: token("duration", motion.springDuration) },
    squish: { ease: token("cubicBezier", bezier(motion.squish)), duration: token("duration", motion.squishDuration) },
    "boil-interval": token("duration", motion.boilInterval, "Time between the 3 wobble filters that make lines 'boil'."),
  },
  surface: {
    $description: "Five papers, each with a light and a dark mode (use them as variable modes in Figma). The paper patterns are images, described in $extensions.",
    ...Object.fromEntries(
      Object.entries(surfaces).map(([name, s]) => [
        name,
        {
          $description: s.label,
          ...ext({ pattern: tokens.surfacePattern[name] }),
          ...Object.fromEntries(
            ["light", "dark"].map((mode) => [mode, Object.fromEntries(Object.entries(s[mode]).map(([k, v]) => [kebab(k), token("color", hex(v))]))]),
          ),
        },
      ]),
    ),
  },
};

writeFileSync(fileURLToPath(new URL("../dist/tokens.json", import.meta.url)), JSON.stringify(out, null, 2) + "\n");
console.log("emit-json: wrote dist/tokens.json");
