"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { ContactShadows } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { CREAM, INK } from "@/lib/tokens";

/** Canvas-painted dot grid approximates the 2D `texture-dots` utility (22px CSS grid vs 32px canvas grid). */
function useDotTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = `${INK}24`; // 14% alpha
    for (let y = 16; y < 256; y += 32) {
      for (let x = 16; x < 256; x += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
  }, []);
}

export function Stage() {
  const dots = useDotTexture();
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial map={dots} />
      </mesh>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={18}
        blur={0.6}
        far={4}
        color={INK}
      />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[20, 0.5, 20]} position={[0, -0.5, 0]} />
        {/* Invisible walls: without them rolling items (the badge coin!)
            escape the floor plane, never sleep, and settled never fires. */}
        <CuboidCollider args={[0.5, 3, 20]} position={[-8, 3, 0]} />
        <CuboidCollider args={[0.5, 3, 20]} position={[8, 3, 0]} />
        <CuboidCollider args={[20, 3, 0.5]} position={[0, 3, -4.5]} />
        <CuboidCollider args={[20, 3, 0.5]} position={[0, 3, 4.5]} />
      </RigidBody>
    </>
  );
}
