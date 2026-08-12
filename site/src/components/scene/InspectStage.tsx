"use client";

import { lazy, Suspense } from "react";
import { animated, useSpring } from "@react-spring/three";
import { useSceneStore, type ItemId } from "./sceneStore";
import { getItemDef } from "./items/itemRegistry";
import { getSharedToonMaterial } from "./materials/toon";
import { RIG_POINT } from "./InspectRig";

const FlashcardInspect = lazy(() => import("./interactions/FlashcardInspect"));

function GenericInspect({ itemId }: { itemId: ItemId }) {
  const def = getItemDef(itemId);
  const material = getSharedToonMaterial(def.color);
  return (
    <group position={RIG_POINT}>
      {def.shape.kind === "box" ? (
        <mesh material={material} scale={1.6}>
          <boxGeometry args={def.shape.size} />
        </mesh>
      ) : (
        <mesh material={material} scale={1.6}>
          <cylinderGeometry
            args={[def.shape.radius, def.shape.radius, def.shape.height, 24]}
          />
        </mesh>
      )}
    </group>
  );
}

export function InspectStage() {
  const mode = useSceneStore((s) => s.mode);
  const activeItemId = useSceneStore((s) => s.activeItemId);
  const spring = useSpring({
    scale: mode === "inspect" ? 1 : 0,
    config: { tension: 200, friction: 22 },
  });

  if (mode !== "inspect" || !activeItemId) return null;

  return (
    <animated.group scale={spring.scale}>
      <Suspense fallback={null}>
        {activeItemId === "flashcards" ? (
          <FlashcardInspect />
        ) : (
          <GenericInspect itemId={activeItemId} />
        )}
      </Suspense>
    </animated.group>
  );
}
