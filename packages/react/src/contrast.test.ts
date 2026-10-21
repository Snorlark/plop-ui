import { color, onFill } from "@plop-ui/tokens";
import { contrastRatio, CREAM, DEEP_INK, onColor, parseColor } from "./contrast";

describe("contrast", () => {
  it("parses hex and rgb()", () => {
    expect(parseColor("#fff")).toEqual([255, 255, 255]);
    expect(parseColor("#2848D8")).toEqual([40, 72, 216]);
    expect(parseColor("#2848D8ff")).toEqual([40, 72, 216]);
    expect(parseColor("rgb(1, 2, 3)")).toEqual([1, 2, 3]);
    expect(parseColor("rgba(1 2 3 / .5)")).toEqual([1, 2, 3]);
    expect(parseColor("tomato")).toBeNull();
  });

  it("measures black on white as 21:1", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
  });

  it("throws on colors it cannot read", () => {
    expect(() => contrastRatio("nope", "#fff")).toThrow();
  });

  it("every documented contrast role passes AA", () => {
    const fills: Record<string, string> = {
      ink: color.ink,
      tomato: color.tomato,
      periwinkle: color.periwinkle,
      bubblegum: color.bubblegum,
      mint: color.mint,
      mustard: color.mustard,
      plain: color.paper,
    };
    for (const [name, bg] of Object.entries(fills)) {
      const role = onFill[name as keyof typeof onFill];
      expect(contrastRatio(role.text, bg), name).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(color.inkSoft, color.sheet)).toBeGreaterThanOrEqual(4.5);
  });

  it("onColor picks cream on dark fills and deep ink on light ones", () => {
    expect(onColor("#111111").color).toBe(CREAM);
    expect(onColor("#F6C445").color).toBe(DEEP_INK);
    expect(onColor("#7FB3E8").passesAA).toBe(true);
  });

  it("onColor accepts a custom pair", () => {
    expect(onColor("#ffffff", { dark: "#000000", light: "#eeeeee" }).color).toBe("#000000");
  });
});
