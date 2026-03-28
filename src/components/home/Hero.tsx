export function Hero() {
  return (
    <section className="relative w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-orange/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-yellow/10 rounded-full blur-[100px] -z-10" />
      
      <div className="container px-4">
        <div className="inline-flex items-center rounded-full border border-surface-border bg-surface2/50 backdrop-blur px-3 py-1 text-xs font-medium text-muted mb-8">
          No sign-up &middot; No limits &middot; No watermarks
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto bg-gradient-to-r from-accent-orange to-accent-yellow bg-clip-text text-transparent">
          Every tool you need to work with PDFs natively
        </h1>
        
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto">
          Merge, split, compress, and edit your PDFs 100% free. 
          Everything runs entirely in your browser — your files never leave your device.
        </p>
      </div>
    </section>
  );
}
