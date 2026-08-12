"use client";

import { useMemo } from "react";
import { animated, useSpring } from "@react-spring/three";
import { Outlines, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { useSceneStore } from "./sceneStore";
import {
  applyToonToGltf,
  getSharedToonMaterial,
  OUTLINE_THICKNESS,
} from "./materials/toon";
import { INK } from "@/lib/tokens";
import { bagModelYOffset } from "./lib/bagLayout";

// Prefer local Draco WASM so bag.glb (or future compressed models) does not
// depend on gstatic.com — a blocked CDN leaves Suspense hanging on cream.
useGLTF.setDecoderPath("/draco/");

export const BAG_POS: [number, number, number] = [2.6, 0.75, 0];
export const BAG_MODEL_URL: string | null = "/models/bag.glb";

// GLB bbox is ~1.90w x 1.79h x 1.08d centered at origin; scale width
// to ~1.8 world units and lift so the bottom rests on the floor.
const BAG_MODEL_SCALE = 1.09;
const BAG_MODEL_Y_OFFSET = bagModelYOffset(BAG_MODEL_SCALE);
const BAG_MODEL_YAW = -0.22; // was -0.35

/** Local-space strap buckle seats (front straps at flap / body junction). */
const STRAP_BUCKLES: [number, number, number][] = [
  [-0.22, -0.42, 0.53],
  [0.22, -0.42, 0.53],
];

function StrapBuckle({ position }: { position: [number, number, number] }) {
  const plastic = getSharedToonMaterial("buckle");
  const highlight = getSharedToonMaterial("buckleHi");
  return (
    <group position={position}>
      {/* Side-release latch body — charcoal plastic vs navy webbing */}
      <mesh material={plastic}>
        <boxGeometry args={[0.18, 0.14, 0.08]} />
        <Outlines thickness={OUTLINE_THICKNESS * 0.85} color={INK} screenspace />
      </mesh>
      {/* Center slot / prong recess */}
      <mesh material={plastic} position={[0, 0, 0.025]}>
        <boxGeometry args={[0.04, 0.09, 0.055]} />
      </mesh>
      {/* Top rim catch-light (stylized Herschel-like edge read) */}
      <mesh material={highlight} position={[0, 0.055, 0.045]}>
        <boxGeometry args={[0.16, 0.025, 0.015]} />
      </mesh>
      {/* Left edge specular chip */}
      <mesh material={highlight} position={[-0.065, 0.01, 0.045]}>
        <boxGeometry args={[0.035, 0.09, 0.012]} />
      </mesh>
    </group>
  );
}

function BagModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const copy = SkeletonUtils.clone(scene);
    applyToonToGltf(copy);
    return copy;
  }, [scene]);
  return (
    <group
      scale={BAG_MODEL_SCALE}
      position={[0, BAG_MODEL_Y_OFFSET, 0]}
      rotation={[0, BAG_MODEL_YAW, 0]}
    >
      <primitive object={cloned} />
      {STRAP_BUCKLES.map((pos) => (
        <StrapBuckle key={pos.join(",")} position={pos} />
      ))}
    </group>
  );
}

if (BAG_MODEL_URL) useGLTF.preload(BAG_MODEL_URL);

export function Bag() {
  const spill = useSceneStore((s) => s.spill);
  const mode = useSceneStore((s) => s.mode);
  const body = getSharedToonMaterial("cream");
  const strap = getSharedToonMaterial("yellow");

  const [springs, api] = useSpring(() => ({
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    config: { tension: 300, friction: 12 },
  }));

  const onClick = () => {
    if (mode !== "idle") return;
    api.start({
      to: async (next) => {
        await next({ scaleX: 1.12, scaleY: 0.82, scaleZ: 1.12 });
        await next({ scaleX: 0.95, scaleY: 1.1, scaleZ: 0.95 });
        await next({ scaleX: 1, scaleY: 1, scaleZ: 1 });
      },
    });
    spill();
    document.body.style.cursor = "auto";
  };

  return (
    <animated.group
      position={BAG_POS}
      scale-x={springs.scaleX}
      scale-y={springs.scaleY}
      scale-z={springs.scaleZ}
      onClick={onClick}
      onPointerOver={() => {
        document.body.style.cursor = mode === "idle" ? "pointer" : "auto";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {BAG_MODEL_URL ? (
        <BagModel url={BAG_MODEL_URL} />
      ) : (
        <>
          <mesh material={body}>
            <boxGeometry args={[1.5, 1.5, 1.0]} />
            <Outlines thickness={OUTLINE_THICKNESS} color={INK} screenspace />
          </mesh>
          <mesh material={body} position={[0, 0.85, 0]}>
            <boxGeometry args={[1.5, 0.2, 1.0]} />
            <Outlines thickness={OUTLINE_THICKNESS} color={INK} screenspace />
          </mesh>
          <mesh material={strap} position={[-0.45, 0.2, 0.55]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.18, 1.1, 0.08]} />
          </mesh>
          <mesh material={strap} position={[0.45, 0.2, 0.55]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.18, 1.1, 0.08]} />
          </mesh>
        </>
      )}
    </animated.group>
  );
}
