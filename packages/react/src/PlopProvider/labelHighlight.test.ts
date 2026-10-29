import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const src = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIELDS = ["Select/Select.module.css", "SearchField/SearchField.module.css", "TextField/TextField.module.css"];

/*
 * A focused field's label gets a mustard band behind it. The band must sit behind the whole letters and the
 * text must switch to the ink that reads on mustard: a half-height band left the top of dark letters on a
 * dark page (dark theme), and light letters on mustard in the other half.
 */
describe("focused field labels", () => {
  for (const file of FIELDS) {
    it(`${file}: the mustard band covers the letters and the text reads on it`, () => {
      const css = readFileSync(join(src, file), "utf8");
      const band = css.match(/\.label > span \{[^}]*linear-gradient\(transparent (\d+)%, var\((?:--hl, var\()?--plop-mustard\)/);
      expect(band, "band rule").not.toBeNull();
      expect(Number(band![1])).toBeLessThanOrEqual(12);
      expect(css).toMatch(/focus-within \.label > span[^{]*\{[^}]*color: var\((?:--hl-on, var\()?--plop-on-fill-mustard\)/);
    });
  }
});
