"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  className?: string;
}

const initialCopiesPerGroup = 4;

/**
 * Infinite horizontal marquee.
 *
 * Each animation half contains several copies and is at least one viewport
 * wide. Duplicating that complete group makes the -50% reset seamless even
 * when browser zoom-out creates a viewport wider than a single text copy.
 */
export function Marquee({ children, duration = 30, className = "" }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  const [copiesPerGroup, setCopiesPerGroup] = useState(initialCopiesPerGroup);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const firstItem = firstItemRef.current;
    if (!container || !firstItem) return;

    const fitCopiesToViewport = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const itemWidth = firstItem.getBoundingClientRect().width;
      if (containerWidth <= 0 || itemWidth <= 0) return;

      setCopiesPerGroup(
        Math.max(2, Math.ceil(containerWidth / itemWidth) + 1),
      );
    };

    fitCopiesToViewport();
    const observer = new ResizeObserver(fitCopiesToViewport);
    observer.observe(container);
    observer.observe(firstItem);

    return () => observer.disconnect();
  }, []);

  const group = (hidden: boolean) => (
    <div
      className="flex min-w-[100vw] shrink-0 items-center"
      data-marquee-group
      aria-hidden={hidden || undefined}
    >
      {Array.from({ length: copiesPerGroup }, (_, index) => (
        <div
          className="flex shrink-0 items-center"
          data-marquee-item
          aria-hidden={!hidden && index > 0 ? true : undefined}
          key={index}
          ref={!hidden && index === 0 ? firstItemRef : undefined}
        >
          {children}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`w-full max-w-full overflow-hidden ${className}`}
      ref={containerRef}
    >
      <div
        className="flex w-max animate-marquee"
        data-marquee-track
        style={
          {
            "--marquee-duration": `${duration * copiesPerGroup}s`,
          } as React.CSSProperties
        }
      >
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
