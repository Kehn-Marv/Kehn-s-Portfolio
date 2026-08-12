import type { ReactNode } from "react";

export type ButtonTone =
  | "white"
  | "yellow"
  | "pink"
  | "cyan"
  | "lavender"
  | "lime";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

const toneClasses: Record<ButtonTone, string> = {
  white: "bg-white",
  yellow: "bg-brutal-yellow",
  pink: "bg-brutal-pink",
  cyan: "bg-brutal-cyan",
  lavender: "bg-brutal-lavender",
  lime: "bg-brutal-lime",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
  xl: "px-9 py-4 text-xl md:px-12 md:py-6 md:text-3xl",
};

const baseClasses =
  "inline-flex select-none items-center justify-center gap-2 border-2 border-ink font-display font-bold text-ink " +
  "shadow-brutal transition-[transform,box-shadow] duration-100 ease-out " +
  "hover:-translate-y-0.5 hover:shadow-brutal-lg " +
  "active:translate-x-[3px] active:translate-y-[3px] active:shadow-brutal-xs";

interface BrutalButtonProps {
  children: ReactNode;
  tone?: ButtonTone;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  className?: string;
}

export function BrutalButton({
  children,
  tone = "white",
  size = "md",
  href,
  external = false,
  className = "",
}: BrutalButtonProps) {
  const classes = `${baseClasses} ${toneClasses[tone]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}
