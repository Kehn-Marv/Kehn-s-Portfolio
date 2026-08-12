import { BrutalCard, type CardTone } from "@/components/brutal/BrutalCard";
import { Chip } from "@/components/brutal/Chip";
import { Reveal } from "@/components/brutal/Reveal";

interface Belief {
  index: string;
  tone: CardTone;
  title: string;
  note: string;
  rotate: string;
}

const beliefs: Belief[] = [
  {
    index: "01",
    tone: "yellow",
    title: "High agency beats permission.",
    note: "start before you feel ready",
    rotate: "-rotate-1",
  },
  {
    index: "02",
    tone: "pink",
    title: "Systems over heroics.",
    note: "durable beats dramatic",
    rotate: "rotate-1",
  },
  {
    index: "03",
    tone: "lavender",
    title: "Ship it, then polish it.",
    note: "reality is the only reviewer",
    rotate: "-rotate-[0.5deg]",
  },
];

export function Beliefs() {
  return (
    <section className="border-y-2 border-ink bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <Reveal className="mb-12 flex flex-col items-start gap-4">
          <Chip tone="cyan">beliefs</Chip>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            3 things I believe
          </h2>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3">
          {beliefs.map((belief, i) => (
            <Reveal key={belief.index} delay={i * 0.12}>
              <BrutalCard
                tone={belief.tone}
                hoverLift
                className={`flex h-full flex-col gap-10 p-6 ${belief.rotate}`}
              >
                <span className="font-mono text-sm font-bold">{belief.index}</span>
                <div className="mt-auto flex flex-col gap-2">
                  <p className="text-2xl font-bold leading-snug">{belief.title}</p>
                  <p className="font-mono text-xs uppercase tracking-wider text-ink/70">
                    ↳ {belief.note}
                  </p>
                </div>
              </BrutalCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
