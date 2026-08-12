import type { ReactNode } from "react";

interface PegItemProps {
  children: ReactNode;
  /** Placement inside the parent field, in percentages. */
  left: string;
  top: string;
  /** Optional custom offset for the push pin to account for transparent image padding. */
  pinTop?: string;
  /** Optional horizontal offset for asymmetrical artwork. */
  pinLeft?: string;
  className?: string;
  /** Optional CSS classes for the push pin colors (e.g. border and gradient stops) */
  pinColorClass?: string;
}

/**
 * One item hanging on the pegboard: a peg hook ring on top, the sticker
 * below. Hovering swings the sticker around the hook.
 * Below lg the item flows in the wall's wrap layout (left/top are ignored
 * by static positioning); at lg+ it scatters to its absolute spot.
 */
export function PegItem({
  children,
  left,
  top,
  pinTop = "-top-1",
  pinLeft = "0px",
  pinColorClass = "border-gray-800 from-gray-500 to-gray-900",
  className = "flex",
}: PegItemProps) {
  return (
    <div
      className={`group relative flex-col items-center hover:z-30 lg:absolute lg:left-[var(--peg-left)] lg:top-[var(--peg-top)] flex`}
      style={{ "--peg-left": left, "--peg-top": top } as React.CSSProperties}
    >


      {/* The Swinging Sticker */}
      <div className="origin-top group-hover:animate-swing pt-1">
        {children}
      </div>
    </div>
  );
}

/** Workshop pegboard wall: white panel, thick border, hole grid. */
export function Pegboard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative border-2 border-ink bg-white shadow-brutal-xl ${className}`}
    >
      {/* hole grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 [background-image:radial-gradient(color-mix(in_srgb,#141111_18%,transparent)_2.5px,transparent_2.5px)] [background-size:32px_32px]"
      />
      {children}
    </div>
  );
}
