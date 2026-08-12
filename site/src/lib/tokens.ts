/**
 * Runtime mirror of the @theme tokens in src/app/globals.css for the 3D scene
 * (origin: design_refs/raft-design-tokens/official-export). globals.css stays
 * the source of truth for DOM styling; tokens.test.ts keeps this file in sync.
 */

export const INK = "#141111";
export const CREAM = "#fffaef";

export const palette = {
  yellow: "#ffd440",
  pink: "#fe7da8",
  lavender: "#bbafe6",
  cyan: "#27ccf3",
  orange: "#f8a16f",
  lime: "#a9d877",
  red: "#f97264",
  stone: "#c0b9b1",
} as const;

export type PaletteKey = keyof typeof palette;

/** Hard offset shadow offsets in px, matching --shadow-brutal-*. */
export const shadowOffsets = { xs: 1, sm: 2, md: 4, lg: 6, xl: 10 } as const;
