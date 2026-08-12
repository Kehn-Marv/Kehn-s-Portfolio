import { describe, expect, it } from "vitest";
import { bagModelYOffset, BAG_GLB_MIN_Y, BAG_POS_Y } from "./bagLayout";

describe("bagModelYOffset", () => {
  it("keeps the GLB bottom on the stage floor for the current scale", () => {
    // minY from: npx gltf-transform inspect site/public/models/bag.glb → bboxMin.y
    expect(BAG_GLB_MIN_Y).toBeCloseTo(-0.89849, 4);
    expect(BAG_POS_Y).toBe(0.75);
    expect(bagModelYOffset(0.948)).toBeCloseTo(0.102, 2);
  });

  it("targets +15% idle scale (~1.090) with a matching Y lift", () => {
    const scale = 1.09;
    expect(bagModelYOffset(scale)).toBeCloseTo(0.229, 2);
  });
});
