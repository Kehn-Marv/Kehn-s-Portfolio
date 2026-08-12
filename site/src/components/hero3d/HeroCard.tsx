"use client";

import dynamic from "next/dynamic";

function CardFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rotate-2 border-2 border-ink bg-cream px-10 py-16 text-center shadow-brutal-xl">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
          ✷ builder pass
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight">EGEMONYE MARVELLOUS</p>
      </div>
    </div>
  );
}

const LanyardCard = dynamic(
  () => import("./LanyardCard").then((mod) => mod.LanyardCard),
  { ssr: false, loading: () => <CardFallback /> }
);

export function HeroCard() {
  return (
    <div
      role="img"
      aria-label="Interactive 3D name badge on a lanyard — click to flip it, grab to swing it"
      className="h-[480px] w-full sm:h-[560px] lg:h-[620px]"
    >
      <LanyardCard />
    </div>
  );
}
