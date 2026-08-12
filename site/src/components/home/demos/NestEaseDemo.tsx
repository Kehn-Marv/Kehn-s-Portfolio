"use client";

import { useEffect, useRef, useState } from "react";
import { PlayHint } from "./PlayHint";

/**
 * Live mini-demo of NestEase inside the work card: an SMS thread where the AI
 * agent asks a contractor for a quote, the contractor replies, the AI books
 * the repair. Plays once in view, replays on hover.
 */
export function NestEaseDemo({ trigger = 0 }: { trigger?: number }) {
  const [step, setStep] = useState(0);
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
    setStep(0);
    timers.current.push(setTimeout(() => setStep(1), 300));
    timers.current.push(setTimeout(() => setStep(2), 950));
    timers.current.push(setTimeout(() => setStep(3), 1550));
  };

  useEffect(() => {
    if (trigger > 0) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const bubble = (delay: number, shown: boolean, align: string) => ({
    className: `flex ${align} transition-all duration-300 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`,
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <div className="relative flex h-52 flex-col gap-2 overflow-hidden bg-cream p-4 font-mono text-xs">
      <PlayHint played={started} />
      <div className="flex items-center justify-between border-b-2 border-ink/10 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink/60">
        <span>SMS · contractor</span>
        <span>NestEase agent</span>
      </div>

      {/* AI opener — always visible */}
      <div className="flex justify-end">
        <div className="max-w-[85%] border-2 border-ink bg-brutal-cyan px-2.5 py-1.5 text-ink">
          Hi! Kitchen sink is leaking — can you quote the repair?
        </div>
      </div>

      {/* typing indicator, only while idle */}
      {step < 1 && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1 border-2 border-ink/30 bg-brutal-stone px-2.5 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/60" />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/60"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/60"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      {/* contractor reply */}
      <div {...bubble(0, step >= 1, "justify-start")}>
        <div className="max-w-[85%] border-2 border-ink bg-brutal-stone px-2.5 py-1.5 text-ink">
          Can do this afternoon, $180
        </div>
      </div>

      {/* AI confirmation */}
      <div {...bubble(0, step >= 2, "justify-end")}>
        <div className="max-w-[85%] border-2 border-ink bg-brutal-cyan px-2.5 py-1.5 text-ink">
          Booked for 2pm — owner approved $180.
        </div>
      </div>

      {/* status chip */}
      <div {...bubble(0, step >= 3, "justify-center")}>
        <div className="border-2 border-ink bg-brutal-lime px-2 py-0.5 text-[10px] font-bold text-ink">
          ✓ repair confirmed
        </div>
      </div>
    </div>
  );
}
