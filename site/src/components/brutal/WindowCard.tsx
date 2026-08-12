import type { ReactNode } from "react";

interface WindowCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** External link rendered as a chrome button on the title bar's right. */
  href?: string;
  hrefLabel?: string;
}

/** Browser-window chrome: title bar with traffic-light dots + mono title. */
export function WindowCard({
  title,
  children,
  className = "",
  href,
  hrefLabel = "github ↗",
}: WindowCardProps) {
  return (
    <div className={`border-2 border-ink bg-white shadow-brutal-lg ${className}`}>
      <div className="flex items-center gap-2 border-b-2 border-ink bg-cream px-3 py-2">
        <span className="size-3 rounded-full border-2 border-ink bg-brutal-red" />
        <span className="size-3 rounded-full border-2 border-ink bg-brutal-yellow" />
        <span className="size-3 rounded-full border-2 border-ink bg-brutal-lime" />
        <span className="ml-2 truncate font-mono text-xs font-bold uppercase tracking-wider">
          {title}
        </span>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="ml-auto border-2 border-ink bg-white px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:bg-brutal-yellow"
          >
            {hrefLabel}
          </a>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
