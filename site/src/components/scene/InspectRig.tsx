"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { useSceneStore } from "./sceneStore";
import { INK } from "@/lib/tokens";

/** World-space point where inspected items present themselves. */
export const RIG_POINT = new THREE.Vector3(0, 2.0, 5.0);

const IDLE_POSE = {
  position: [0, 2.6, 10.5],
  target: [0, 1.35, 0],
} as const;
const INSPECT_POSE = {
  position: [0, 2.0, 7.6],
  target: [RIG_POINT.x, RIG_POINT.y, RIG_POINT.z],
} as const;

export function InspectRig() {
  const mode = useSceneStore((s) => s.mode);
  const controls = useRef<CameraControls>(null);
  const inspecting = mode === "inspect";

  const dimSpring = useSpring({
    opacity: inspecting ? 0.55 : 0,
    config: { tension: 170, friction: 26 },
  });

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const pose = inspecting ? INSPECT_POSE : IDLE_POSE;
    c.setLookAt(
      pose.position[0],
      pose.position[1],
      pose.position[2],
      pose.target[0],
      pose.target[1],
      pose.target[2],
      true
    );
  }, [inspecting]);

  return (
    <>
      <CameraControls
        ref={controls}
        makeDefault
        mouseButtons={{ left: 0, middle: 0, right: 0, wheel: 0 }}
        touches={{ one: 0, two: 0, three: 0 }}
      />
      {/* z sits in front of the scattered items (rest up to z≈4.2) but
          behind RIG_POINT (z=5), so presented items stay bright. */}
      <animated.mesh position={[0, 2.2, 4.6]} visible={dimSpring.opacity.to((o) => o > 0.01)}>
        <planeGeometry args={[30, 14]} />
        <animated.meshBasicMaterial
          color={INK}
          transparent
          opacity={dimSpring.opacity}
          depthWrite={false}
        />
      </animated.mesh>
    </>
  );
}
