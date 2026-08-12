"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useSceneStore, type ItemId } from "./sceneStore";
import { ITEM_LIST } from "./items/itemRegistry";
import { makeSpillPlan } from "./lib/spill";
import { DraggableItem } from "./DraggableItem";

const SETTLE_POLL_FRAMES = 30;
// Piled bodies micro-jitter forever and may never reach Rapier's sleep
// state, so "calm enough" velocities also count as settled.
const SETTLE_LINVEL_SQ = 0.0025; // 0.05 m/s
const SETTLE_ANGVEL_SQ = 0.01; // 0.1 rad/s

export function ItemSpill() {
  const mode = useSceneStore((s) => s.mode);
  const seed = useSceneStore((s) => s.spillSeed);
  const markSettled = useSceneStore((s) => s.markSettled);
  const [visibleCount, setVisibleCount] = useState(0);
  const bodies = useRef(new Map<ItemId, RapierRigidBody>());
  const frameCounter = useRef(0);

  const plan = useMemo(() => makeSpillPlan(ITEM_LIST.length, seed), [seed]);
  const active = mode === "spilled" || mode === "inspect";

  const handleBodyReady = useCallback((id: ItemId, rb: RapierRigidBody) => {
    bodies.current.set(id, rb);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timers = plan.map((entry, i) =>
      setTimeout(() => setVisibleCount((c) => Math.max(c, i + 1)), entry.delayMs)
    );
    return () => timers.forEach(clearTimeout);
  }, [active, plan]);

  useFrame(() => {
    if (mode !== "spilled" || visibleCount < ITEM_LIST.length) return;
    frameCounter.current += 1;
    if (frameCounter.current % SETTLE_POLL_FRAMES !== 0) return;
    let allCalm = bodies.current.size === ITEM_LIST.length;
    for (const body of bodies.current.values()) {
      // A kinematic body means someone is mid-drag: never settled, even
      // though its reported velocity is ~zero while hovering still.
      if (body.isKinematic()) {
        allCalm = false;
        break;
      }
      if (body.isSleeping()) continue;
      const lv = body.linvel();
      const av = body.angvel();
      if (
        lv.x * lv.x + lv.y * lv.y + lv.z * lv.z > SETTLE_LINVEL_SQ ||
        av.x * av.x + av.y * av.y + av.z * av.z > SETTLE_ANGVEL_SQ
      ) {
        allCalm = false;
        break;
      }
    }
    markSettled(allCalm);
  });

  if (!active) return null;

  return (
    <>
      {ITEM_LIST.slice(0, visibleCount).map((def, i) => (
        <DraggableItem
          key={def.id}
          def={def}
          entry={plan[i]}
          onBodyReady={handleBodyReady}
        />
      ))}
    </>
  );
}
