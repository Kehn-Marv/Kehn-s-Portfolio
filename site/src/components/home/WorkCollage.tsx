import { Marquee } from "@/components/brutal/Marquee";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { Reveal } from "@/components/brutal/Reveal";
import { WorkCard, type DemoKey } from "@/components/home/WorkCard";

interface WorkWindow {
  title: string;
  label: string;
  sub: string;
  bodyClass: string;
  /** Key of the live product mini-demo rendered as the card body. */
  demo?: DemoKey;
  repo: string;
  /** Playful tilt, straightened on hover. */
  tilt: string;
  /** Overrides the default "github ↗" chrome link label. */
  hrefLabel?: string;
}

const windows: WorkWindow[] = [
  {
    title: "pinguin --study",
    label: "PINGUIN",
    sub: "Privacy-first offline AI study companion · Electron + FastAPI + RAG",
    bodyClass: "bg-brutal-lime",
    demo: "photon",
    repo: "https://github.com/Kehn-Marv/Pinguin",
    tilt: "-rotate-1",
  },
  {
    title: "dispatch.news",
    label: "THE DISPATCH",
    sub: "Autonomous AI newsroom · multi-stage editorial pipeline",
    bodyClass: "bg-brutal-cyan",
    demo: "nestease",
    repo: "https://github.com/Kehn-Marv/the-dispatch",
    tilt: "rotate-1",
  },
  {
    title: "remorph.forensics",
    label: "REMORPH",
    sub: "AI-powered deepfake attribution · EfficientNet + Grad-CAM",
    bodyClass: "bg-brutal-pink",
    demo: "launchpad",
    repo: "https://github.com/Kehn-Marv/Remorph",
    tilt: "rotate-[0.75deg]",
  },
  {
    title: "safenest.escrow",
    label: "SAFENEST",
    sub: "blockchain escrow for real estate · Cardano smart contracts",
    bodyClass: "bg-brutal-lavender",
    demo: "orchestrator",
    repo: "https://github.com/Kehn-Marv",
    tilt: "-rotate-[0.75deg]",
  },
  {
    title: "scrowpay.ai",
    label: "SCROWPAY",
    sub: "AI-powered escrow for P2P commerce · Gemini + Squad APIs",
    bodyClass: "bg-brutal-yellow",
    demo: "lumon",
    repo: "https://github.com/Kehn-Marv",
    tilt: "rotate-[0.5deg]",
  },
];

export function WorkCollage() {
  return (
    <section id="work" className="relative">
      <Marquee
        duration={22}
        className="border-b-2 border-ink bg-brutal-yellow py-3 font-mono text-sm font-bold uppercase tracking-[0.25em]"
      >
        <span className="px-4">
          selected work ✦ selected work ✦ selected work ✦ selected work ✦
        </span>
      </Marquee>

      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        {/* Desktop: 2×2 tilted grid */}
        <div className="hidden grid-cols-2 gap-x-12 gap-y-14 lg:grid">
          {windows.map((item, i) => {
            const isLastOdd =
              i === windows.length - 1 && windows.length % 2 === 1;
            return (
              <Reveal
                key={item.title}
                delay={i * 0.1}
                className={`${i % 2 === 1 ? "lg:mt-10" : ""} ${
                  isLastOdd ? "lg:col-span-2" : ""
                }`}
              >
                <div
                  className={isLastOdd ? "lg:mx-auto lg:w-[calc(50%-1.5rem)]" : ""}
                >
                  <WorkCard {...item} />
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Mobile: stacked */}
        <div className="flex flex-col gap-8 lg:hidden">
          {windows.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <WorkCard {...item} tilt={i % 2 === 0 ? "-rotate-1" : "rotate-1"} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 flex justify-center">
          <BrutalButton tone="white" size="lg" href="#">
            see all work ↗
          </BrutalButton>
        </Reveal>
      </div>
    </section>
  );
}
