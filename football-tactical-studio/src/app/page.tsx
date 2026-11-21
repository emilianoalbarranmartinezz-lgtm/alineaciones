import Link from 'next/link';

const PHASES = [
  { n: 1, name: 'Interfaz y estructura', done: true },
  { n: 2, name: 'Buscador y datos reales (API-Football)', done: false },
  { n: 3, name: 'Editor táctico', done: true },
  { n: 4, name: 'Estadísticas de jugadores', done: false },
  { n: 5, name: 'Comparadores', done: false },
  { n: 6, name: 'Exportación PNG y guardado', done: false },
  { n: 7, name: 'Pruebas', done: false },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <header>
        <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
          Arma la alineación. Mueve cada ficha donde quieras.
        </h1>
        <p className="mt-3 max-w-xl text-zinc-300">
          El editor táctico ya funciona con arrastre libre, formaciones predeterminadas y propias, y banquillo. Por ahora
          usa equipos de demostración; los datos reales llegan en la Fase 2.
        </p>
        <Link href="/editor" className="mt-5 inline-block rounded-lg bg-accent px-5 py-2.5 font-semibold text-black hover:brightness-110">
          Abrir el editor táctico
        </Link>
      </header>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-white">Estado del proyecto</h2>
        <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-ink-900">
          {PHASES.map((p) => (
            <li key={p.n} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-zinc-200">
                Fase {p.n}: {p.name}
              </span>
              <span className={p.done ? 'font-semibold text-accent' : 'text-zinc-500'}>{p.done ? 'Listo' : 'Pendiente'}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
