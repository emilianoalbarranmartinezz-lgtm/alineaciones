'use client';

import { cn } from '@/lib/cn';
import type { Coach, Player } from '@/lib/types';
import { DefaultAvatar, PlayerAvatar } from './PlayerAvatar';
import { PlayerCard } from './PlayerCard';
import type { StartDrag } from './use-card-drag';

interface Props {
  players: Player[];
  numberOf: (p: Player) => number;
  labelOf: (p: Player) => string;
  selectedId: string | null;
  coach: Coach | null;
  activeId: string | null;
  overBench: boolean;
  onStartDrag: StartDrag;
}

export function CoachCard({ coach }: { coach: Coach | null }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-ink-800 p-2 sm:w-56">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-ink-700">
        {coach?.photoUrl ? <PlayerAvatar src={coach.photoUrl} alt={coach.name} /> : <DefaultAvatar />}
      </div>
      <div className="min-w-0 text-xs leading-snug">
        <p className="text-zinc-400">Director técnico</p>
        <p className="truncate text-sm font-semibold text-white">{coach?.name ?? 'No disponible'}</p>
        <p className="truncate text-zinc-400">Nacionalidad: {coach?.nationality ?? 'No disponible'}</p>
        <p className="truncate text-zinc-400">Equipo: {coach?.teamName ?? 'No disponible'}</p>
      </div>
    </div>
  );
}

export function Bench({ players, numberOf, labelOf, selectedId, coach, activeId, overBench, onStartDrag }: Props) {
  return (
    <section className="flex flex-col gap-3 sm:flex-row">
      <div
        data-dropzone="bench"
        className={cn(
          'min-h-[132px] flex-1 rounded-lg border border-dashed p-3 transition-colors',
          overBench ? 'border-accent bg-accent/10' : 'border-white/15 bg-ink-800/60',
        )}
      >
        <h3 className="mb-2 font-display text-sm font-semibold text-zinc-200">
          Suplentes <span className="text-zinc-500">({players.length})</span>
        </h3>
        {players.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Banquillo vacío. Arrastra aquí un titular o un jugador de la plantilla.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                number={numberOf(p)}
                label={labelOf(p)}
                width={64}
                source="bench"
                selected={selectedId === p.id}
                dragging={activeId === p.id}
                onPointerDown={(e) => onStartDrag(e, p.id, 'bench')}
              />
            ))}
          </div>
        )}
      </div>
      <CoachCard coach={coach} />
    </section>
  );
}
