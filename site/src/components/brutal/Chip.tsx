import type { ReactNode } from "react";

export type ChipTone =
  | "white"
  | "yellow"
  | "pink"
  | "lavender"
  | "cyan"
  | "lime";

const toneClasses: Record<ChipTone, string> = {
  white: "bg-white",
  yellow: "bg-brutal-yellow",
  pink: "bg-brutal-pink",
  lavender: "bg-brutal-lavender",
  cyan: "bg-brutal-cyan",
  lime: "bg-brutal-lime",
};

interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
}

export function Chip({ children, tone = "white", className = "" }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-ink shadow-brutal-sm ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
