import { render } from "@testing-library/react";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PlopProvider } from "./PlopProvider";

const src = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensCss = join(src, "../../tokens/dist/tokens.css");

function cssModules(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? cssModules(join(dir, e.name)) : e.name.endsWith(".css") ? [join(dir, e.name)] : [],
  );
}

describe("roundness", () => {
  it("PlopProvider roundness sets --plop-roundness", () => {
    const { container, rerender } = render(<PlopProvider roundness={1.5}>x</PlopProvider>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--plop-roundness")).toBe("1.5");
    rerender(<PlopProvider>x</PlopProvider>);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--plop-roundness")).toBe("");
  });

  it("tokens.css scales every radius by --plop-roundness", () => {
    const css = readFileSync(tokensCss, "utf8");
    expect(css).toMatch(/--plop-roundness: 1;/);
    const radii = css.split("\n").filter((l) => /--plop-radius-[a-z]+:/.test(l) && /\dpx/.test(l));
    expect(radii.length).toBeGreaterThan(0);
    for (const line of radii) expect(line, line).toContain("var(--plop-roundness)");
  });

  it("a nested roundness re-resolves the radius tokens (custom properties resolve where they're declared)", () => {
    const { container } = render(<PlopProvider roundness={0}>x</PlopProvider>);
    expect((container.firstElementChild as HTMLElement).hasAttribute("data-plop-roundness")).toBe(true);
    const css = readFileSync(tokensCss, "utf8");
    const block = css.slice(css.indexOf("[data-plop-roundness]"));
    expect(css.indexOf("[data-plop-roundness]")).toBeGreaterThan(-1);
    expect(block).toMatch(/--plop-radius-sticker:[^;]*var\(--plop-roundness\)/);
  });

  it("every px corner in the components follows --plop-roundness; circles stay circles", () => {
    for (const file of cssModules(src)) {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const m = line.match(/border-radius:\s*([^;}]+)/);
        if (!m) continue;
        const value = m[1]!.trim();
        if (value.startsWith("var(--plop-radius") || value.startsWith("inherit")) continue;
        if (/^(50%|999px|9999px)$/.test(value)) {
          expect(value, `${file}: ${line.trim()}`).not.toContain("roundness");
          continue;
        }
        if (/\dpx/.test(value)) expect(value, `${file}: ${line.trim()}`).toMatch(/var\(--plop-roundness/);
      }
    }
  });
});
