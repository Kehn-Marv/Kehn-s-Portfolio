import Image from "next/image";
import { ProofSticker } from "@/components/brutal/ProofSticker";
import { Reveal } from "@/components/brutal/Reveal";
import { Pegboard, PegItem } from "@/components/home/Pegboard";
import { GitHubSticker } from "@/components/home/GitHubSticker";
import { BellCurveSticker } from "@/components/stickers/BellCurveSticker";
import { CursorLogoSticker } from "@/components/stickers/CursorLogoSticker";
import { UBCBadgeSticker } from "@/components/stickers/UBCBadgeSticker";
import { YCStamp } from "@/components/stickers/YCStamp";
import { AgentSquadSticker } from "@/components/stickers/AgentSquadSticker";

const LUMA_URL = "https://github.com/Kehn-Marv";

const pegItems = [
  {
    key: "resume",
    left: "3%",
    top: "8%",
    pinTop: "-19px",
    pinLeft: "2px",
    children: (
      <a
        href="/assets/Egemonye_Marvellous_Resume.pdf"
        download="Egemonye_Marvellous_Resume.pdf"
        aria-label="Download resume (PDF)"
      >
        <ProofSticker
          rotate={0}
          side="top"
          receipt="RESUME.PDF — the formal version. Click to download."
        >
          <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl transition-transform hover:scale-105">
            <Image
              src="/assets/cv.png"
              alt="CV"
              width={100}
              height={100}
              unoptimized
              className="scale-[2]"
            />
          </div>
        </ProofSticker>
      </a>
    ),
  },
  {
    key: "yc",
    left: "13%",
    top: "57%",
    pinTop: "-20px",
    children: (
      <ProofSticker
        rotate={0}
        side="top"
        receipt="🏆 Third Place — Cardano Next Gen Hackathon with SafeNest."
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl">
          <Image
            src="/assets/3rd place.png"
            alt="3rd Place Cardano Hackathon"
            width={100}
            height={100}
            unoptimized
            className="scale-150"
          />
        </div>
      </ProofSticker>
    ),
  },
  {
    key: "github",
    left: "83%",
    top: "8%",
    pinTop: "-7px",
    children: (
      <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl">
        <GitHubSticker />
      </div>
    ),
  },
  {
    key: "rust-crab",
    left: "63%",
    top: "8%",
    pinTop: "0px",
    className: "hidden sm:flex",
    children: (
      <ProofSticker
        rotate={0}
        side="top"
        receipt="Rust — the language I'm mastering for high-performance backends."
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl">
          <Image
            src="/assets/Rust Crab (Ferris).png"
            alt="Rust Crab"
            width={100}
            height={100}
            unoptimized
            className="scale-[1.4]"
          />
        </div>
      </ProofSticker>
    ),
  },
  {
    key: "unn",
    left: "43%",
    top: "8%",
    pinTop: "-15px",
    children: (
      <ProofSticker
        rotate={0}
        side="top"
        receipt="UNN — B.Eng Computer Engineering, class of 2026."
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl">
          <Image
            src="/assets/UNN badge.png"
            alt="UNN Badge"
            width={100}
            height={100}
            unoptimized
            className="scale-[2]"
          />
        </div>
      </ProofSticker>
    ),
  },
  {
    key: "lagos",
    left: "53%",
    top: "57%",
    pinTop: "-26px",
    children: (
      <ProofSticker
        rotate={0}
        side="top"
        receipt="Lagos, Nigeria — powered by curiosity and UTC+1."
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl">
          <Image
            src="/assets/lagos.png"
            alt="Lagos"
            width={100}
            height={100}
            unoptimized
            className="scale-[1.3]"
          />
        </div>
      </ProofSticker>
    ),
  },
  {
    key: "bell-curve",
    left: "33%",
    top: "57%",
    className: "hidden md:flex",
    children: (
      <ProofSticker
        rotate={0}
        side="top"
        receipt="Systems before syntax — understanding architecture outlasts memorizing APIs."
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl">
          <Image
            src="/assets/graph.png"
            alt="Graph"
            width={100}
            height={100}
            unoptimized
            className="scale-[1.8]"
          />
        </div>
      </ProofSticker>
    ),
  },
  {
    key: "bucket-hat",
    left: "23%",
    top: "8%",
    pinTop: "-35px",
    pinLeft: "-4px",
    children: (
      <ProofSticker
        rotate={0}
        side="top"
        receipt="UNIFORM: curiosity. Systems thinker — always building."
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
          <Image
            src="/assets/sticker-bucket-hat.png"
            alt=""
            width={100}
            height={100}
            unoptimized
            className="scale-[2.5]"
          />
        </div>
      </ProofSticker>
    ),
  },
  {
    key: "agent-squad",
    left: "73%",
    top: "57%",
    pinTop: "-33px",
    children: (
      <ProofSticker
        rotate={0}
        side="top"
        receipt="12+ hackathons competed in — each one taught something new."
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center drop-shadow-xl">
          <Image
            src="/assets/devvy.png"
            alt="Devvy"
            width={100}
            height={100}
            unoptimized
            className="scale-[1.5]"
          />
        </div>
      </ProofSticker>
    ),
  },
];

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-2 rounded-full border-2 border-ink bg-brutal-stone ${className}`}
    />
  );
}

export function Hero() {
  return (
    <section id="top" className="texture-dots relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:pb-28 lg:pt-28">
        <Reveal delay={0.15}>
          <Pegboard>
            <div className="flex flex-col gap-8 p-5 sm:p-8 lg:gap-10 lg:p-10">
              {/* Top: framed portrait + nameplate */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch lg:gap-10">
                {/* portrait hung on the wall */}
                <div className="flex flex-none flex-col items-center">
                  <div className="h-full">
                    <div className="relative flex h-full w-[200px] flex-col border-2 border-ink bg-cream p-4 sm:min-h-full sm:w-[220px]">
                      {/* Subtle Background Pattern */}
                      <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 1px 1px, black 1px, transparent 0)",
                          backgroundSize: "16px 16px",
                        }}
                      />
                      <Screw className="left-2 top-2" />
                      <Screw className="right-2 top-2" />
                      <Screw className="bottom-2 left-2" />
                      <Screw className="bottom-2 right-2" />

                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex w-full items-center justify-center border-2 border-ink bg-white p-2">
                          <Image
                            src="/assets/My Avatar.png"
                            alt="Egemonye Marvellous"
                            width={160}
                            height={160}
                            unoptimized
                            className="bg-white object-cover"
                          />
                        </div>

                        <div className="mt-4 flex flex-grow flex-col justify-end border-t-2 border-ink/10 pt-4">
                          <div className="flex w-full items-end justify-between">
                            <div className="flex flex-col">
                              <span className="font-mono text-[8px] font-bold uppercase text-ink/40">
                                AUTH CODE
                              </span>
                              <span className="font-mono text-[10px] font-bold tracking-widest text-ink/80">
                                #8F2A1B
                              </span>
                            </div>
                            {/* Simple CSS Barcode */}
                            <div className="flex h-6 items-end gap-[2px] opacity-70">
                              <div className="h-full w-1 bg-ink"></div>
                              <div className="h-full w-0.5 bg-ink"></div>
                              <div className="h-5 w-1 bg-ink"></div>
                              <div className="h-full w-1.5 bg-ink"></div>
                              <div className="h-6 w-0.5 bg-ink"></div>
                              <div className="h-4 w-1 bg-ink"></div>
                              <div className="h-full w-0.5 bg-ink"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative w-full overflow-hidden border-2 border-ink bg-cream p-6 shadow-brutal sm:p-8">
                  {/* Subtle Background Pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, black 1px, transparent 0)",
                      backgroundSize: "16px 16px",
                    }}
                  />

                  <Screw className="left-2 top-2" />
                  <Screw className="right-2 top-2" />
                  <Screw className="bottom-2 left-2" />
                  <Screw className="bottom-2 right-2" />

                  <div className="relative z-10 flex h-full flex-col gap-6 sm:gap-8">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-ink/10 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center bg-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
                          ✷ PASS
                        </span>
                        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">
                          CLASS OF 2026
                        </p>
                      </div>
                      <p className="hidden font-mono text-[10px] tracking-widest text-ink/30 sm:block">
                        ID_8F2A1B
                      </p>
                    </div>

                    {/* Main Name */}
                    <div>
                      <h1 className="text-4xl font-black tracking-tighter text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
                        EGEMONYE MARVELLOUS
                      </h1>
                    </div>

                    {/* Footer / Specs */}
                    <div className="flex flex-col gap-4 border-t-2 border-ink/10 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <p className="max-w-[420px] font-mono text-xs font-bold uppercase leading-relaxed tracking-wider text-ink/80">
                        I architect intelligent backend systems &amp; AI
                        pipelines that solve complex real-world problems.
                      </p>
                      <div className="flex flex-col gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 sm:text-right">
                        <p>LAGOS, NIGERIA · UTC+1</p>
                        <p>12+ HACKATHONS SHIPPED</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Below: the proof wall */}
              <div className="relative mt-8 rounded-2xl border-2 border-dashed border-ink/30 pb-8 lg:h-[22rem] lg:pb-0">
                {/* Transparent Background to blend with Pegboard */}
                <div className="absolute inset-0 z-0 overflow-hidden rounded-[13px] bg-white/40">
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>

                <span className="absolute -top-4 left-8 z-10 flex items-center gap-2 border-2 border-ink bg-brutal-yellow px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(20,17,17,1)]">
                  <span className="size-2 rounded-full bg-ink" />
                  proof of work
                </span>
                
                <div className="relative z-20 flex flex-wrap items-start justify-center gap-x-10 gap-y-10 pt-14 lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-10 lg:block lg:pt-0">
                  {pegItems.map(({ key, ...item }) => (
                    <PegItem key={key} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </Pegboard>
        </Reveal>
      </div>
    </section>
  );
}
