"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

interface StickerProps {
  src: string;
  alt?: string;
  size: number;
  rotate?: number;
  /** Enables a slow bobbing float. */
  float?: boolean;
  className?: string;
}

/** Die-cut sticker: transparent PNG with rotation and optional float. */
export function Sticker({
  src,
  alt = "",
  size,
  rotate = 0,
  float = false,
  className = "",
}: StickerProps) {
  const reduced = useReducedMotion();
  const shouldFloat = float && !reduced;

  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, height: size, rotate }}
      animate={shouldFloat ? { y: [0, -10, 0] } : undefined}
      transition={
        shouldFloat
          ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      <Image src={src} alt={alt} width={size} height={size} unoptimized />
    </motion.div>
  );
}
