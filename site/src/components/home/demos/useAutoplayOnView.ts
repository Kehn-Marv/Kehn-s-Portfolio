"use client";

import { useEffect, useRef } from "react";

/**
 * Plays a card demo once when it scrolls into view, then leaves it frozen on
 * its final frame. Hover replays are wired separately by the caller.
 */
export function useAutoplayOnView<T extends HTMLElement>(
  play: () => void,
  threshold = 0.35,
) {
  const ref = useRef<T | null>(null);
  const playRef = useRef(play);
  playRef.current = play;
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played.current) {
            played.current = true;
            playRef.current();
            observer.disconnect();
          }
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
