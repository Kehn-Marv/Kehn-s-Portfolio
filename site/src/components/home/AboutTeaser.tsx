import Image from "next/image";
import { Chip } from "@/components/brutal/Chip";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { WindowCard } from "@/components/brutal/WindowCard";
import { Reveal } from "@/components/brutal/Reveal";

export function AboutTeaser() {
  return (
    <section id="about" className="border-y-2 border-ink bg-app-blue">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:py-28">
        <Reveal className="mx-auto w-full max-w-sm">
          <div className="-rotate-2">
            <WindowCard title="marvellous.png">
              <Image
                src="/assets/My Avatar.png"
                alt="Egemonye Marvellous — backend engineer and AI builder"
                width={600}
                height={600}
                className="h-auto w-full"
              />
            </WindowCard>
          </div>
        </Reveal>

        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <Chip tone="pink">about</Chip>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Builder, systems thinker, problem solver.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="max-w-lg text-lg leading-relaxed text-ink/80">
              Computer Engineering student at UNN, Nigeria. I build intelligent
              backend systems, AI pipelines, and privacy-first software.
              Specializing in Rust and Python for real-world problem solving.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <BrutalButton tone="lavender" size="lg" href="#">
              more about me →
            </BrutalButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
