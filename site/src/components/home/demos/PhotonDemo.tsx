"use client";

import { useEffect, useRef, useState } from "react";
import { PlayHint } from "./PlayHint";

const QUESTION = `"why is the sky blue?"`;

type Phase = "idle" | "typing" | "thinking" | "answer";

/**
 * Live mini-demo of Photon inside the work card: an ink terminal that sits
 * idle with a blinking cursor, and on hover types a question and prints the
 * structured answer.
 */
export function PhotonDemo({ trigger = 0 }: { trigger?: number }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState(0);
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
    setTyped(0);
    const t0 = 50;
    timers.current.push(setTimeout(() => setPhase("typing"), t0));
    for (let i = 1; i <= QUESTION.length; i++) {
      timers.current.push(setTimeout(() => setTyped(i), t0 + i * 26));
    }
    timers.current.push(
      setTimeout(() => setPhase("thinking"), t0 + QUESTION.length * 26 + 150),
    );
    timers.current.push(
      setTimeout(
        () => setPhase("answer"),
        t0 + QUESTION.length * 26 + 650,
      ),
    );
  };

  useEffect(() => {
    if (trigger > 0) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const answerBlock = (delay: number, shown: boolean) => ({
    className: `transition-all duration-300 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`,
    style: { transitionDelay: `${delay}ms` },
  });

  const showAnswer = phase === "answer";

  return (
    <div className="relative flex h-52 flex-col gap-3 bg-ink p-5 font-mono text-sm">
      <PlayHint played={started} />
      <div className="flex items-center gap-2 font-bold text-cream">
        <span className="text-brutal-lime">❯</span>
        <span>
          ptn ask{" "}
          <span className="font-normal text-cream/90">
            {QUESTION.slice(0, typed)}
          </span>
        </span>
        <span className="h-4 w-2 animate-pulse bg-brutal-lime" />
      </div>

      {phase === "thinking" && (
        <div className="text-cream/60">thinking…</div>
      )}

      <div {...answerBlock(0, showAnswer)}>
        <div className="border-2 border-cream/20 bg-brutal-yellow px-3 py-2 font-bold text-ink">
          Sunlight scatters off air molecules — blue scatters most.
        </div>
      </div>
      <ul className="flex flex-col gap-1.5 text-cream/85">
        <li {...answerBlock(120, showAnswer)}>
          <span className="text-brutal-lime">1.</span> short wavelengths
          scatter ~10× more
        </li>
        <li {...answerBlock(240, showAnswer)}>
          <span className="text-brutal-lime">2.</span> sunsets go red for the
          same reason ✦
        </li>
      </ul>
    </div>
  );
}
