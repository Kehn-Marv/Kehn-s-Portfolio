import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { palette, shadowOffsets, INK, CREAM } from "./tokens";

const css = fs.readFileSync(
  path.resolve(__dirname, "../app/globals.css"),
  "utf8"
);

describe("tokens stay in sync with globals.css", () => {
  it("every palette entry maps to its css custom property", () => {
    for (const [name, hex] of Object.entries(palette)) {
      const regex = new RegExp(
        String.raw`--color-brutal-${name}:\s*${hex}`,
        "i"
      );
      expect(css, `palette.${name}`).toMatch(regex);
    }
  });

  it("ink and cream match the css custom properties", () => {
    expect(INK).toBe("#141111");
    expect(CREAM).toBe("#fffaef");
    expect(css.toLowerCase()).toContain(INK);
    expect(css.toLowerCase()).toContain(CREAM);
    expect(css).toMatch(/--color-ink:\s*#141111/i);
    expect(css).toMatch(/--color-cream:\s*#fffaef/i);
  });

  it("every shadow offset appears as a hard shadow in css", () => {
    for (const [name, offset] of Object.entries(shadowOffsets)) {
      expect(css, `shadowOffsets.${name}`).toContain(
        `${offset}px ${offset}px 0px #141111`
      );
    }
  });
});
