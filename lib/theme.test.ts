import { describe, expect, it } from "vitest";
import { generateBrandPalette } from "./theme";

describe("generateBrandPalette", () => {
  it("generates all 11 tailwind shades from a hex color", () => {
    const palette = generateBrandPalette("#2e70be");
    expect(palette).not.toBeNull();
    expect(Object.keys(palette!).sort()).toEqual(
      ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].sort()
    );
  });

  it("produces darker shades as the scale increases", () => {
    const palette = generateBrandPalette("#2e70be")!;
    // Une teinte "900" doit être plus sombre (composantes RGB plus faibles) que "100".
    const toLuma = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return (n >> 16) + ((n >> 8) & 0xff) + (n & 0xff);
    };
    expect(toLuma(palette["900"])).toBeLessThan(toLuma(palette["100"]));
  });

  it("accepts hex colors without a leading #", () => {
    expect(generateBrandPalette("2e70be")).not.toBeNull();
  });

  it("accepts shorthand 3-digit hex colors", () => {
    expect(generateBrandPalette("#2eb")).not.toBeNull();
  });

  it("returns null for an invalid color", () => {
    expect(generateBrandPalette("not-a-color")).toBeNull();
  });
});
