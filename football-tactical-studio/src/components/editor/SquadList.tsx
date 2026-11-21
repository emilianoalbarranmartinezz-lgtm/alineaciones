'use client';

import { GripVertical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { PositionGroup } from '@/lib/types';
import { useEditorStore } from '@/store/editor-store';
import { PlayerAvatar } from './PlayerAvatar';
import { POSITION_TAG } from './PlayerCard';
import type { StartDrag } from './use-card-drag';

const FILTERS: Array<{ id: PositionGroup | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'Todos' },
  { id: 'GK', label: 'POR' },
  { id: 'DF', label: 'DEF' },
  { id: 'MF', label: 'MED' },
  { id: 'FW', label: 'DEL' },
];

export function SquadList({ onStartDrag }: { onStartDrag: StartDrag }) {
  const { team, pitch, bench, overrides, selectedId, addToPitch, sendToBench, removeFromLineup, select } =
    useEditorStore();
  const [q, setQ] = useState('');
  const [pos, setPos] = useState<PositionGroup | 'ALL'>('ALL');
  const [sort, setSort] = useState<'number' | 'name'>('number');
  if (!team) return null;

  const onPitch = new Set(pitch.map((e) => e.playerId));
  const onBench = new Set(bench);
  const list = team.squad
    .filter((p) => (pos === 'ALL' || p.position === pos) && `${p.name} ${p.shortName}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) =>
      sort === 'name'
        ? a.shortName.localeCompare(b.shortName, 'es')
        : (overrides[a.id]?.number ?? a.number) - (overrides[b.id]?.number ?? b.number),
    );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar en la plantilla"
          aria-label="Buscar en la plantilla"
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm placeholder:text-zinc-500"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'number' | 'name')}
          aria-label="Ordenar"
          className="rounded-md border border-white/10 bg-ink-800 px-2 text-sm"
        >
          <option value="number">Dorsal</option>
          <option value="name">Nombre</option>
          <option disabled>Valoración (Fase 2)</option>
        </select>
      </div>
      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setPos(f.id)}
            aria-pressed={pos === f.id}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              pos === f.id ? 'bg-accent text-black' : 'bg-ink-700 text-zinc-300 hover:bg-ink-600',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
        {list.length === 0 && <li className="text-xs text-zinc-500">Ningún jugador coincide con el filtro.</li>}
        {list.map((p) => {
          const placed = onPitch.has(p.id) || onBench.has(p.id);
          const status = onPitch.has(p.id) ? 'En cancha' : onBench.has(p.id) ? 'Banquillo' : 'Libre';
          const tag = POSITION_TAG[p.position];
          return (
            <li
              key={p.id}
              onClick={() => select(p.id)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border p-1.5',
                selectedId === p.id ? 'border-white/70 bg-ink-700' : 'border-white/10 bg-ink-800',
              )}
            >
              {placed ? (
                <span className="w-5" />
              ) : (
                <span
                  data-player-id={p.id}
                  data-source="squad"
                  title="Arrastra a la cancha o al banquillo"
                  onPointerDown={(e) => onStartDrag(e, p.id, 'squad')}
                  onClick={(e) => e.stopPropagation()}
                  className="card-touch grid h-8 w-5 cursor-grab place-items-center text-zinc-400"
                >
                  <GripVertical size={16} />
                </span>
              )}
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-ink-700">
                <PlayerAvatar key={p.photoUrl ?? 'none'} src={p.photoUrl} alt={p.name} />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-white">
                  <span className="mr-1 font-display text-zinc-400">{overrides[p.id]?.number ?? p.number}</span>
                  {overrides[p.id]?.shortName ?? p.shortName}
                </p>
                <p className="text-[11px] text-zinc-500">
                  <span className={cn('mr-1 rounded-sm px-1 font-bold', tag.cls)}>{tag.label}</span>
                  {status}
                </p>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {!onPitch.has(p.id) && (
                  <button
                    onClick={() => addToPitch(p.id)}
                    className="rounded bg-accent px-2 py-1 text-[11px] font-semibold text-black"
                  >
                    Campo
                  </button>
                )}
                {!onBench.has(p.id) && (
                  <button
                    onClick={() => sendToBench(p.id)}
                    className="rounded bg-ink-600 px-2 py-1 text-[11px] font-semibold text-white"
                  >
                    Banca
                  </button>
                )}
                {placed && (
                  <button
                    onClick={() => removeFromLineup(p.id)}
                    title="Quitar de la alineación"
                    className="rounded bg-ink-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-rose-600 hover:text-white"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
