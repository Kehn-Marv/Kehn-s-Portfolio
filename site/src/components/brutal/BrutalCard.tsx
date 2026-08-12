import type { ReactNode } from "react";

export type CardTone =
  | "white"
  | "cream"
  | "yellow"
  | "pink"
  | "lavender"
  | "cyan"
  | "lime"
  | "blue";

const toneClasses: Record<CardTone, string> = {
  white: "bg-white",
  cream: "bg-cream",
  yellow: "bg-brutal-yellow",
  pink: "bg-brutal-pink",
  lavender: "bg-brutal-lavender",
  cyan: "bg-brutal-cyan",
  lime: "bg-brutal-lime",
  blue: "bg-app-blue",
};

export type CardShadow = "none" | "sm" | "md" | "lg" | "xl";

const shadowClasses: Record<CardShadow, string> = {
  none: "",
  sm: "shadow-brutal-sm",
  md: "shadow-brutal",
  lg: "shadow-brutal-lg",
  xl: "shadow-brutal-xl",
};

interface BrutalCardProps {
  children: ReactNode;
  tone?: CardTone;
  shadow?: CardShadow;
  rounded?: boolean;
  hoverLift?: boolean;
  className?: string;
}

export function BrutalCard({
  children,
  tone = "white",
  shadow = "md",
  rounded = false,
  hoverLift = false,
  className = "",
}: BrutalCardProps) {
  const lift = hoverLift
    ? "transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:rotate-0 hover:shadow-brutal-lg"
    : "";
  return (
    <div
      className={`border-2 border-ink ${toneClasses[tone]} ${shadowClasses[shadow]} ${
        rounded ? "rounded-[8px]" : ""
      } ${lift} ${className}`}
    >
      {children}
    </div>
  );
}
