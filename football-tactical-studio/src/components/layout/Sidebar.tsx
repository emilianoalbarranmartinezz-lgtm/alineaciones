'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { NAV } from './nav';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-accent/15 text-accent' : 'text-zinc-300 hover:bg-ink-700 hover:text-white',
            )}
          >
            <Icon size={18} />
            <span className="flex-1">{item.label}</span>
            {!item.ready && <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] text-zinc-400">Fase {item.phase}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
