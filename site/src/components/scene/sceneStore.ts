import { create } from "zustand";

export type SceneMode = "idle" | "spilled" | "inspect";

export type ItemId =
  | "flashcards"
  | "notebook"
  | "gameboy"
  | "trophy"
  | "polaroid"
  | "cassette"
  | "terminal"
  | "badge";

interface SceneState {
  mode: SceneMode;
  activeItemId: ItemId | null;
  /** all spilled bodies asleep -> physics can pause */
  settled: boolean;
  /** Seed for the deterministic spill choreography. 42 until the first spill; re-rolled client-side on each successful spill() so the layout varies per visit while staying replayable within a session. */
  spillSeed: number;
  spill: () => void;
  beginInspect: (id: ItemId) => void;
  endInspect: () => void;
  markSettled: (v: boolean) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  mode: "idle",
  activeItemId: null,
  settled: false,
  spillSeed: 42,

  spill: () => {
    if (get().mode !== "idle") return;
    set({
      mode: "spilled",
      settled: false,
      spillSeed: Math.floor(Math.random() * 1_000_000),
    });
  },

  beginInspect: (id) => {
    if (get().mode !== "spilled") return;
    set({ mode: "inspect", activeItemId: id, settled: false });
  },

  endInspect: () => {
    if (get().mode !== "inspect") return;
    set({ mode: "spilled", activeItemId: null, settled: false });
  },

  markSettled: (v) => {
    if (get().mode !== "spilled" || get().settled === v) return;
    set({ settled: v });
  },
}));
