const items = [
  { label: "experience", href: "#experience" },
  { label: "work", href: "#work" },
  { label: "connect", href: "#connect" },
];

export function Nav() {
  return (
    <nav className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-8 rounded-full bg-white/40 px-6 py-3 backdrop-blur-md border border-white/50 shadow-lg ring-1 ring-black/5">
        <a
          href="#top"
          aria-label="Back to top"
          className="text-lg font-bold transition-transform hover:scale-110"
        >
          ツ
        </a>
        <div className="flex items-center gap-6">
          {items.map((item) => (
            <a 
              key={item.href} 
              href={item.href} 
              className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70 transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
