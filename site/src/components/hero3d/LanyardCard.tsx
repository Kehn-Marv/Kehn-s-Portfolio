"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  extend,
  useFrame,
  useThree,
  type ThreeEvent,
  type ThreeElement,
} from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { drawBackTexture, drawFrontTexture } from "./cardTextures";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

interface CardTextures {
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
}

function useCardTextures(): CardTextures | null {
  const [textures, setTextures] = useState<CardTextures | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function make() {
      await document.fonts.ready;
      const avatar = new window.Image();
      avatar.src = "/assets/avatar.png";
      try {
        await avatar.decode();
      } catch {
        // Card still renders without the avatar photo.
      }
      if (cancelled) return;

      const styles = getComputedStyle(document.documentElement);
      const display =
        styles.getPropertyValue("--font-space-grotesk").trim() || "sans-serif";
      const mono =
        styles.getPropertyValue("--font-space-mono").trim() || "monospace";

      setTextures({
        front: drawFrontTexture(avatar.complete ? avatar : null, display, mono),
        back: drawBackTexture(display, mono),
      });
    }

    make();
    return () => {
      cancelled = true;
    };
  }, []);

  return textures;
}

type Lerped = RapierRigidBody & { lerped?: THREE.Vector3 };

const CARD_W = 1.7;
const CARD_H = 2.39;
const CARD_T = 0.045;
const JOINT_Y = CARD_H / 2 + 0.12;

const BAND_Z_OFFSET = 0.09;

/** Keep the dragged card inside the visible canvas area (world units). */
const DRAG_BOUNDS = { x: 0.95, yMin: -1.55, yMax: 2.6, zMin: -0.4, zMax: 0.8 };

function Band({ maxSpeed = 50, minSpeed = 10 }: { maxSpeed?: number; minSpeed?: number }) {
  const band = useRef<THREE.Mesh & { geometry: MeshLineGeometry }>(null);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<RapierRigidBody>(null!);
  const j2 = useRef<RapierRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const cardQuat = useMemo(() => new THREE.Quaternion(), []);
  const clipAnchor = useMemo(() => new THREE.Vector3(), []);

  const { width, height } = useThree((state) => state.size);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(),
          new THREE.Vector3(),
          new THREE.Vector3(),
          new THREE.Vector3(),
          new THREE.Vector3(),
        ],
        false,
        "chordal"
      )
  );
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const textures = useCardTextures();
  const bandMaterialArgs = useMemo(
    () => [{}] as ConstructorParameters<typeof MeshLineMaterial>,
    []
  );

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, JOINT_Y, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  /* eslint-disable react-hooks/immutability -- Three.js animation mutates curve points each frame */
  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: THREE.MathUtils.clamp(vec.x - dragged.x, -DRAG_BOUNDS.x, DRAG_BOUNDS.x),
        y: THREE.MathUtils.clamp(vec.y - dragged.y, DRAG_BOUNDS.yMin, DRAG_BOUNDS.yMax),
        z: THREE.MathUtils.clamp(vec.z - dragged.z, DRAG_BOUNDS.zMin, DRAG_BOUNDS.zMax),
      });
    }
    if (
      fixed.current &&
      j1.current &&
      j2.current &&
      j3.current &&
      card.current &&
      band.current
    ) {
      [j1, j2, j3].forEach((ref) => {
        const body = ref.current as Lerped;
        if (!body.lerped) {
          body.lerped = new THREE.Vector3().copy(body.translation());
        }
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, body.lerped.distanceTo(body.translation()))
        );
        body.lerped.lerp(
          body.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      const cardPos = card.current.translation();
      const cardRot = card.current.rotation();
      cardQuat.set(cardRot.x, cardRot.y, cardRot.z, cardRot.w);
      clipAnchor.set(0, CARD_H / 2 - 0.1, 0).applyQuaternion(cardQuat);
      curve.points[0].set(
        cardPos.x + clipAnchor.x,
        cardPos.y + clipAnchor.y,
        cardPos.z + clipAnchor.z
      );
      curve.points[1].copy((j3.current as Lerped).lerped!);
      curve.points[2].copy((j2.current as Lerped).lerped!);
      curve.points[3].copy((j1.current as Lerped).lerped!);
      curve.points[4].copy(fixed.current.translation());
      for (const point of curve.points) {
        point.z -= BAND_Z_OFFSET;
      }
      band.current.geometry.setPoints(curve.getPoints(40));

      ang.copy(card.current.angvel());
      const cardQ = card.current.rotation();
      quat.set(cardQ.x, cardQ.y, cardQ.z, cardQ.w);
      euler.setFromQuaternion(quat, "YXZ");
      const targetYaw = flipped ? Math.PI : 0;
      let yawErr = targetYaw - euler.y;
      yawErr = ((yawErr + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      card.current.setAngvel(
        {
          x: ang.x,
          y: ang.y * 0.15 + THREE.MathUtils.clamp(yawErr * 7, -16, 16),
          z: ang.z,
        },
        true
      );
    }
  });
  /* eslint-enable react-hooks/immutability */

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    if (card.current) {
      drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
    }
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    drag(false);
  };

  return (
    <>
      <group position={[0.2, 4.2, 0]}>
        <RigidBody ref={fixed} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} angularDamping={2} linearDamping={2}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} angularDamping={2} linearDamping={2}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} angularDamping={2} linearDamping={2}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          angularDamping={2}
          linearDamping={2}
          type={dragged ? "kinematicPosition" : "dynamic"}
          canSleep={false}
        >
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_T / 2]} />
          <group
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onClick={(e) => {
              if (e.delta < 8) {
                setFlipped((f) => !f);
              }
            }}
          >
            <mesh>
              <boxGeometry args={[CARD_W, CARD_H, CARD_T]} />
              <meshBasicMaterial attach="material-0" color="#141111" />
              <meshBasicMaterial attach="material-1" color="#141111" />
              <meshBasicMaterial attach="material-2" color="#141111" />
              <meshBasicMaterial attach="material-3" color="#141111" />
              <meshBasicMaterial
                key={textures ? "front-textured" : "front-plain"}
                attach="material-4"
                map={textures?.front ?? null}
                color={textures ? "#ffffff" : "#FFFAEF"}
              />
              <meshBasicMaterial
                key={textures ? "back-textured" : "back-plain"}
                attach="material-5"
                map={textures?.back ?? null}
                color={textures ? "#ffffff" : "#FFFAEF"}
              />
            </mesh>
            {/* Clip bridging the band gap */}
            <mesh position={[0, CARD_H / 2 + 0.06, 0]}>
              <boxGeometry args={[0.52, 0.3, 0.06]} />
              <meshBasicMaterial color="#141111" />
            </mesh>
            <mesh position={[0, CARD_H / 2 + 0.06, 0.035]}>
              <boxGeometry args={[0.46, 0.24, 0.05]} />
              <meshBasicMaterial color="#FFD440" />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band} frustumCulled={false}>
        <meshLineGeometry />
        <meshLineMaterial
          args={bandMaterialArgs}
          color="#141111"
          resolution={[width, height]}
          lineWidth={0.6}
        />
      </mesh>
    </>
  );
}

export function LanyardCard() {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 11], fov: 25 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
    >
      <Suspense fallback={null}>
        <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
          <Band />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
