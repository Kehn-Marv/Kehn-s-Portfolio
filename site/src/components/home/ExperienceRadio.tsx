"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Marquee } from "@/components/brutal/Marquee";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

type ShiftType = "FULL-TIME" | "PART-TIME" | "VOLUNTEER";

interface Station {
  /** Fake FM frequency label. */
  freq: string;
  org: string;
  /** Company site — omit while unknown. */
  url?: string;
  role: string;
  start: string;
  end: string;
  loc: string;
  type: ShiftType;
  current: boolean;
  bullets: string[];
}

/** bottom -> top on the dial = oldest -> newest (chronological by start date). */
const STATIONS: Station[] = [
  {
    freq: "88.1",
    org: "SAFENEST",
    url: "https://github.com/Kehn-Marv",
    role: "Founder · Blockchain Developer",
    start: "2025",
    end: "2025",
    loc: "Nigeria",
    type: "VOLUNTEER",
    current: false,
    bullets: [
      "Blockchain-powered escrow platform addressing real estate fraud in Nigeria",
      "Cardano smart contracts with multi-party verification workflow",
      "🏆 Third Place — Cardano Next Gen Hackathon",
      "First competitive hackathon — full lifecycle from idea to pitch",
    ],
  },
  {
    freq: "92.5",
    org: "UNIVERSITY FELLOWSHIP",
    role: "Media Head",
    start: "2025",
    end: "2025",
    loc: "UNN, Nigeria",
    type: "VOLUNTEER",
    current: false,
    bullets: [
      "Coordinated media-related activities and digital communication",
      "Supported event publicity and designed visual communication materials",
      "Strengthened leadership, organization, and team coordination skills",
      "Received Certificate of Service upon completion",
    ],
  },
  {
    freq: "96.9",
    org: "CHARTERHOUSE LAGOS",
    role: "IT Intern",
    start: "2026",
    end: "2026",
    loc: "Lagos, Nigeria",
    type: "FULL-TIME",
    current: false,
    bullets: [
      "Technical support, device onboarding, and software deployment across the organization",
      "Began developing an internal inventory management system for the IT department",
      "Strengthened skills in communication, teamwork, documentation, and accountability",
      "Continued building AI and backend projects independently after work hours",
    ],
  },
  {
    freq: "101.3",
    org: "HACKATHON BUILDER",
    url: "https://github.com/Kehn-Marv",
    role: "AI Engineer · Backend Engineer",
    start: "2025",
    end: "NOW",
    loc: "Nigeria",
    type: "PART-TIME",
    current: true,
    bullets: [
      "12+ hackathons across AI, blockchain, FinTech, and computer vision",
      "Built Pinguin (offline AI study companion), The Dispatch (autonomous AI newsroom), ReMorph (deepfake forensics)",
      "ScrowPay: AI-powered escrow with Google Gemini — Squad Hackathon 3.0",
      "Consistently served as backend engineer, AI engineer, and systems architect",
    ],
  },
  {
    freq: "105.7",
    org: "EDUCATIONAL AGENTIC SYSTEM",
    url: "https://github.com/Kehn-Marv",
    role: "Founder · AI Engineer · Systems Architect",
    start: "2026",
    end: "NOW",
    loc: "Nigeria",
    type: "FULL-TIME",
    current: true,
    bullets: [
      "Designing an agentic AI platform for personalized education with RAG and local-first AI",
      "Rust backend + Python AI services — edge-optimized for low-resource environments",
      "Multi-agent educational workflows with context-aware tutoring",
      "Combines lessons from Pinguin, The Dispatch, ReMorph, SafeNest, and ScrowPay",
    ],
  },
];

const TYPE_BG: Record<ShiftType, string> = {
  "FULL-TIME": "bg-brutal-yellow",
  "PART-TIME": "bg-brutal-cyan",
  VOLUNTEER: "bg-brutal-pink",
};

const N = STATIONS.length;
/** Needle runs 0..1. Stations sit at evenly spaced centers, inset from the ends. */
const PAD = 0.08;
const stationPos = (i: number) => PAD + (i / (N - 1)) * (1 - 2 * PAD);
const CENTERS = STATIONS.map((_, i) => stationPos(i));
const SPACING = (1 - 2 * PAD) / (N - 1);
/** Half-width of a station's band — deliberately narrower than the spacing so
    there is real dead air (full static) between stations. */
