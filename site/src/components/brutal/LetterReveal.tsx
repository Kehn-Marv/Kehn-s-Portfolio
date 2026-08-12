"use client";

import { motion, useReducedMotion } from "motion/react";

interface LetterRevealProps {
  text: string;
  delay?: number;
  className?: string;
}

/** Per-character staggered reveal for short lines. Wraps only at word boundaries. */
export function LetterReveal({ text, delay = 0, className = "" }: LetterRevealProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  let letterIndex = 0;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {Array.from(word).map((letter) => {
            const index = letterIndex++;
            return (
              <motion.span
                key={index}
                aria-hidden="true"
                className="inline-block"
                initial={{ opacity: 0, y: "0.6em", rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  duration: 0.4,
                  delay: delay + index * 0.035,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIdx < words.length - 1 ? <span aria-hidden="true">{"\u00A0"}</span> : null}
        </span>
      ))}
    </span>
  );
}
