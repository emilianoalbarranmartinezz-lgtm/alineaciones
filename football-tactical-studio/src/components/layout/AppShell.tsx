'use client';

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <rect x="2" y="3" width="20" height="18" rx="2" fill="#16803c" stroke="#fff" strokeWidth="1.4" />
        <line x1="12" y1="3" x2="12" y2="21" stroke="#fff" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.2" />
      </svg>
      Football Tactical Studio
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-ink-900 lg:block">
        <div className="flex h-14 items-center px-4">
          <Logo />
        </div>
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button className="absolute inset-0 bg-black/60" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-white/10 bg-ink-900">
            <div className="flex h-14 items-center justify-between px-4">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/10 bg-ink-950/90 px-4 backdrop-blur">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <div className="lg:hidden">
          <span className="font-display font-bold text-white">FTS</span>
        </div>
        <label className="relative hidden max-w-md flex-1 sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            disabled
            aria-label="Buscador general (disponible en la Fase 2)"
            placeholder="Buscar clubes y selecciones (Fase 2)"
            className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-ink-800 py-1.5 pl-9 pr-3 text-sm placeholder:text-zinc-600"
          />
        </label>
        <select
          disabled
          aria-label="Temporada (disponible en la Fase 2)"
          className="ml-auto cursor-not-allowed rounded-lg border border-white/10 bg-ink-800 px-2 py-1.5 text-sm text-zinc-500"
        >
          <option>Temporada (Fase 2)</option>
        </select>
      </header>

      <main className="mx-auto w-full max-w-[1500px] p-4 lg:p-6">{children}</main>
    </div>
  );
}
