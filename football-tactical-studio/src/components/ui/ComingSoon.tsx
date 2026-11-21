export function ComingSoon({ title, phase, children }: { title: string; phase: number; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-ink-900 p-6">
      <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
      <p className="mt-1 text-sm text-amber-300">Aún no implementado · se desarrolla en la Fase {phase}</p>
      <div className="mt-4 space-y-2 text-sm text-zinc-300">{children}</div>
    </section>
  );
}
