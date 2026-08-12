"use client";

import { useState } from "react";
import { WindowCard } from "@/components/brutal/WindowCard";
import { PhotonDemo } from "@/components/home/demos/PhotonDemo";
import { NestEaseDemo } from "@/components/home/demos/NestEaseDemo";
import { LaunchPadDemo } from "@/components/home/demos/LaunchPadDemo";
import { OrchestratorDemo } from "@/components/home/demos/OrchestratorDemo";
import { LumonDemo } from "@/components/home/demos/LumonDemo";

const DEMOS = {
  photon: PhotonDemo,
  nestease: NestEaseDemo,
  launchpad: LaunchPadDemo,
  orchestrator: OrchestratorDemo,
  lumon: LumonDemo,
} as const;

export type DemoKey = keyof typeof DEMOS;

interface WorkCardProps {
  title: string;
  label: string;
  sub: string;
  bodyClass: string;
  repo: string;
  demo?: DemoKey;
  tilt: string;
  hrefLabel?: string;
}

/** One work-collage window with a hover-to-run product demo body. */
export function WorkCard({
  title,
  label,
  sub,
  bodyClass,
  repo,
  demo,
  tilt,
  hrefLabel,
}: WorkCardProps) {
  const Demo = demo ? DEMOS[demo] : undefined;
  // Bumped on every card hover; demos replay on each bump.
  const [trigger, setTrigger] = useState(0);

  return (
    <div
      className={`${tilt} transition-transform duration-150 ease-out hover:-translate-y-1.5 hover:rotate-0`}
      onMouseEnter={() => setTrigger((t) => t + 1)}
    >
      <WindowCard title={title} href={repo} hrefLabel={hrefLabel}>
        <div className={bodyClass}>
          {Demo && (
            <div className="border-b-2 border-ink">
              <Demo trigger={trigger} />
            </div>
          )}
          <div
            className={`flex flex-col items-start gap-1 p-5 ${Demo ? "py-4" : "h-44 justify-end"}`}
          >
            <span className="text-2xl font-bold tracking-tight">{label}</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink/70">
              {sub}
            </span>
          </div>
        </div>
      </WindowCard>
    </div>
  );
}
