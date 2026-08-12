"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { applyToonToGltf } from "../materials/toon";
import { ITEM_LIST } from "./itemRegistry";
import type { ItemModel } from "./itemRegistry";

export function GltfItemVisual({ model }: { model: ItemModel }) {
  const { scene } = useGLTF(model.url);
  const cloned = useMemo(() => {
    const copy = SkeletonUtils.clone(scene);
    applyToonToGltf(copy);
    return copy;
  }, [scene]);
  return (
    <primitive
      object={cloned}
      scale={model.scale ?? 1}
      rotation={model.rotation ?? [0, 0, 0]}
    />
  );
}

/** Preload every registered item model (call from a client-only effect). */
export function preloadItemModels(): void {
  for (const def of ITEM_LIST) {
    if (def.model) useGLTF.preload(def.model.url);
  }
}
