import { Reveal } from "@/components/brutal/Reveal";

type ShiftType = "FULL-TIME" | "PART-TIME" | "VOLUNTEER";

interface Shift {
  org: string;
  role: string;
  dates: string;
  loc: string;
  current: boolean;
  type: ShiftType;
  rotate: string;
  punches: number[];
  bullets: string[];
}

const jobs: Shift[] = [
  {
    org: "EDUCATIONAL AGENTIC SYSTEM",
    role: "Founder · AI Engineer",
    dates: "2026 — NOW",
    loc: "Nigeria",
    current: true,
    type: "FULL-TIME",
    rotate: "-rotate-[1.5deg]",
    punches: [1, 0, 1, 1, 0, 1, 0, 1],
    bullets: [
      "Multi-agent workflows for personalized education",
      "Rust backend + Python AI services edge-optimized",
    ],
  },
  {
    org: "CHARTERHOUSE LAGOS",
    role: "IT Intern",
    dates: "2026 — 2026",
    loc: "Lagos, Nigeria",
    current: false,
    type: "FULL-TIME",
    rotate: "rotate-[1deg]",
    punches: [0, 1, 1, 0, 1, 0, 1, 1],
    bullets: [
      "Technical support and software deployment",
      "Began developing internal inventory management system",
    ],
  },
  {
    org: "UNIVERSITY FELLOWSHIP",
    role: "Media Head",
    dates: "2025 — 2025",
    loc: "UNN, Nigeria",
    current: false,
    type: "FULL-TIME",
    rotate: "-rotate-[1deg]",
    punches: [1, 1, 0, 1, 0, 0, 1, 0],
    bullets: [
      "Coordinated media activities and digital communication",
      "Designed visual materials and supported publicity",
    ],
  },
];

const sideShifts: Shift[] = [
  {
    org: "HACKATHON BUILDER",
    role: "AI / Backend Engineer",
    dates: "2025 — NOW",
    loc: "Nigeria",
    current: true,
    type: "PART-TIME",
    rotate: "rotate-[2deg]",
    punches: [1, 0, 0, 1, 1, 0, 1, 0],
    bullets: [
      "12+ hackathons across AI, blockchain, and FinTech",
      "Built Pinguin, The Dispatch, ReMorph, SafeNest",
    ],
  },
  {
    org: "SAFENEST",
    role: "Founder · Blockchain Dev",
    dates: "2025 — 2025",
    loc: "Nigeria",
    current: false,
    type: "VOLUNTEER",
    rotate: "-rotate-[2deg]",
    punches: [0, 1, 0, 1, 0, 1, 1, 0],
    bullets: ["🏆 3rd Place — Cardano Next Gen Hackathon"],
  },
];

const bandTone: Record<ShiftType, string> = {
  "FULL-TIME": "bg-brutal-yellow",
  "PART-TIME": "bg-brutal-cyan",
  VOLUNTEER: "bg-brutal-pink",
};

function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <article
      className={`absolute inset-x-2 top-0 z-10 h-[290px] overflow-hidden border-2 border-ink bg-white shadow-brutal-sm transition-transform duration-300 ease-out group-hover:-translate-y-16 ${shift.rotate}`}
    >
      {/* shift-type band */}
      <header
        className={`flex items-center justify-between border-b-2 border-ink px-3 py-1.5 ${bandTone[shift.type]}`}
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          {shift.type}
        </span>
        <span
          className={`-rotate-3 border-2 px-1 font-mono text-[9px] font-bold tracking-[0.15em] ${
            shift.current
              ? "border-brutal-red bg-white text-brutal-red"
              : "border-ink/60 bg-white/70 text-ink/60"
          }`}
        >
          {shift.current ? "CURRENT" : "PAST"}
        </span>
      </header>

      <div className="px-4 py-3">
        <h3 className="text-lg font-bold tracking-tight">{shift.org}</h3>
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/70">
          {shift.role}
        </p>
        <p className="mt-1 font-mono text-[10px] font-bold tracking-[0.15em] text-ink/50">
          {shift.dates} · {shift.loc}
        </p>

        {/* punch row */}
        <div className="mt-3 flex items-center gap-1.5" aria-hidden>
          {shift.punches.map((p, i) => (
            <span
              key={i}
              className={`size-2 rounded-full border-2 border-ink ${
                p ? "bg-ink" : "bg-white"
              }`}
            />
          ))}
          <span className="ml-auto font-mono text-[9px] font-bold tracking-[0.2em] text-ink/40">
            PUNCHED
          </span>
        </div>

        <ul className="mt-3 border-t-2 border-dashed border-ink/25 pt-2">
          {shift.bullets.map((b) => (
            <li
              key={b}
              className="mt-1 font-mono text-[11px] font-bold leading-snug text-ink/70"
            >
              · {b}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function SlotCell({ shift, slot }: { shift: Shift; slot: number }) {
  return (
    <div className="group relative h-[330px] hover:z-30">
      <ShiftCard shift={shift} />
      {/* slot pocket the card is tucked into */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-24 border-2 border-ink bg-brutal-stone shadow-brutal">
        <span
          aria-hidden
          className="absolute inset-x-2 top-1.5 border-t-2 border-ink/30"
        />
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold tracking-[0.3em] text-ink/50">
          SLOT {String(slot).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export function ExperienceTimecards() {
  return (
    <section id="experience" className="border-y-2 border-ink">
      {/* section ticker band, echoing the work section */}
      <div
        aria-hidden
        className="overflow-hidden whitespace-nowrap border-b-2 border-ink bg-brutal-cyan py-3 font-mono text-sm font-bold uppercase tracking-[0.25em]"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="px-4">
            experience ✷ shifts logged
          </span>
        ))}
      </div>

      <div className="texture-dots">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          {/* full-time row */}
          <Reveal>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((shift, i) => (
                <SlotCell key={shift.org} shift={shift} slot={i + 1} />
              ))}
            </div>
          </Reveal>

          {/* side quests row */}
          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-col items-center gap-4">
              <span className="border-2 border-ink bg-cream px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] shadow-brutal-xs">
                meanwhile, after hours ↓
              </span>
              <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
                {sideShifts.map((shift, i) => (
                  <SlotCell key={shift.org} shift={shift} slot={i + 4} />
                ))}
              </div>
            </div>
          </Reveal>

          <p className="mt-10 text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink/50">
            pull a card to inspect · full resume on request
          </p>
        </div>
      </div>
    </section>
  );
}
