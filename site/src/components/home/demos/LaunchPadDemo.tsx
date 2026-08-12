"use client";

import { useEffect, useRef, useState } from "react";
import { PlayHint } from "./PlayHint";

type Phase = "idle" | "highlight" | "confirm" | "stopped" | "done";

type Job = {
  name: string;
  system?: boolean;
  running: boolean;
};

const JOBS: Job[] = [
  { name: "com.dropbox.sync", running: true },
  { name: "com.adobe.updater", running: true },
  { name: "com.apple.mdns", running: true, system: true },
  { name: "dev.marv.backup", running: false },
];

const TARGET = "com.adobe.updater";

/**
 * Live mini-demo of LaunchPad inside the work card: a launchd job list that
 * sits idle, and on hover plays a safe stop sequence — highlight the Adobe
 * updater row, two-step confirm, dot flips to stopped, status bar confirms.
 */
export function LaunchPadDemo({ trigger = 0 }: { trigger?: number }) {
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
    timers.current.push(setTimeout(() => setPhase("highlight"), 50));
    timers.current.push(setTimeout(() => setPhase("confirm"), 550));
    timers.current.push(setTimeout(() => setPhase("stopped"), 1450));
    timers.current.push(setTimeout(() => setPhase("done"), 2150));
  };

  useEffect(() => {
    if (trigger > 0) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const afterConfirm = phase === "stopped" || phase === "done";

  const dotColor = (job: Job) => {
    if (job.name === TARGET) {
      if (phase === "confirm") return "bg-brutal-red";
      if (afterConfirm) return "bg-brutal-stone";
    }
    return job.running ? "bg-brutal-lime" : "bg-brutal-stone";
  };

  const label = (job: Job) =>
    job.name === TARGET && afterConfirm
      ? "stopped"
      : job.running
        ? "running"
        : "stopped";

  return (
    <div className="relative flex h-52 flex-col overflow-hidden bg-cream font-mono text-xs text-ink">
      <PlayHint played={started} />
      <div className="border-b-2 border-ink px-4 py-2 text-sm font-bold">
        LaunchPad · launchd jobs
      </div>

      {JOBS.map((job) => {
        const isTarget = job.name === TARGET;
        const flash = isTarget && phase !== "idle" && !afterConfirm;
        return (
          <div
            key={job.name}
            className={`flex items-center gap-2 border-b-2 border-ink px-4 py-1.5 transition-colors duration-300 ${flash ? "bg-brutal-yellow" : "bg-cream"}`}
          >
            <span
              className={`h-2 w-2 shrink-0 transition-colors duration-300 ${dotColor(job)}`}
            />
            <span className="truncate font-bold">{job.name}</span>
            {job.system && (
              <span className="shrink-0 border-2 border-ink bg-brutal-stone px-1.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                system
              </span>
            )}
            {isTarget && phase === "confirm" && (
              <span className="shrink-0 border-2 border-brutal-red px-1 text-[10px] font-bold text-brutal-red">
                stop? confirm
              </span>
            )}
            <span className="ml-auto shrink-0 text-ink/60">{label(job)}</span>
          </div>
        );
      })}

      <div
        className={`mt-auto px-4 pb-3 transition-all duration-300 ease-out ${phase === "done" ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        style={{ transitionDelay: phase === "done" ? "100ms" : "0ms" }}
      >
        <span className="border-2 border-ink bg-brutal-lime px-2 py-0.5 font-bold">
          ✓ stopped safely · system jobs locked
        </span>
      </div>
    </div>
  );
}
