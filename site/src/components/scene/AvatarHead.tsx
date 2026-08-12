"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import {
  applyToonToGltf,
  getSharedToonMaterial,
  OUTLINE_THICKNESS,
} from "./materials/toon";
import { INK } from "@/lib/tokens";

const HEAD_POS = new THREE.Vector3(-2.6, 1.7, 0);

export const HEAD_MODEL_URL: string | null = null;

function HeadModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const copy = SkeletonUtils.clone(scene);
    applyToonToGltf(copy);
    return copy;
  }, [scene]);
  return <primitive object={cloned} />;
}

export function AvatarHead() {
  const group = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const skin = getSharedToonMaterial("cream");
  const dark = getSharedToonMaterial("ink");

  useFrame((state) => {
    if (group.current) {
      group.current.position.y =
        HEAD_POS.y + Math.sin(state.clock.elapsedTime * 1.4) * 0.06;
      group.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.9) * 0.03;
    }
    if (eyes.current) {
      eyes.current.rotation.y = THREE.MathUtils.clamp(
        state.pointer.x * 0.35,
        -0.35,
        0.35
      );
      eyes.current.rotation.x = THREE.MathUtils.clamp(
        -state.pointer.y * 0.25,
        -0.25,
        0.25
      );
    }
  });

  return (
    <group ref={group} position={HEAD_POS}>
      {HEAD_MODEL_URL ? (
        <HeadModel url={HEAD_MODEL_URL} />
      ) : (
        <>
          <mesh material={skin}>
            <sphereGeometry args={[1.05, 48, 48]} />
            <Outlines thickness={OUTLINE_THICKNESS} color={INK} screenspace />
          </mesh>
          <mesh material={dark} position={[0, 0.62, 0]}>
            <cylinderGeometry args={[1.28, 1.34, 0.16, 40]} />
            <Outlines thickness={OUTLINE_THICKNESS} color={INK} screenspace />
          </mesh>
          <mesh material={dark} position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.78, 1.02, 0.62, 40]} />
            <Outlines thickness={OUTLINE_THICKNESS} color={INK} screenspace />
          </mesh>
        </>
      )}
      <group ref={eyes}>
        <mesh material={dark} position={[-0.34, 0.12, 0.95]}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>
        <mesh material={dark} position={[0.34, 0.12, 0.95]}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>
      </group>
    </group>
  );
}
