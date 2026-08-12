export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SpillEntry {
  /** ms after bag-open animation completes */
  delayMs: number;
  /** local spawn offset inside the bag mouth */
  spawnOffset: Vec3;
  impulse: Vec3;
  torque: Vec3;
}

/** mulberry32 — tiny deterministic PRNG so spills are replayable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BASE_STAGGER_MS = 90;
export const STAGGER_JITTER_MS = 60;

const SPAWN_SPREAD_XZ = 0.3;
const SPAWN_Y_BASE = 0.15;
const SPAWN_Y_JITTER = 0.2;
/** fan: 120°..240° from the +x axis, i.e. the leftward half */
const FAN_ANGLE_START = (Math.PI * 2) / 3;
const FAN_ANGLE_RANGE = (Math.PI * 2) / 3;
const SPEED_MIN = 3.0;
const SPEED_RANGE = 3.0;
const POP_MIN = 2.5;
const POP_RANGE = 2.0;
const FAN_Z_SCALE = 0.5;
/** per-axis torque range: value lands in [-TORQUE_MAX, TORQUE_MAX) */
const TORQUE_MAX = 0.6;

/**
 * The bag sits on the +x side of the stage; items should fan out
 * toward -x (open floor) with a controlled upward pop.
 */
export function makeSpillPlan(count: number, seed: number): SpillEntry[] {
  const rand = mulberry32(seed);
  const entries: SpillEntry[] = [];
  let delay = 0;
  for (let i = 0; i < count; i++) {
    delay += BASE_STAGGER_MS + rand() * STAGGER_JITTER_MS;
    const theta = FAN_ANGLE_START + rand() * FAN_ANGLE_RANGE;
    const speed = SPEED_MIN + rand() * SPEED_RANGE;
    entries.push({
      delayMs: Math.round(delay),
      spawnOffset: {
        x: (rand() - 0.5) * SPAWN_SPREAD_XZ,
        y: SPAWN_Y_BASE + rand() * SPAWN_Y_JITTER,
        z: (rand() - 0.5) * SPAWN_SPREAD_XZ,
      },
      impulse: {
        x: Math.cos(theta) * speed,
        y: POP_MIN + rand() * POP_RANGE,
        z: Math.sin(theta) * speed * FAN_Z_SCALE,
      },
      torque: {
        x: (rand() - 0.5) * 2 * TORQUE_MAX,
        y: (rand() - 0.5) * 2 * TORQUE_MAX,
        z: (rand() - 0.5) * 2 * TORQUE_MAX,
      },
    });
  }
  return entries;
}
