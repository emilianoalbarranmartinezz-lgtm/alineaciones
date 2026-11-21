'use client';

import { useEditorStore } from '@/store/editor-store';
import { clamp } from '@/lib/geometry';
import { POSITION_TAG } from './PlayerCard';
import { PlayerAvatar } from './PlayerAvatar';
import { cn } from '@/lib/cn';

function Row({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/5 py-1.5 text-sm">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="text-right text-white">{value ?? 'No disponible'}</dd>
    </div>
  );
}

export function PlayerPanel() {
  const {
    team, selectedId, pitch, bench, captainId, goalkeeperId, overrides,
    setOverride, toggleCaptain, toggleGoalkeeper, addToPitch, sendToBench, removeFromLineup,
  } = useEditorStore();

  const player = team?.squad.find((p) => p.id === selectedId);
  if (!team || !player) {
    return (
      <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-zinc-500">
        Toca un jugador en la cancha, el banquillo o la plantilla para ver su información y editar su tarjeta.
      </p>
    );
  }

  const onPitch = pitch.some((e) => e.playerId === player.id);
  const onBench = bench.includes(player.id);
  const ov = overrides[player.id] ?? {};
  const number = ov.number ?? player.number;
  const tag = POSITION_TAG[player.position];
  const duplicate = [...pitch.map((e) => e.playerId), ...bench].some((id) => {
    if (id === player.id) return false;
    const other = team.squad.find((p) => p.id === id);
    return other ? (overrides[id]?.number ?? other.number) === number : false;
  });

  const btn = 'rounded-md px-3 py-1.5 text-sm font-semibold';

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-700">
          <PlayerAvatar key={player.photoUrl ?? 'none'} src={player.photoUrl} alt={player.name} />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-tight text-white">{player.name}</h3>
          <p className="mt-1 text-xs text-zinc-400">
            <span className={cn('mr-1 rounded-sm px-1 font-bold', tag.cls)}>{tag.label}</span>
            {onPitch ? 'En cancha' : onBench ? 'Banquillo' : 'Libre'}
            {captainId === player.id && ' · Capitán'}
            {goalkeeperId === player.id && ' · Portero'}
          </p>
          {player.source === 'demo' && (
            <p className="mt-1 text-xs text-amber-400">Jugador ficticio de demostración</p>
          )}
        </div>
      </div>

      <dl>
        <Row label="Dorsal oficial" value={player.number} />
        <Row label="Nacionalidad" value={player.nationality} />
        <Row label="Edad" value={player.age} />
        <Row label="Altura" value={player.heightCm ? `${player.heightCm} cm` : null} />
        <Row label="Valoración oficial" value={player.rating} />
      </dl>

      <section className="space-y-2 rounded-lg bg-ink-800 p-3">
        <h4 className="text-sm font-semibold text-zinc-200">Editar tarjeta</h4>
        <div className="grid grid-cols-[84px_1fr] gap-2">
          <label className="text-xs text-zinc-400">
            Dorsal
            <input
              key={`n-${player.id}-${number}`}
              type="number"
              min={0}
              max={99}
              defaultValue={number}
              onBlur={(e) => {
                const v = e.currentTarget.value;
                setOverride(player.id, { number: v === '' ? undefined : clamp(Math.round(Number(v)), 0, 99) });
              }}
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900 px-2 py-1.5 text-sm text-white"
            />
          </label>
          <label className="text-xs text-zinc-400">
            Nombre en la tarjeta
            <input
              key={`s-${player.id}-${ov.shortName ?? ''}`}
              maxLength={18}
              defaultValue={ov.shortName ?? player.shortName}
              onBlur={(e) => {
                const v = e.currentTarget.value.trim();
                setOverride(player.id, { shortName: v === player.shortName ? undefined : v });
              }}
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900 px-2 py-1.5 text-sm text-white"
            />
          </label>
        </div>
        {duplicate && <p className="text-xs text-amber-400">Otro jugador de la alineación usa el dorsal {number}.</p>}
      </section>

      <div className="flex flex-wrap gap-2">
        {onPitch && (
          <>
            <button
              onClick={() => toggleCaptain(player.id)}
              className={cn(btn, captainId === player.id ? 'bg-amber-400 text-black' : 'bg-ink-700 text-white')}
            >
              {captainId === player.id ? 'Quitar capitanía' : 'Hacer capitán'}
            </button>
            <button
              onClick={() => toggleGoalkeeper(player.id)}
              className={cn(btn, goalkeeperId === player.id ? 'bg-amber-400 text-black' : 'bg-ink-700 text-white')}
            >
              {goalkeeperId === player.id ? 'Quitar de portero' : 'Marcar como portero'}
            </button>
          </>
        )}
        {!onPitch && (
          <button onClick={() => addToPitch(player.id)} className={cn(btn, 'bg-accent text-black')}>
            A la cancha
          </button>
        )}
        {!onBench && (
          <button onClick={() => sendToBench(player.id)} className={cn(btn, 'bg-ink-600 text-white')}>
            Al banquillo
          </button>
        )}
        {(onPitch || onBench) && (
          <button onClick={() => removeFromLineup(player.id)} className={cn(btn, 'bg-ink-700 text-zinc-300 hover:bg-rose-600')}>
            Quitar de la alineación
          </button>
        )}
      </div>

      <section className="rounded-lg border border-dashed border-white/15 p-3 text-xs text-zinc-400">
        <p className="font-semibold text-zinc-300">Estadísticas de rendimiento: No disponible</p>
        <p className="mt-1">
          Se conectarán con el proveedor de datos en la Fase 4. Fuente actual: {player.source === 'demo' ? 'datos de demostración' : player.source}.
        </p>
      </section>
    </div>
  );
}
