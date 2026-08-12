/**
 * Status chip in a demo's bottom-right corner inviting the first hover;
 * disappears for good once the demo has played.
 */
export function PlayHint({ played }: { played: boolean }) {
  if (played) return null;
  return (
    <span className="absolute bottom-2 right-2 z-10 animate-pulse border-2 border-ink bg-brutal-yellow px-1.5 py-0.5 font-mono text-[10px] font-bold lowercase tracking-wider text-ink">
      ▶ hover to run
    </span>
  );
}
