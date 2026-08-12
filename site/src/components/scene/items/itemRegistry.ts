import type { ItemId } from "../sceneStore";
import type { ToonColor } from "../materials/toon";

export type ItemShape =
  | { kind: "box"; size: [number, number, number] }
  | { kind: "cylinder"; radius: number; height: number };

export interface ItemModel {
  url: string;
  scale?: number;
  rotation?: [number, number, number];
}

export interface ItemDef {
  id: ItemId;
  label: string;
  color: ToonColor;
  shape: ItemShape;
  /** true once the item has a dedicated inspect module */
  hasModule: boolean;
  model?: ItemModel;
}

export const ITEMS = {
  flashcards: { id: "flashcards", label: "FLASHCARDS", color: "yellow", shape: { kind: "box", size: [0.7, 0.14, 0.5] }, hasModule: true },
  notebook: { id: "notebook", label: "NOTEBOOK", color: "pink", shape: { kind: "box", size: [0.62, 0.1, 0.82] }, hasModule: false },
  gameboy: { id: "gameboy", label: "GAMEBOY", color: "stone", shape: { kind: "box", size: [0.45, 0.16, 0.72] }, hasModule: false },
  trophy: { id: "trophy", label: "TROPHY", color: "orange", shape: { kind: "cylinder", radius: 0.22, height: 0.6 }, hasModule: false },
  polaroid: { id: "polaroid", label: "POLAROID", color: "lavender", shape: { kind: "box", size: [0.5, 0.06, 0.6] }, hasModule: false },
  cassette: { id: "cassette", label: "CASSETTE", color: "cyan", shape: { kind: "box", size: [0.55, 0.12, 0.36] }, hasModule: false },
  terminal: { id: "terminal", label: "TERMINAL", color: "lime", shape: { kind: "box", size: [0.6, 0.4, 0.45] }, hasModule: false },
  badge: { id: "badge", label: "BADGE", color: "red", shape: { kind: "cylinder", radius: 0.24, height: 0.08 }, hasModule: false },
} satisfies Record<ItemId, ItemDef>;

/** Stable iteration order for spawn choreography. */
export const ITEM_LIST: readonly ItemDef[] = Object.values(ITEMS);

export function getItemDef(id: ItemId): ItemDef {
  return ITEMS[id];
}
