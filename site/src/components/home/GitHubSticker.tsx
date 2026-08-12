"use client";

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const USER = "Kehn-Marv";
const WEEKS = 26;

interface Contribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_COLORS = [
  "rgba(20, 17, 17, 0.08)",
  "rgba(169, 216, 119, 0.45)",
  "rgba(169, 216, 119, 0.75)",
  "#a9d877",
  "#141111",
];

function GitHubMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  );
}

/**
 * GitHub pegboard sticker. Hovering reveals a panel with the real
 * contribution heatmap and follower count (cali.so-style).
 */
export function GitHubSticker() {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<Contribution[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const mounted = typeof document !== "undefined";

  const updateCoords = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setCoords({
      left: rect.left + rect.width / 2,
      top: rect.top,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setDays(data.contributions.slice(-WEEKS * 7));
        setTotal(data.total?.lastYear ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const weeks: Contribution[][] = [];
  if (days) {
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
  }

  return (
    <div
      ref={anchorRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={`https://github.com/${USER}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Marvellous on GitHub — contribution graph on hover"
        className="flex size-[100px] items-center justify-center transition-transform hover:-translate-y-0.5"
      >
        <Image src="/assets/github.png" alt="GitHub" width={100} height={100} unoptimized />
      </a>

      {mounted && open && coords && createPortal(
        <div 
          className="animate-pop-in fixed z-[9999] w-max max-w-[320px] -translate-x-1/2 -rotate-1 border-2 border-ink bg-cream p-3 pointer-events-none"
          style={{
            left: coords.left,
            bottom: window.innerHeight - coords.top + 12,
          }}
        >
          {weeks.length > 0 ? (
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className="animate-cell-in flex flex-col gap-[3px]"
                  style={{ animationDelay: `${80 + wi * 18}ms` }}
                >
                  {week.map((day) => (
                    <span
                      key={day.date}
                      className="size-[8px]"
                      style={{ backgroundColor: LEVEL_COLORS[day.level] }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
              loading graph…
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-4 border-t-2 border-ink/10 pt-2">
            <p className="font-mono text-[11px] uppercase tracking-wider">
              {total !== null
                ? `${total.toLocaleString()} contributions`
                : "github"}
            </p>
            <span className="text-ink">
              <GitHubMark size={18} />
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
