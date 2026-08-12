"use client";

import { useEffect } from "react";
import { useSceneStore } from "./sceneStore";
import { getItemDef } from "./items/itemRegistry";

export function InspectOverlay() {
  const mode = useSceneStore((s) => s.mode);
  const activeItemId = useSceneStore((s) => s.activeItemId);
  const endInspect = useSceneStore((s) => s.endInspect);

  useEffect(() => {
    if (mode !== "inspect") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") endInspect();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, endInspect]);

  if (mode !== "inspect" || !activeItemId) return null;
  const def = getItemDef(activeItemId);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center">
      <div className="mt-6 border-2 border-ink bg-brutal-yellow px-4 py-1 font-mono text-sm font-bold uppercase tracking-wider shadow-brutal-sm">
        {def.label}
      </div>
      <button
        type="button"
        autoFocus
        onClick={endInspect}
        className="pointer-events-auto absolute right-6 top-6 border-2 border-ink bg-white px-4 py-2 font-mono text-sm font-bold uppercase shadow-brutal transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 hover:shadow-brutal-lg"
      >
        close [esc]
      </button>
    </div>
  );
}