const BAND = 0.32 * SPACING;

/** Nearest station index + how strong the signal is at value v (1 = dead center). */
function readSignal(v: number) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < N; i += 1) {
    const d = Math.abs(v - CENTERS[i]);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  // strength eases from 1 at center to 0 at band edge, with a gentle curve so
  // it is easy to "lock" and hard to sit in ambiguous noise.
  const raw = 1 - bestDist / BAND;
  const strength = raw <= 0 ? 0 : Math.pow(raw, 0.6);
  return { index: best, strength, inBand: raw > 0 };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const LOCK_THRESHOLD = 0.72;

/** Physical end stops — the slider cannot be pushed past the scale. */
const NEEDLE_MIN = 0.04;
const NEEDLE_MAX = 0.96;
const clampNeedle = (v: number) =>
  Math.min(NEEDLE_MAX, Math.max(NEEDLE_MIN, v));

/** SVG feTurbulence static, encoded as a data URI background. */
const STATIC_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>` +
      `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/>` +
      `<feColorMatrix type='saturate' values='0'/>` +
      `<feComponentTransfer>` +
      `<feFuncR type='discrete' tableValues='0 0 1 1'/>` +
      `<feFuncG type='discrete' tableValues='0 0 1 1'/>` +
      `<feFuncB type='discrete' tableValues='0 0 1 1'/>` +
      `<feFuncA type='linear' slope='0' intercept='1'/>` +
      `</feComponentTransfer></filter>` +
      `<rect width='140' height='140' filter='url(#n)'/></svg>`,
  );

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-2 rounded-full border-2 border-ink bg-brutal-stone ${className}`}
    />
  );
}

