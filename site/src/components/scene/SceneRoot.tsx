"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect } from "react";
import { CREAM } from "@/lib/tokens";
import { useSceneStore } from "./sceneStore";
import { Stage } from "./Stage";
import { AvatarHead } from "./AvatarHead";
import { Bag } from "./Bag";
import { ItemSpill } from "./ItemSpill";
import { InspectRig } from "./InspectRig";
import { InspectStage } from "./InspectStage";

export function SceneRoot() {
  const settled = useSceneStore((s) => s.settled);
  const mode = useSceneStore((s) => s.mode);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __scene: typeof useSceneStore }).__scene =
        useSceneStore;
    }
  }, []);

  return (
    <Canvas
      flat
      camera={{ position: [0, 2.6, 10.5], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[CREAM]} />
      <InspectRig />
      <Suspense fallback={null}>
        <Physics
          interpolate
          gravity={[0, -20, 0]}
          timeStep={1 / 60}
          paused={mode === "inspect" || (mode === "spilled" && settled)}
        >
          <Stage />
          <AvatarHead />
          {/* Isolate bag GLTF suspend/fail so stage + avatar still paint. */}
          <Suspense fallback={null}>
            <Bag />
          </Suspense>
          <ItemSpill />
          <InspectStage />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
