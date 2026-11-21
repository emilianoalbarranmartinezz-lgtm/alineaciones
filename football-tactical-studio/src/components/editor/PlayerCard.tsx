'use client';

import type { CSSProperties, PointerEvent } from 'react';
import { cn } from '@/lib/cn';
import type { Player, PositionGroup } from '@/lib/types';
import { PlayerAvatar } from './PlayerAvatar';

export const POSITION_TAG: Record<PositionGroup, { label: string; cls: string }> = {
  GK: { label: 'POR', cls: 'bg-amber-400 text-black' },
  DF: { label: 'DEF', cls: 'bg-sky-500 text-white' },
  MF: { label: 'MED', cls: 'bg-emerald-500 text-black' },
  FW: { label: 'DEL', cls: 'bg-rose-500 text-white' },
};

interface Props {
  player: Player;
  number: number;
  label: string;
  width: number;
  source: 'pitch' | 'bench' | 'squad';
  group?: PositionGroup;
  isCaptain?: boolean;
  selected?: boolean;
  dragging?: boolean;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
}

const fs = (w: number, k: number, min: number) => Math.max(min, Math.round(w * k * 10) / 10);

export function PlayerCard({
  player,
  number,
  label,
  width,
  source,
  group,
  isCaptain,
  selected,
  dragging,
  onPointerDown,
  style,
}: Props) {
  const tag = POSITION_TAG[group ?? player.position];
  return (
    <div
      data-player-id={player.id}
      data-source={source}
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
      style={{ width, ...style }}
      className={cn(
        'card-touch relative select-none overflow-hidden rounded-md border bg-ink-900/95 shadow-lg shadow-black/60',
        'cursor-grab active:cursor-grabbing',
        selected ? 'border-white ring-2 ring-white/70' : 'border-white/25',
        dragging && 'scale-105 opacity-90',
      )}
    >
      <div className="relative aspect-[1/1.05] bg-ink-700">
        <PlayerAvatar key={player.photoUrl ?? 'none'} src={player.photoUrl} alt={player.name} />
        <span
          className="absolute left-0 top-0 rounded-br bg-black/80 px-[0.3em] font-display font-bold leading-tight text-white"
          style={{ fontSize: fs(width, 0.22, 10) }}
        >
          {number}
        </span>
        {isCaptain && (
          <span
            className="absolute right-0.5 top-0.5 grid place-items-center rounded-full bg-amber-400 font-bold text-black"
            style={{ width: fs(width, 0.24, 12), height: fs(width, 0.24, 12), fontSize: fs(width, 0.15, 8) }}
            title="Capitán"
          >
            C
          </span>
        )}
      </div>
      <div className="px-1 pb-0.5 pt-px text-center leading-tight">
        <div className="truncate font-semibold text-white" style={{ fontSize: fs(width, 0.17, 9) }}>
          {label}
        </div>
        <div
          className={cn('mx-auto w-fit rounded-sm px-1 font-bold tracking-wide', tag.cls)}
          style={{ fontSize: fs(width, 0.12, 7) }}
        >
          {tag.label}
        </div>
      </div>
    </div>
  );
}