export function ExperienceRadio() {
  const reduced = useReducedMotion();
  // Start locked on the newest station — no entry animation.
  const needle = useMotionValue(CENTERS[N - 1]);
  const [snapshot, setSnapshot] = useState(() => readSignal(CENTERS[N - 1]));
  const [sliderValue, setSliderValue] = useState(() =>
    Math.round(CENTERS[N - 1] * 100),
  );
  const [isVertical, setIsVertical] = useState(true);

  const dialRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // Keep a plain-state mirror of the signal so the panel + aria re-render.
  useEffect(() => {
    const unsub = needle.on("change", (v) => {
      setSnapshot(readSignal(v));
      setSliderValue(Math.round(v * 100));
    });
    return () => unsub();
  }, [needle]);

  // Track the actual axis so aria-orientation matches the Tailwind lg (1024px)
  // breakpoint: vertical dial at lg+, horizontal ruler below.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsVertical(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const knobRotate = useTransform(needle, (v) => v * 300 - 150);

  const { index, strength, inBand } = snapshot;
  const locked = inBand && strength >= LOCK_THRESHOLD;
  const station = STATIONS[index];

  // Noise opacity: fully static off-station, fades out as signal locks in.
  const noiseOpacity = useTransform(needle, (v) => {
    const s = readSignal(v);
    return clamp01(1 - s.strength * 1.15);
  });
  const contentOpacity = useTransform(needle, (v) => {
    const s = readSignal(v);
    return clamp01((s.strength - 0.35) / 0.5);
  });

  const settle = useCallback(
    (v: number) => {
      const s = readSignal(v);
      const target = s.inBand ? CENTERS[s.index] : v;
      if (reduced) {
        needle.set(target);
        return;
      }
      animate(needle, target, {
        type: "spring",
        stiffness: 260,
        damping: 26,
      });
    },
    [needle, reduced],
  );

  // ---- pointer tuning ----------------------------------------------------
  const valueFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = dialRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // Horizontal ruler below lg, vertical dial at lg+ (dial taller than wide).
    const vertical = r.height >= r.width;
    const frac = vertical
      ? 1 - (clientY - r.top) / r.height // top = 1 (newest)
      : (clientX - r.left) / r.width; // right = newest
    return clampNeedle(frac);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dialRef.current?.setPointerCapture?.(e.pointerId);
      draggingRef.current = true;
      const v = valueFromPointer(e.clientX, e.clientY);
      if (v != null) needle.set(v);
    },
    [needle, valueFromPointer],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const v = valueFromPointer(e.clientX, e.clientY);
      if (v != null) needle.set(v);
    },
    [needle, valueFromPointer],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      dialRef.current?.releasePointerCapture?.(e.pointerId);
      settle(needle.get());
    },
    [needle, settle],
  );

  // ---- keyboard ----------------------------------------------------------
  const tuneTo = useCallback(
    (i: number) => {
      const target = CENTERS[Math.min(N - 1, Math.max(0, i))];
      if (reduced) {
        needle.set(target);
        return;
      }
      animate(needle, target, { type: "spring", stiffness: 240, damping: 24 });
    },
    [needle, reduced],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const cur = readSignal(needle.get()).index;
      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
          e.preventDefault();
          tuneTo(cur + 1);
          break;
        case "ArrowDown":
        case "ArrowLeft":
          e.preventDefault();
          tuneTo(cur - 1);
          break;
        case "Home":
          e.preventDefault();
          tuneTo(0);
          break;
        case "End":
          e.preventDefault();
          tuneTo(N - 1);
          break;
        default:
      }
    },
    [needle, tuneTo],
  );

  const ariaValueText = locked
    ? `${station.freq} FM, ${station.org}, signal locked`
    : "static, keep tuning";

  // ---- tick marks --------------------------------------------------------
  const ticks = Array.from({ length: 41 }, (_, i) => i / 40);

  return (
    <section
      id="experience"
      className="texture-dots border-y-2 border-ink bg-cream"
    >
      <Marquee
        duration={22}
        className="border-b-2 border-ink bg-brutal-cyan py-3 font-mono text-sm font-bold uppercase tracking-[0.25em]"
      >
        <span className="px-4">
          experience ✷ on air ✷ experience ✷ on air ✷ experience ✷ on air ✷
        </span>
      </Marquee>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="relative">
          {/* feet */}
          <span
            aria-hidden
            className="absolute -bottom-3 left-10 h-4 w-14 border-2 border-ink bg-ink"
          />
          <span
            aria-hidden
            className="absolute -bottom-3 right-10 h-4 w-14 border-2 border-ink bg-ink"
          />

          {/* ---- outer device shell ---- */}
          <div className="relative z-10 border-2 border-ink bg-white p-4 shadow-brutal-lg sm:p-6">
          <Screw className="left-2 top-2" />
          <Screw className="right-2 top-2" />
          <Screw className="bottom-2 left-2" />
          <Screw className="bottom-2 right-2" />

          {/* nameplate + speaker vents */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="-rotate-1 border-2 border-ink bg-brutal-yellow px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.25em] shadow-brutal-sm">
              ✷ experience · FM
            </span>
            <div aria-hidden className="flex items-center gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className="h-4 w-1 rounded-full border-2 border-ink bg-brutal-stone"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            {/* ================= DIAL ================= */}
            <div className="lg:w-36 lg:flex-none">
              <div
                ref={dialRef}
                role="slider"
                tabIndex={0}
                aria-label="Experience tuner — tune to a station to read that role"
                aria-orientation={isVertical ? "vertical" : "horizontal"}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={sliderValue}
                aria-valuetext={ariaValueText}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ touchAction: "none" }}
                className="relative flex h-16 w-full cursor-pointer select-none flex-row-reverse border-2 border-ink bg-cream p-2 shadow-brutal-sm lg:h-[26.25rem] lg:w-full lg:flex-col"
              >
                {/* NOW / 2025 end labels */}
                <span className="pointer-events-none absolute right-1 top-1 font-mono text-[9px] font-bold tracking-[0.2em] text-ink/60 lg:left-1/2 lg:right-auto lg:-translate-x-1/2">
                  NOW
                </span>
                <span className="pointer-events-none absolute bottom-1 left-1 font-mono text-[9px] font-bold tracking-[0.2em] text-ink/60 lg:left-1/2 lg:-translate-x-1/2">
                  2025
                </span>

                {/* track with tick marks */}
                <div className="pointer-events-none relative mx-auto flex h-full w-full items-stretch">
                  {/* ticks */}
                  <div className="absolute inset-0 flex flex-row items-center justify-between px-4 lg:flex-col-reverse lg:px-0 lg:py-4">
                    {ticks.map((t, i) => {
                      const major = i % 5 === 0;
                      return (
                        <span
                          key={i}
                          className={`bg-ink/50 ${
                            major
                              ? "h-3 w-[2px] lg:h-[2px] lg:w-3"
                              : "h-1.5 w-px lg:h-px lg:w-1.5"
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* frequency scale labels (lg only) */}
                  <div className="pointer-events-none absolute inset-y-4 left-1 hidden flex-col justify-between lg:flex">
                    {[108, 104, 100, 96, 92, 88].map((f) => (
                      <span
                        key={f}
                        className="font-mono text-[8px] font-bold text-ink/40"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <span className="pointer-events-none absolute right-1 top-4 hidden font-mono text-[8px] font-bold text-ink/40 lg:block">
                    MHz
                  </span>

                  {/* center rail */}
                  <span className="absolute left-1/2 top-1/2 h-[2px] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 bg-ink/20 lg:h-[calc(100%-2rem)] lg:w-[2px]" />

                  {/* station markers (color = type chip). Horizontal axis on
                      mobile, vertical axis at lg+ — position swaps per axis. */}
                  {STATIONS.map((s, i) => (
                    <div
                      key={`m-${s.freq}`}
                      aria-hidden
                      className="absolute z-10 lg:hidden"
                      style={{
                        left: `${CENTERS[i] * 100}%`,
                        top: "50%",
                        transform: "translate(-50%,-50%)",
                      }}
                    >
                      <span
                        className={`block size-3 rounded-full border-2 border-ink ${TYPE_BG[s.type]}`}
                      />
                    </div>
                  ))}
                  {STATIONS.map((s, i) => (
                    <div
                      key={`mv-${s.freq}`}
                      aria-hidden
                      className="absolute z-10 hidden lg:block"
                      style={{
                        left: "50%",
                        top: `${(1 - CENTERS[i]) * 100}%`,
                        transform: "translate(-50%,-50%)",
                      }}
                    >
                      <span
                        className={`block size-3 rounded-full border-2 border-ink ${TYPE_BG[s.type]}`}
                      />
                    </div>
                  ))}

                  {/* the chunky needle */}
                  <motion.div
                    className="absolute z-20 lg:hidden"
                    style={{
                      left: useTransform(needle, (v) => `${v * 100}%`),
                      top: 0,
                      bottom: 0,
                      width: 0,
                    }}
                  >
                    <span className="absolute -top-1 left-1/2 h-[calc(100%+0.5rem)] w-[6px] -translate-x-1/2 bg-brutal-red shadow-brutal-xs">
                      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-brutal-red shadow-brutal-xs" />
                    </span>
                  </motion.div>
                  <motion.div
                    className="absolute z-20 hidden lg:block"
                    style={{
                      top: useTransform(needle, (v) => `${(1 - v) * 100}%`),
                      left: 0,
                      right: 0,
                      height: 0,
                    }}
                  >
                    <span className="absolute left-1/2 top-1/2 h-[6px] w-[calc(100%+0.5rem)] -translate-x-1/2 -translate-y-1/2 bg-brutal-red shadow-brutal-xs">
                      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-brutal-red shadow-brutal-xs" />
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* prev / next station buttons */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => tuneTo(readSignal(needle.get()).index - 1)}
                  aria-label="Previous station (older role)"
                  className="border-2 border-ink bg-white px-2 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-brutal-xs transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  ‹ prev
                </button>
                <button
                  type="button"
                  onClick={() => tuneTo(readSignal(needle.get()).index + 1)}
                  aria-label="Next station (newer role)"
                  className="border-2 border-ink bg-white px-2 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] shadow-brutal-xs transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  next ›
                </button>
              </div>
            </div>

            {/* ================= DISPLAY PANEL ================= */}
            <div className="relative min-h-[18.75rem] overflow-hidden border-2 border-ink bg-cream shadow-brutal-sm lg:flex-1">
              {/* static noise overlay */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
                style={{
                  opacity: noiseOpacity,
                  backgroundImage: `url("${STATIC_URI}")`,
                  backgroundSize: "140px 140px",
                }}
              >
                <div
                  className={`absolute -inset-[10%] ${reduced ? "" : "animate-[radioStatic_0.12s_steps(4)_infinite]"}`}
                  style={{
                    backgroundImage: `url("${STATIC_URI}")`,
                    backgroundSize: "95px 95px",
                    opacity: 0.55,
                  }}
                />
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 border-2 border-ink bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em]">
                  ▒ keep tuning… ▒
                </span>
              </motion.div>

              {/* live (tuned) content — crossfades in with signal */}
              <motion.div
                aria-live="polite"
                style={{ opacity: contentOpacity }}
                className="relative z-10 p-5"
              >
                {/* LCD readout row */}
                <div className="flex flex-wrap items-center gap-2 border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-brutal-lime">
                  <span>{station.freq} FM</span>
                  <span className="text-brutal-lime/50">·</span>
                  <span>SIGNAL LOCKED</span>
                  <span className="ml-auto text-brutal-lime/80">
                    {station.start} — {station.end}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] shadow-brutal-xs ${TYPE_BG[station.type]}`}
                  >
                    {station.type}
                  </span>
                  <span
                    className={`-rotate-2 border-2 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.2em] ${
                      station.current
                        ? "border-brutal-red bg-white text-brutal-red"
                        : "border-ink/50 bg-white/70 text-ink/50"
                    }`}
                  >
                    {station.current ? "CURRENT" : "PAST"}
                  </span>
                  <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
                    ⌖ {station.loc}
                  </span>
                </div>

                <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {station.url ? (
                    <a
                      href={station.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-[3px] underline-offset-[6px] transition-colors hover:bg-brutal-yellow"
                    >
                      {station.org}
                      <span className="ml-1 align-super text-base">↗</span>
                    </a>
                  ) : (
                    station.org
                  )}
                </h3>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-wider text-ink/70">
                  {station.role}
                </p>

                <ul className="mt-4 border-t-2 border-dashed border-ink/25 pt-3">
                  {station.bullets.map((b) => (
                    <li
                      key={b}
                      className="mt-1.5 font-mono text-[12px] font-bold leading-snug text-ink/75"
                    >
                      › {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* ---- bottom control row: tuning knob · grille · signal meter ---- */}
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t-2 border-ink pt-4">
            <div className="flex items-center gap-3">
              <motion.div
                aria-hidden
                style={{ rotate: knobRotate }}
                className="relative size-14 rounded-full border-2 border-ink bg-brutal-yellow shadow-brutal-sm"
              >
                <span className="absolute left-1/2 top-1 h-4 w-[3px] -translate-x-1/2 bg-ink" />
              </motion.div>
              <div className="flex flex-col font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink/60">
                <span>tuning</span>
                <span className="text-ink/40">88 — 108 MHz</span>
              </div>
            </div>

            {/* speaker grille */}
            <div
              aria-hidden
              className="hidden grid-cols-[repeat(14,minmax(0,auto))] gap-1.5 sm:grid"
            >
              {Array.from({ length: 42 }).map((_, i) => (
                <span key={i} className="size-1.5 rounded-full bg-ink/60" />
              ))}
            </div>

            {/* signal strength meter */}
            <div className="ml-auto flex items-end gap-1" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => {
                const lit = strength * 5 >= i + 1;
                return (
                  <span
                    key={i}
                    className={`w-2 border-2 border-ink transition-colors duration-75 ${
                      lit ? "bg-brutal-lime" : "bg-white"
                    }`}
                    style={{ height: `${10 + i * 4}px` }}
                  />
                );
              })}
              <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink/60">
                signal
              </span>
            </div>
          </div>
          </div>
        </div>

        {/* Full history in the DOM for screen readers & crawlers (visually hidden). */}
        <ul className="sr-only">
          {STATIONS.map((s) => (
            <li key={`seo-${s.freq}`}>
              {s.org} — {s.role} — {s.start} to {s.end} — {s.loc} — {s.type} —{" "}
              {s.current ? "current" : "past"}. {s.bullets.join(". ")}.
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes radioStatic {
          0% { transform: translate(0,0); }
          25% { transform: translate(-4%,3%); }
          50% { transform: translate(3%,-2%); }
          75% { transform: translate(-2%,4%); }
          100% { transform: translate(2%,-3%); }
        }
      `}</style>
    </section>
  );
}
