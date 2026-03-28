import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/80 border-b border-surface-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <span className="text-2xl font-bold tracking-tight text-white">
            PDF<span className="text-accent-orange">Craft</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-orange bg-accent-orange/10 rounded-full border border-accent-orange/20">
            100% Free
          </span>
        </div>
      </div>
    </header>
  );
}
