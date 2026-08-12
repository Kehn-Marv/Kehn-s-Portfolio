import { Marquee } from "@/components/brutal/Marquee";

export function FooterTicker() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-cream">
      <Marquee duration={28} className="py-4 font-mono text-sm font-bold uppercase tracking-[0.25em]">
        <span className="px-4">
          ♪ keep learning, keep building ✦ built in nigeria ✦ 12+
          hackathons ✦ neo brutal since 2026 ✦
        </span>
      </Marquee>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cream/20 px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-cream/70">
        <span>© 2026 Egemonye Marvellous</span>
        <span>kehn marv — backend engineering · ai systems</span>
      </div>
    </footer>
  );
}
