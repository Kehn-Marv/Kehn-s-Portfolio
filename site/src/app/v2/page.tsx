"use client";

import dynamic from "next/dynamic";
import { InspectOverlay } from "@/components/scene/InspectOverlay";

const SceneRoot = dynamic(
  () => import("@/components/scene/SceneRoot").then((m) => m.SceneRoot),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center bg-cream font-mono text-sm uppercase tracking-wider">
        loading scene…
      </div>
    ),
  }
);

export default function SceneV2Page() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-cream">
      <h1 className="sr-only">Egemonye Marvellous — Backend Engineering & AI Systems</h1>
      <SceneRoot />
      <InspectOverlay />
    </main>
  );
}
