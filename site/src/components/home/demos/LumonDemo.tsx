"use client";

import { useEffect, useRef, useState } from "react";
import { PlayHint } from "./PlayHint";

// Deterministic 9x4 grid of ominous digits — no randomness.
const GRID = [
  [4, 1, 7, 2, 9, 3, 6, 8, 5],
  [2, 8, 5, 3, 1, 7, 4, 9, 6],
  [9, 3, 6, 8, 4, 2, 5, 1, 7],
  [5, 7, 1, 9, 6, 8, 3, 2, 4],
];
const COLS = 9;

// The "scary" cluster: a 2x3 rectangle of cells (row, col) that get refined.
// Must stay rectangular — the selection box wraps exactly these cells.
const SCARY = new Set(["1-4", "1-5", "1-6", "2-4", "2-5", "2-6"]);
const BOX = { col: 5, colSpan: 3, row: 2, rowSpan: 2 };

type Phase = "idle" | "select" | "refine" | "done";

/**
 * Live mini-demo of the Lumon Microdata Refinement Simulator inside the work
 * card: a cold Lumon terminal shows a grid of digits; on hover a scary cluster
 * lights up cyan, gets boxed, then is refined away as progress climbs to 100%.
 */
export function LumonDemo({ trigger = 0 }: { trigger?: number }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const play = () => {
    clearTimers();
    setStarted(true);
    setPhase("idle");
    setProgress(0);
    timers.current.push(setTimeout(() => setPhase("select"), 250));
    timers.current.push(setTimeout(() => setProgress(47), 900));
    timers.current.push(setTimeout(() => setPhase("refine"), 1100));
    timers.current.push(setTimeout(() => setProgress(100), 1700));
    timers.current.push(setTimeout(() => setPhase("done"), 1900));
  };

  useEffect(() => {
    if (trigger > 0) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const selecting = phase === "select" || phase === "refine" || phase === "done";
  const refined = phase === "refine" || phase === "done";

  return (
    <div className="relative flex h-52 flex-col gap-2 overflow-hidden bg-ink p-4 font-mono text-xs">
      <PlayHint played={started} />
      <div className="flex items-center justify-between text-cream/80">
        <span className="font-bold tracking-wider text-brutal-cyan">
          MDR · cold harbor
        </span>
        <span className="tabular-nums text-cream/60">{progress}%</span>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-9 gap-x-1.5 gap-y-1 leading-none">
          {GRID.map((row, r) =>
            row.map((d, c) => {
              const key = `${r}-${c}`;
              const isScary = SCARY.has(key);
              const active = selecting && isScary;
              const gone = refined && isScary;
              const delay = (r * COLS + c) * 12;
              return (
                <span
                  key={key}
                  className={`text-center transition-all duration-500 ease-out ${
                    active ? "text-brutal-cyan" : "text-cream/60"
                  } ${gone ? "scale-50 opacity-0" : active ? "scale-125" : "scale-100 opacity-100"}`}
                  style={{
                    transitionDelay: `${gone ? delay : 0}ms`,
                    gridColumn: c + 1,
                    gridRow: r + 1,
                  }}
                >
                  {d}
                </span>
              );
            }),
          )}

          {/* Lumon selection box: a grid member spanning exactly the scary
              cluster, so it always wraps the refined cells. */}
          <div
            className={`pointer-events-none -m-1.5 border-2 border-brutal-cyan transition-opacity duration-300 ease-out ${
              selecting && !refined ? "opacity-100" : "opacity-0"
            }`}
            style={{
              gridColumn: `${BOX.col} / span ${BOX.colSpan}`,
              gridRow: `${BOX.row} / span ${BOX.rowSpan}`,
            }}
          />
        </div>
      </div>

      <div className="flex h-5 items-center">
        {phase === "done" ? (
          <span className="border-2 border-ink bg-brutal-cyan px-2 py-0.5 font-bold lowercase tracking-wider text-ink">
            100% · praise kier
          </span>
        ) : (
          <span className="text-cream/40">
            {phase === "refine"
              ? "refining…"
              : phase === "select"
                ? "cluster detected"
                : "awaiting operator"}
          </span>
        )}
      </div>
    </div>
  );
}
