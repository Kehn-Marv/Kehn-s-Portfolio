"use client";

import * as THREE from "three";
import { useMemo, useState } from "react";
import { animated, useSpring } from "@react-spring/three";
import { RIG_POINT } from "../InspectRig";
import { CREAM, INK, palette } from "@/lib/tokens";

const CARDS = [
  { title: "FLASHCARDS", body: "click to flip through" },
  { title: "CARD 02", body: "placeholder project story" },
  { title: "CARD 03", body: "real content lands in plan 3" },
];

function makeCardTexture(title: string, body: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, c.width - 12, c.height - 12);
  ctx.fillStyle = palette.yellow;
  ctx.fillRect(48, 48, 300, 72);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(48, 48, 300, 72);
  ctx.fillStyle = INK;
  ctx.font = "bold 44px monospace";
  ctx.fillText(title, 64, 98);
  ctx.font = "36px monospace";
  ctx.fillText(body, 48, 220);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function Card({ index, current }: { index: number; current: number }) {
  const texture = useMemo(
    () => makeCardTexture(CARDS[index].title, CARDS[index].body),
    [index]
  );
  const flipped = index < current;
  const offset = index - current;
  const spring = useSpring({
    rotationY: flipped ? Math.PI : 0,
    positionX: flipped ? -2.6 : offset * 0.04,
    positionY: flipped ? 0.1 : -offset * 0.05,
    positionZ: flipped ? -0.2 : -offset * 0.06,
    config: { tension: 220, friction: 24 },
  });
  return (
    <animated.group
      position-x={spring.positionX}
      position-y={spring.positionY}
      position-z={spring.positionZ}
      rotation-y={spring.rotationY}
    >
      <mesh>
        <boxGeometry args={[1.6, 1.0, 0.02]} />
        <meshBasicMaterial attach="material-0" color={INK} />
        <meshBasicMaterial attach="material-1" color={INK} />
        <meshBasicMaterial attach="material-2" color={INK} />
        <meshBasicMaterial attach="material-3" color={INK} />
        <meshBasicMaterial attach="material-4" map={texture} />
        <meshBasicMaterial attach="material-5" color={CREAM} />
      </mesh>
    </animated.group>
  );
}

export default function FlashcardInspect() {
  const [current, setCurrent] = useState(0);
  return (
    <group
      position={RIG_POINT}
      onClick={(e) => {
        e.stopPropagation();
        setCurrent((c) => (c + 1) % (CARDS.length + 1));
      }}
    >
      {CARDS.map((_, i) => (
        <Card key={i} index={i} current={current} />
      ))}
    </group>
  );
}
