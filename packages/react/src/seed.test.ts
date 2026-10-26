import { hashString, seed, seededPick, seededTilt } from "./seed";

describe("seed", () => {
  it("returns the same sequence for the same seed", () => {
    const a = seed("Post sketch");
    const b = seed("Post sketch");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("returns different sequences for different seeds", () => {
    expect(seed("a")()).not.toBe(seed("b")());
  });

  it("keeps values in [0, 1)", () => {
    const r = seed(42);
    for (let i = 0; i < 500; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("keeps tilt inside the range and stable", () => {
    for (const s of ["x", "y", 1, 2, 99]) {
      const t = seededTilt(s, 3);
      expect(Math.abs(t)).toBeLessThanOrEqual(3);
      expect(seededTilt(s, 3)).toBe(t);
    }
  });

  it("picks deterministically", () => {
    expect(seededPick("Rosa", ["a", "b", "c"])).toBe(seededPick("Rosa", ["a", "b", "c"]));
  });

  it("hashes strings to unsigned 32-bit ints", () => {
    const h = hashString("Plop!");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(2 ** 32);
  });
});
