"use client";

import * as THREE from "three";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useSceneStore } from "./sceneStore";
import { getSharedToonMaterial } from "./materials/toon";
import type { ItemDef } from "./items/itemRegistry";
import { GltfItemVisual } from "./items/GltfItemVisual";
import type { SpillEntry } from "./lib/spill";
import { BAG_POS } from "./Bag";

interface DraggableItemProps {
  def: ItemDef;
  entry: SpillEntry;
  onBodyReady: (id: ItemDef["id"], body: RapierRigidBody) => void;
}

const DRAG_BOUNDS = { x: 5.5, yMin: 0.3, yMax: 4.5, zMin: -2.5, zMax: 2.5 };
const THROW_SPEED_MAX = 8;
const TORQUE_TO_ANGVEL = 4;

export function DraggableItem({ def, entry, onBodyReady }: DraggableItemProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const pendingThrow = useRef<THREE.Vector3 | null>(null);
  const mode = useSceneStore((s) => s.mode);
  const activeItemId = useSceneStore((s) => s.activeItemId);
  const beginInspect = useSceneStore((s) => s.beginInspect);
  const markSettled = useSceneStore((s) => s.markSettled);
  const hidden = activeItemId === def.id;
  const material = getSharedToonMaterial(def.color);

  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const lastPos = useMemo(() => new THREE.Vector3(), []);
  const velocity = useMemo(() => new THREE.Vector3(), []);
  // THREE.Vector3 (not a plain object) so per-frame mutation stays within
  // the class-instance pattern the react-hooks immutability lint allows;
  // structurally satisfies rapier's {x,y,z} Vector interface.
  const kinematicTarget = useMemo(() => new THREE.Vector3(), []);

  const spawn: [number, number, number] = [
    BAG_POS[0] + entry.spawnOffset.x,
    BAG_POS[1] + 0.9 + entry.spawnOffset.y,
    BAG_POS[2] + entry.spawnOffset.z,
  ];

  // Stable tuples: fresh array identities each render could make the
  // library re-apply the launch velocity mid-flight.
  const launchLinvel = useMemo<[number, number, number]>(
    () => [entry.impulse.x, entry.impulse.y, entry.impulse.z],
    [entry]
  );
  const launchAngvel = useMemo<[number, number, number]>(
    () => [
      entry.torque.x * TORQUE_TO_ANGVEL,
      entry.torque.y * TORQUE_TO_ANGVEL,
      entry.torque.z * TORQUE_TO_ANGVEL,
    ],
    [entry]
  );

  const assignBody = useCallback(
    (rb: RapierRigidBody | null) => {
      bodyRef.current = rb;
      if (rb) onBodyReady(def.id, rb);
    },
    [def.id, onBodyReady]
  );

  useFrame((state, delta) => {
    const body = bodyRef.current;
    if (!body) return;
    if (!dragged && pendingThrow.current) {
      // The declarative `type` prop only commits back to "dynamic" on the
      // next render; setLinvel on a still-kinematic body is ignored, so
      // retry every frame until the switch has landed.
      if (!body.isKinematic()) {
        body.wakeUp();
        const v = pendingThrow.current;
        body.setLinvel({ x: v.x, y: v.y, z: v.z }, true);
        pendingThrow.current = null;
      }
    }
    if (!dragged) return;
    vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
    dir.copy(vec).sub(state.camera.position).normalize();
    vec.add(dir.multiplyScalar(state.camera.position.length()));
    kinematicTarget.set(
      THREE.MathUtils.clamp(vec.x - dragged.x, -DRAG_BOUNDS.x, DRAG_BOUNDS.x),
      THREE.MathUtils.clamp(vec.y - dragged.y, DRAG_BOUNDS.yMin, DRAG_BOUNDS.yMax),
      THREE.MathUtils.clamp(vec.z - dragged.z, DRAG_BOUNDS.zMin, DRAG_BOUNDS.zMax)
    );
    velocity
      .copy(kinematicTarget)
      .sub(lastPos)
      .divideScalar(Math.max(delta, 1 / 120));
    lastPos.copy(kinematicTarget);
    body.setNextKinematicTranslation(kinematicTarget);
  });

  const endDrag = (applyThrow: boolean) => {
    if (!dragged) return;
    setDragged(false);
    document.body.style.cursor = "auto";
    pendingThrow.current = applyThrow
      ? velocity.clone().clampLength(0, THROW_SPEED_MAX)
      : null;
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (hidden || mode !== "spilled") return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const body = bodyRef.current;
    if (!body) return;
    markSettled(false);
    body.wakeUp();
    const t = body.translation();
    lastPos.set(t.x, t.y, t.z);
    // Reset so a no-movement click can't inherit the previous drag's
    // velocity as a phantom throw.
    velocity.set(0, 0, 0);
    setDragged(new THREE.Vector3().copy(e.point).sub(vec.set(t.x, t.y, t.z)));
    document.body.style.cursor = "grabbing";
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!dragged) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    endDrag(true);
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (hidden || mode !== "spilled" || e.delta >= 8) return;
    // A sub-threshold drag-release just queued a throw; entering inspect
    // must cancel it or the item flies off when inspect ends.
    pendingThrow.current = null;
    beginInspect(def.id);
  };

  const primitiveMesh =
    def.shape.kind === "box" ? (
      <mesh material={material}>
        <boxGeometry args={def.shape.size} />
      </mesh>
    ) : (
      <mesh material={material}>
        <cylinderGeometry
          args={[def.shape.radius, def.shape.radius, def.shape.height, 24]}
        />
      </mesh>
    );

  return (
    <RigidBody
      ref={assignBody}
      position={spawn}
      // Declarative launch velocities survive StrictMode body re-creation,
      // unlike a one-shot applyImpulse on the first ref attach.
      linearVelocity={launchLinvel}
      angularVelocity={launchAngvel}
      colliders={false}
      restitution={0.2}
      friction={0.8}
      linearDamping={0.6}
      angularDamping={0.8}
      type={dragged ? "kinematicPosition" : "dynamic"}
    >
      {def.shape.kind === "box" ? (
        <CuboidCollider
          args={[
            def.shape.size[0] / 2,
            def.shape.size[1] / 2,
            def.shape.size[2] / 2,
          ]}
        />
      ) : (
        <CylinderCollider
          args={[def.shape.height / 2, def.shape.radius]}
        />
      )}
      <group
        visible={!hidden}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => endDrag(false)}
        onLostPointerCapture={() => endDrag(false)}
        onPointerOver={() => {
          if (hidden || mode !== "spilled") return;
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!dragged) document.body.style.cursor = "auto";
        }}
      >
        {def.model ? (
          <Suspense fallback={primitiveMesh}>
            <GltfItemVisual model={def.model} />
          </Suspense>
        ) : (
          primitiveMesh
        )}
      </group>
    </RigidBody>
  );
}
