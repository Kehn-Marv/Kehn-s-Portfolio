"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Chip } from "@/components/brutal/Chip";
import { Marquee } from "@/components/brutal/Marquee";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { Reveal } from "@/components/brutal/Reveal";
import { CursorLogoSticker } from "@/components/stickers/CursorLogoSticker";
import { AgentSquadSticker } from "@/components/stickers/AgentSquadSticker";

const lookingFor = [
  "backend engineering roles with real impact",
  "AI infrastructure and systems challenges",
  "teams that value depth over hype",
  "nigeria, remote, or anywhere ambitious",
];

const socials = [
  { label: "github", href: "https://github.com/Kehn-Marv" },
  { label: "linkedin", href: "https://www.linkedin.com/in/egemonye-marvellous" },
  { label: "x/twitter", href: "https://x.com/KehnMarv" },
];

const springPop = { type: "spring", stiffness: 480, damping: 24 } as const;

interface CheckItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  reduced: boolean;
}

function CheckItem({ label, checked, onToggle, reduced }: CheckItemProps) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="group flex w-full cursor-pointer items-center gap-3 text-left"
      >
        <motion.span
          className={`flex size-7 shrink-0 items-center justify-center border-2 border-ink shadow-brutal-xs transition-colors duration-100 ${
            checked ? "bg-brutal-lime" : "bg-white group-hover:bg-brutal-lime/40"
          }`}
          whileTap={reduced ? undefined : { scale: 0.8 }}
        >
          <AnimatePresence>
            {checked ? (
              <motion.span
                initial={reduced ? { opacity: 0 } : { scale: 2.2, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                transition={springPop}
                className="text-base font-bold"
              >
                ✓
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.span>
        <span className="relative isolate px-1 text-lg font-medium">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 -z-10 origin-left bg-brutal-lime/50"
            initial={false}
            animate={{ scaleX: checked ? 1 : 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
            }
          />
          {label}
        </span>
      </button>
    </li>
  );
}

export function Connect() {
  const reduced = useReducedMotion() ?? false;
  const [checked, setChecked] = useState<boolean[]>(() =>
    lookingFor.map(() => false)
  );

  const count = checked.filter(Boolean).length;
  const allDone = count === lookingFor.length;

  const toggle = (index: number) =>
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)));

  return (
    <section id="connect" className="texture-dots">
      <Marquee
        duration={22}
        className="border-y-2 border-ink bg-brutal-pink py-3 font-mono text-sm font-bold uppercase tracking-[0.25em]"
      >
        <span className="px-4">
          let&apos;s connect ✦ let&apos;s connect ✦ let&apos;s connect ✦
          let&apos;s connect ✦
        </span>
      </Marquee>
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <Reveal>
          <BrutalCard shadow="xl" className="grid gap-12 p-8 md:p-12 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-6">
              <Chip tone="lime">what I look for</Chip>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Let&apos;s build something real.
              </h2>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                nodding along? tick the boxes ↓
              </p>
              <ul className="flex w-full flex-col gap-4">
                {lookingFor.map((item, i) => (
                  <CheckItem
                    key={item}
                    label={item}
                    checked={checked[i]}
                    onToggle={() => toggle(i)}
                    reduced={reduced}
                  />
                ))}
              </ul>
            </div>

            <div
              aria-live="polite"
              className="flex min-h-[300px] flex-col items-center justify-center border-ink lg:border-l-2 lg:pl-12"
            >
              <AnimatePresence mode="wait">
                {!allDone ? (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-5"
                  >
                    <div className="flex flex-col items-center gap-1 border-2 border-dashed border-ink/40 bg-white/60 px-14 py-10 text-center">
                      <motion.span
                        key={count}
                        initial={reduced ? undefined : { scale: 1.45 }}
                        animate={{ scale: 1 }}
                        transition={springPop}
                        className="font-mono text-5xl font-bold tracking-tight"
                      >
                        {count}/{lookingFor.length}
                      </motion.span>
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                        checked
                      </span>
                    </div>
                    <span className="max-w-[240px] text-center font-mono text-xs uppercase tracking-wider text-muted">
                      something unlocks when you relate to all of it
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="unlocked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center gap-8"
                  >
                    <div className="relative">
                      <motion.div
                        initial={
                          reduced ? { opacity: 0 } : { scale: 1.8, rotate: -12, opacity: 0 }
                        }
                        animate={{ scale: 1, rotate: -1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 17,
                          delay: 0.05,
                        }}
                      >
                        <BrutalButton tone="pink" size="xl" href="mailto:kehnmarv@gmail.com">
                          let&apos;s chat! ↗
                        </BrutalButton>
                      </motion.div>

                      <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-14 -top-12"
                        initial={reduced ? { opacity: 0 } : { scale: 0, rotate: -60 }}
                        animate={
                          reduced ? { opacity: 1 } : { scale: 1, rotate: -10 }
                        }
                        transition={{ ...springPop, delay: 0.25 }}
                      >
                        <Image src="/assets/sticker-bucket-hat.png" alt="" width={76} height={76} unoptimized />
                      </motion.div>
                      <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-12 -top-10"
                        initial={reduced ? { opacity: 0 } : { scale: 0, rotate: 60 }}
                        animate={reduced ? { opacity: 1 } : { scale: 1, rotate: 12 }}
                        transition={{ ...springPop, delay: 0.35 }}
                      >
                        <CursorLogoSticker size={64} />
                      </motion.div>
                      <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-6 -right-20"
                        initial={reduced ? { opacity: 0 } : { scale: 0, rotate: -40 }}
                        animate={reduced ? { opacity: 1 } : { scale: 1, rotate: 8 }}
                        transition={{ ...springPop, delay: 0.45 }}
                      >
                        <AgentSquadSticker size={30} />
                      </motion.div>
                    </div>

                    <motion.div
                      className="flex flex-wrap justify-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {socials.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          className="border-2 border-ink bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest shadow-brutal-xs transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 hover:shadow-brutal-sm"
                        >
                          {social.label}
                        </a>
                      ))}
                    </motion.div>

                    <motion.p
                      className="text-center font-mono text-xs uppercase tracking-wider text-muted"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 }}
                    >
                      4/4 — usually fast, always building something
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </BrutalCard>
        </Reveal>

      </div>
    </section>
  );
}
