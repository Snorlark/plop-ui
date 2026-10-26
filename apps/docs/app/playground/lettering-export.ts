/*
 * Turns the live lettering preview into a self-contained SVG: every letter
 * is placed exactly where the browser drew it, every color is resolved from
 * the PlopUI tokens, and Sketchpop is embedded, so the file looks the same
 * anywhere. HTML and PNG exports are built from that SVG.
 */

const FONT_URL = "/fonts/sketchpop-black-italic.woff2";
const FAMILY = "Sketchpop Export";
let fontData: Promise<string> | null = null;

function embeddedFont(): Promise<string> {
  fontData ??= fetch(FONT_URL)
    .then((r) => r.arrayBuffer())
    .then((buf) => {
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(bin);
    });
  return fontData;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const num = (n: number) => Math.round(n * 100) / 100;

/** Rotation (deg) and horizontal mirror of an element's own CSS transform. */
function ownTransform(el: Element): { angle: number; mirror: boolean; scale: number } {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none") return { angle: 0, mirror: false, scale: 1 };
  const m = new DOMMatrixReadOnly(t);
  const sx = Math.hypot(m.a, m.b);
  const det = m.a * m.d - m.b * m.c;
  return { angle: (Math.atan2(m.b, m.a) * 180) / Math.PI, mirror: det < 0, scale: sx };
}

const SVG_PROPS = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity"] as const;

/** Copies an inline <svg> with every computed paint written onto it, so it no longer needs the page's CSS. */
function bakeSvg(src: SVGSVGElement): string {
  const clone = src.cloneNode(true) as SVGSVGElement;
  const from = [src, ...src.querySelectorAll("*")];
  const to = [clone, ...clone.querySelectorAll("*")];
  from.forEach((node, i) => {
    const out = to[i] as SVGElement;
    const cs = getComputedStyle(node);
    out.removeAttribute("class");
    out.removeAttribute("style");
    if (i === 0) return;
    for (const p of SVG_PROPS) out.setAttribute(p, cs.getPropertyValue(p));
  });
  return clone.innerHTML;
}

function letterOps(sticker: HTMLElement, origin: DOMRect): string {
  const tilt = ownTransform(sticker).angle;
  const layers = [...sticker.children] as HTMLElement[];
  return layers
    .map((layer) => {
      const letters = [...layer.querySelectorAll<HTMLElement>("span[style*='--rz']")];
      return letters
        .map((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const own = ownTransform(el);
          const size = parseFloat(cs.fontSize);
          const stroke = parseFloat(cs.getPropertyValue("-webkit-text-stroke-width")) || 0;
          const color = cs.color;
          const strokeColor = cs.getPropertyValue("-webkit-text-stroke-color");
          const cx = r.left + r.width / 2 - origin.left;
          const cy = r.top + r.height / 2 - origin.top;
          return `<text transform="translate(${num(cx)} ${num(cy)}) rotate(${num(own.angle + tilt)}) scale(${num(own.scale)})" font-size="${num(size)}" fill="${color === "rgba(0, 0, 0, 0)" ? "none" : color}"${
            stroke ? ` stroke="${strokeColor}" stroke-width="${num(stroke)}" paint-order="stroke" stroke-linejoin="round"` : ""
          }>${esc(el.textContent ?? "")}</text>`;
        })
        .join("");
    })
    .join("");
}

/** The SVG for everything inside `root`, in paint order. */
export async function toSVG(root: HTMLElement, label: string): Promise<{ svg: string; width: number; height: number }> {
  const pad = 12;
  const box = root.getBoundingClientRect();
  const origin = new DOMRect(box.left - pad, box.top - pad, box.width + pad * 2, box.height + pad * 2);
  const shadow = getComputedStyle(root).getPropertyValue("--plop-shadow").trim() || "rgba(18,36,120,.2)";
  const ops: string[] = [];

  const walk = (node: Element) => {
    if (node instanceof HTMLElement && node.style.getPropertyValue("--ws-fill")) {
      ops.push(`<g filter="url(#shadow)">${letterOps(node, origin)}</g>`);
      return;
    }
    if (node instanceof SVGSVGElement) {
      const r = node.getBoundingClientRect();
      const own = ownTransform(node);
      const w = node.clientWidth || r.width;
      const h = node.clientHeight || r.height;
      const cx = r.left + r.width / 2 - origin.left;
      const cy = r.top + r.height / 2 - origin.top;
      const vb = node.getAttribute("viewBox") ?? `0 0 ${w} ${h}`;
      ops.push(
        `<g transform="translate(${num(cx)} ${num(cy)}) rotate(${num(own.angle)})${own.mirror ? " scale(-1 1)" : ""}"><svg x="${num(-w / 2)}" y="${num(-h / 2)}" width="${num(w)}" height="${num(h)}" viewBox="${vb}" overflow="visible">${bakeSvg(node)}</svg></g>`,
      );
      return;
    }
    for (const child of node.children) walk(child);
  };
  walk(root);

  const font = await embeddedFont();
  const width = Math.ceil(origin.width);
  const height = Math.ceil(origin.height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<defs>
<style>@font-face{font-family:"${FAMILY}";src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:900;font-style:italic}text{font-family:"${FAMILY}";font-weight:900;font-style:italic;text-anchor:middle;dominant-baseline:central}</style>
<filter id="shadow" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="2" dy="3" stdDeviation="0" flood-color="${shadow}" flood-opacity="1"/></filter>
</defs>
${ops.join("\n")}
</svg>`;
  return { svg, width, height };
}

/** The same picture as a standalone HTML snippet (the SVG inline, fonts embedded). */
export function toHTML(svg: string, label: string): string {
  return `<!-- PlopUI lettering: "${label}". Self-contained: the Sketchpop font is embedded. -->
<figure style="margin:0;display:inline-block;line-height:0">
${svg}
</figure>
`;
}

/** Rasterizes the SVG at `scale`× for a crisp PNG. */
export async function toPNG(svg: string, width: number, height: number, scale = 2): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG failed"))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function download(data: Blob | string, filename: string, type = "image/svg+xml") {
  const blob = typeof data === "string" ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
