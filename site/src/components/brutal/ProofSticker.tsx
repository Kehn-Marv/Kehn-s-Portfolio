"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface ProofStickerProps {
  children: ReactNode;
  receipt: string;
  href?: string;
  linkLabel?: string;
  rotate?: number;
  float?: boolean;
  side?: "top" | "bottom";
  className?: string;
}

const sideGapPx = 12;

const entranceY: Record<"top" | "bottom", number> = {
  top: 8,
  bottom: -8,
};

interface ReceiptCoords {
  left: number;
  anchorTop: number;
  anchorBottom: number;
}

/** Interactive sticker that reveals a mono receipt tooltip on hover or tap. */
export function ProofSticker({
  children,
  receipt,
  href,
  linkLabel = "see proof ↗",
  rotate = 0,
  float = false,
  side = "top",
  className = "",
}: ProofStickerProps) {
  const reduced = useReducedMotion();
  const receiptId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const hideHoverTimerRef = useRef<number | null>(null);
  const mounted = typeof document !== "undefined";
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [coords, setCoords] = useState<ReceiptCoords | null>(null);
  const open = hovered || pinned;
  const shouldFloat = float && !reduced;

  const clearHideHoverTimer = useCallback(() => {
    if (hideHoverTimerRef.current !== null) {
      window.clearTimeout(hideHoverTimerRef.current);
      hideHoverTimerRef.current = null;
    }
  }, []);

  const showHover = useCallback(() => {
    clearHideHoverTimer();
    setHovered(true);
  }, [clearHideHoverTimer]);

  const scheduleHideHover = useCallback(() => {
    clearHideHoverTimer();
    hideHoverTimerRef.current = window.setTimeout(() => {
      setHovered(false);
      hideHoverTimerRef.current = null;
    }, 120);
  }, [clearHideHoverTimer]);

  const updateCoords = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const group = anchor.closest(".group");
    const peg = group?.querySelector(".z-40");

    if (peg) {
      const pegRect = peg.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      setCoords({
        left: pegRect.left + pegRect.width / 2,
        anchorTop: pegRect.top,
        anchorBottom: anchorRect.bottom,
      });
      return;
    }

    const rect = anchor.getBoundingClientRect();
    setCoords({
      left: rect.left + rect.width / 2,
      anchorTop: rect.top,
      anchorBottom: rect.bottom,
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

  useEffect(() => () => clearHideHoverTimer(), [clearHideHoverTimer]);

  const handleClick = useCallback(() => {
    setPinned((prev) => !prev);
  }, []);

  const handleBlur = useCallback(() => {
    setPinned(false);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      setPinned(false);
    }
  }, []);

  const yOffset = entranceY[side];
  const springTransition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 26 };

  const initialState = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: yOffset, scale: 0.85, rotate: -4 };

  const visibleState = reduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1, rotate: -1 };

  const exitState = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: yOffset, scale: 0.85, rotate: -4 };

  const receiptStyle: CSSProperties | undefined = coords
    ? side === "top"
      ? {
          position: "fixed",
          left: coords.left,
          bottom: window.innerHeight - coords.anchorTop + sideGapPx,
          zIndex: 9999,
        }
      : {
          position: "fixed",
          left: coords.left,
          top: coords.anchorBottom + sideGapPx,
          zIndex: 9999,
        }
    : undefined;

  const receiptPortal =
    mounted ? (
      createPortal(
        <AnimatePresence>
          {open && coords ? (
            <motion.div
              id={receiptId}
              role="tooltip"
              className="fixed w-56 -translate-x-1/2 -rotate-1 border-2 border-ink bg-cream px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink"
              style={receiptStyle}
              initial={initialState}
              animate={visibleState}
              exit={exitState}
              transition={springTransition}
              onMouseEnter={showHover}
              onMouseLeave={scheduleHideHover}
            >
              {receipt}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block underline decoration-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  {linkLabel}
                </a>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )
    ) : null;

  return (
    <div
      className={`pointer-events-auto ${className}`}
      style={{ zIndex: open ? 40 : undefined }}
      onMouseEnter={showHover}
      onMouseLeave={scheduleHideHover}
    >
      <div ref={anchorRef} className="relative inline-block">
        <button
          type="button"
          aria-expanded={open}
          aria-describedby={open ? receiptId : undefined}
          onClick={handleClick}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="cursor-pointer appearance-none border-0 bg-transparent p-0"
        >
          <motion.span
            className="inline-block"
            style={{ rotate }}
            animate={shouldFloat ? { y: [0, -10, 0] } : undefined}
            transition={
              shouldFloat
                ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          >
            {children}
          </motion.span>
        </button>
      </div>
      {receiptPortal}
    </div>
  );
}
