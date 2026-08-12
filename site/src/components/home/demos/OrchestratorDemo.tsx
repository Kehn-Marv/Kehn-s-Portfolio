"use client";

import { useEffect, useRef, useState } from "react";
import { PlayHint } from "./PlayHint";

type Phase = "idle" | "approved" | "running" | "done";

const AGENTS = [
  { name: "frontend", bg: "bg-brutal-cyan", width: 100, duration: 850, delay: 0 },
  { name: "backend", bg: "bg-brutal-pink", width: 80, duration: 1200, delay: 60 },
  { name: "tests", bg: "bg-brutal-lime", width: 100, duration: 1100, delay: 120 },
  { name: "docs", bg: "bg-brutal-lavender", width: 60, duration: 700, delay: 90 },
] as const;

/**
 * Live mini-demo of Team Orchestrator inside the work card: a plan.md bar
 * waits for approval, and on hover the plan is approved, four specialized
 * agents run in parallel, and a verification line confirms the build.
 */
export function OrchestratorDemo({ trigger = 0 }: { trigger?: number }) {
  const [phase, setPhase] = useState<Phase>("idle");
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
    timers.current.push(setTimeout(() => setPhase("approved"), 50));
    timers.current.push(setTimeout(() => setPhase("running"), 300));
    timers.current.push(setTimeout(() => setPhase("done"), 1750));
  };

  useEffect(() => {
    if (trigger > 0) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const approved = phase !== "idle";
  const running = phase === "running" || phase === "done";

  return (
    <div className="relative flex h-52 flex-col gap-2 overflow-hidden bg-cream p-3 font-mono text-xs text-ink">
      <PlayHint played={started} />
      <div className="flex items-center justify-between border-2 border-ink px-3 py-1">
        <span className="font-bold">plan.md</span>
        <span
          className={`border-2 border-ink px-2 py-0.5 font-bold ${
            approved ? "bg-brutal-lime" : "animate-pulse bg-brutal-yellow"
          }`}
        >
          {approved ? "✓ approved" : "awaiting approval"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {AGENTS.map((agent) => (
          <div key={agent.name} className="flex items-center gap-2">
            <span
              className={`w-20 border-2 border-ink px-1.5 text-center font-bold ${agent.bg}`}
            >
              {agent.name}
            </span>
            <div className="h-4 flex-1 border-2 border-ink bg-cream">
              <div
                className="h-full bg-ink transition-[width] ease-out"
                style={{
                  width: running ? `${agent.width}%` : "0%",
                  // Instant drain on replay reset, animated fill while running.
                  transitionDuration: running ? `${agent.duration}ms` : "0ms",
                  transitionDelay: running ? `${agent.delay}ms` : "0ms",
                }}
              />
            </div>
            <span
              className={`w-3 font-bold transition-opacity duration-200 ${
                running && agent.width === 100 ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: `${agent.delay + agent.duration}ms` }}
            >
              ✓
            </span>
          </div>
        ))}
      </div>

      <div
        className={`self-start transition-all duration-300 ease-out ${
          phase === "done" ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="border-2 border-ink bg-brutal-lime px-2 py-0.5 font-bold">
          build ✓ · verified before done
        </span>
      </div>
    </div>
  );
}
