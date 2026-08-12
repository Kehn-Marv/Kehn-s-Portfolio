// Runtime API (materials/textures) is client-only — call it from R3F/client
// components, never during SSR.
import * as THREE from "three";
import { palette, CREAM, INK, type PaletteKey } from "@/lib/tokens";

export const OUTLINE_THICKNESS = 0.05;

let gradientMap: THREE.DataTexture | null = null;

/** Shared 3-step gradient so every toon material bands identically. */
export function getToonGradientMap(): THREE.DataTexture {
  if (!gradientMap) {
    const data = new Uint8Array([96, 176, 255]);
    gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
}

export type ToonColor = PaletteKey | "cream" | "ink" | "buckle" | "buckleHi";

/** Near-black plastic for messenger strap buckles (readable vs navy webbing). */
export const BUCKLE_PLASTIC = "#0e1018";
/** Soft rim / facet highlight for stylized buckle edges. */
export const BUCKLE_HIGHLIGHT = "#c4cbe0";

export function toonColorHex(color: ToonColor): string {
  switch (color) {
    case "cream":
      return CREAM;
    case "ink":
      return INK;
    case "buckle":
      return BUCKLE_PLASTIC;
    case "buckleHi":
      return BUCKLE_HIGHLIGHT;
    case "yellow":
    case "pink":
    case "lavender":
    case "cyan":
    case "orange":
    case "lime":
    case "red":
    case "stone":
      return palette[color];
    default: {
      const _exhaustive: never = color;
      return _exhaustive;
    }
  }
}

export function makeToonMaterial(color: ToonColor): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color: toonColorHex(color),
    gradientMap: getToonGradientMap(),
  });
}

const sharedMaterials = new Map<ToonColor, THREE.MeshToonMaterial>();

/**
 * Shared per-color material for scene objects that never mutate their
 * material (avoids per-mesh instances and dispose bookkeeping).
 */
export function getSharedToonMaterial(color: ToonColor): THREE.MeshToonMaterial {
  let mat = sharedMaterials.get(color);
  if (!mat) {
    mat = makeToonMaterial(color);
    sharedMaterials.set(color, mat);
  }
  return mat;
}

/**
 * Converts a loaded GLTF subtree to the scene's toon language: every
 * standard/physical material becomes MeshToonMaterial with the shared
 * gradient map, keeping the baked color texture.
 */
export function applyToonToGltf(root: THREE.Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const converted = materials.map((mat) => {
      if (mat instanceof THREE.MeshToonMaterial) return mat;
      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial
      ) {
        const toon = new THREE.MeshToonMaterial({
          color: mat.color,
          map: mat.map ?? null,
          gradientMap: getToonGradientMap(),
        });
        mat.dispose();
        return toon;
      }
      return mat;
    });
    node.material = Array.isArray(node.material) ? converted : converted[0];
  });
}
