import { describe, expect, it } from "vitest";
import { BASE_STAGGER_MS, STAGGER_JITTER_MS, makeSpillPlan } from "./spill";

describe("makeSpillPlan", () => {
  it("returns one entry per item with ascending stagger delays", () => {
    const plan = makeSpillPlan(8, 42);
    expect(plan).toHaveLength(8);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].delayMs).toBeGreaterThan(plan[i - 1].delayMs);
    }
    expect(plan[0].delayMs).toBeGreaterThanOrEqual(0);
    expect(plan[plan.length - 1].delayMs).toBeLessThanOrEqual(
      8 * (BASE_STAGGER_MS + STAGGER_JITTER_MS),
    );
  });

  it("is deterministic for the same seed and differs across seeds", () => {
    expect(makeSpillPlan(5, 1)).toEqual(makeSpillPlan(5, 1));
    expect(makeSpillPlan(5, 1)).not.toEqual(makeSpillPlan(5, 2));
  });

  it("fans impulses leftward/outward from the bag with a vertical pop", () => {
    for (const entry of makeSpillPlan(12, 7)) {
      expect(entry.impulse.x).toBeLessThan(0.5); // mostly away from bag (+x side)
      expect(entry.impulse.y).toBeGreaterThan(1.5); // always pops up
      expect(entry.impulse.y).toBeLessThan(6);
      expect(Math.abs(entry.impulse.z)).toBeLessThan(3);
      expect(Math.abs(entry.torque.x)).toBeLessThanOrEqual(0.6);
    }
  });

  it("keeps spawn offsets within the bag mouth bounds", () => {
    for (const entry of makeSpillPlan(12, 7)) {
      expect(Math.abs(entry.spawnOffset.x)).toBeLessThanOrEqual(0.15);
      expect(Math.abs(entry.spawnOffset.z)).toBeLessThanOrEqual(0.15);
      expect(entry.spawnOffset.y).toBeGreaterThanOrEqual(0.15);
      expect(entry.spawnOffset.y).toBeLessThanOrEqual(0.35);
    }
  });
});
