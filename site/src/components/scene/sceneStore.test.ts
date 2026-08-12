import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSceneStore } from "./sceneStore";

const reset = () =>
  useSceneStore.setState({
    mode: "idle",
    activeItemId: null,
    settled: false,
    spillSeed: 42,
  });

beforeEach(reset);
afterEach(() => {
  vi.restoreAllMocks();
});

describe("sceneStore transitions", () => {
  it("idle -> spilled via spill()", () => {
    useSceneStore.getState().spill();
    expect(useSceneStore.getState().mode).toBe("spilled");
    expect(useSceneStore.getState().settled).toBe(false);
  });

  it("spill() is a no-op unless idle", () => {
    useSceneStore.getState().spill();
    const seed = useSceneStore.getState().spillSeed;
    useSceneStore.getState().spill();
    expect(useSceneStore.getState().spillSeed).toBe(seed);
  });

  it("spill() rolls a fresh seed from idle", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    useSceneStore.getState().spill();
    expect(useSceneStore.getState().spillSeed).toBe(500_000);
    expect(useSceneStore.getState().mode).toBe("spilled");
  });

  it("beginInspect only works from spilled", () => {
    useSceneStore.getState().beginInspect("flashcards");
    expect(useSceneStore.getState().mode).toBe("idle");
    useSceneStore.getState().spill();
    useSceneStore.getState().beginInspect("flashcards");
    expect(useSceneStore.getState().mode).toBe("inspect");
    expect(useSceneStore.getState().activeItemId).toBe("flashcards");
  });

  it("beginInspect while inspecting keeps the first active item", () => {
    useSceneStore.getState().spill();
    useSceneStore.getState().beginInspect("trophy");
    useSceneStore.getState().beginInspect("notebook");
    expect(useSceneStore.getState().mode).toBe("inspect");
    expect(useSceneStore.getState().activeItemId).toBe("trophy");
  });

  it("endInspect returns to spilled and clears active item", () => {
    useSceneStore.getState().spill();
    useSceneStore.getState().beginInspect("trophy");
    useSceneStore.getState().endInspect();
    expect(useSceneStore.getState().mode).toBe("spilled");
    expect(useSceneStore.getState().activeItemId).toBeNull();
  });

  it("endInspect is a no-op from idle and spilled", () => {
    useSceneStore.getState().endInspect();
    expect(useSceneStore.getState().mode).toBe("idle");
    useSceneStore.getState().spill();
    useSceneStore.getState().endInspect();
    expect(useSceneStore.getState().mode).toBe("spilled");
  });

  it("markSettled only applies while spilled", () => {
    useSceneStore.getState().markSettled(true);
    expect(useSceneStore.getState().settled).toBe(false);
    useSceneStore.getState().spill();
    useSceneStore.getState().markSettled(true);
    expect(useSceneStore.getState().settled).toBe(true);
    useSceneStore.getState().beginInspect("gameboy");
    expect(useSceneStore.getState().settled).toBe(false);
    useSceneStore.getState().markSettled(true);
    expect(useSceneStore.getState().settled).toBe(false);
  });
});
