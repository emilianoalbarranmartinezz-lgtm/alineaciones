'use client';

import { AlertTriangle, RefreshCw, RotateCcw, RotateCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { findFormation } from '@/lib/formations';
import { effectiveGroup } from '@/lib/lineup';
import { toDisplay } from '@/lib/geometry';
import type { Player, TeamSummary } from '@/lib/types';
import { getProvider } from '@/providers';
import { useEditorStore } from '@/store/editor-store';
import { Bench } from './Bench';
import { FormationPicker } from './FormationPicker';
import { Pitch } from './Pitch';
import { PlayerCard } from './PlayerCard';
import { PlayerPanel } from './PlayerPanel';
import { SquadList } from './SquadList';
import { useCardDrag } from './use-card-drag';

type Tab = 'jugador' | 'plantilla' | 'formaciones';
const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'jugador', label: 'Jugador' },
  { id: 'plantilla', label: 'Plantilla' },
  { id: 'formaciones', label: 'Formaciones' },
];
const DEFAULT_TEAM_ID = 'demo-azul';

export function TacticalEditor() {
  const [ready, setReady] = useState(false);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [tab, setTab] = useState<Tab>('formaciones');
  const [error, setError] = useState<string | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);

  const s = useEditorStore();
  const { start, ghost, overBench, activeId } = useCardDrag(pitchRef);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await Promise.resolve(useEditorStore.persist.rehydrate());
        const provider = getProvider();
        const list = await provider.searchTeams('');
        if (!alive) return;
        setTeams(list);
        if (!useEditorStore.getState().team) {
          useEditorStore.getState().loadTeam(await provider.getTeam(DEFAULT_TEAM_ID));
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'No se pudo cargar la plantilla.');
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (s.selectedId) setTab('jugador');
  }, [s.selectedId]);

  const byId = useMemo(() => new Map((s.team?.squad ?? []).map((p) => [p.id, p])), [s.team]);
  const numberOf = (p: Player) => s.overrides[p.id]?.number ?? p.number;
  const labelOf = (p: Player) => s.overrides[p.id]?.shortName ?? p.shortName;
  const benchPlayers = s.bench.flatMap((id) => (byId.get(id) ? [byId.get(id) as Player] : []));
  const formation = findFormation(s.formationId, s.customFormations);
  const ghostPlayer = ghost ? byId.get(ghost.playerId) : undefined;

  const changeTeam = async (id: string) => {
    if (id === s.team?.id) return;
    if (!window.confirm('Cambiar de equipo reemplaza la alineación actual (tus formaciones guardadas se conservan).')) return;
    try {
      s.loadTeam(await getProvider().getTeam(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el equipo.');
    }
  };

  if (!ready) return <p className="p-6 text-sm text-zinc-400">Cargando editor…</p>;
  if (!s.team) {
    return (
      <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
        {error ?? 'No hay un equipo cargado.'} Recarga la página para intentarlo de nuevo.
      </p>
    );
  }

  const tool = 'flex items-center gap-1.5 rounded-md bg-ink-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-600';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={s.team.id}
          onChange={(e) => changeTeam(e.target.value)}
          aria-label="Equipo"
          className="rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          className={tool}
          onClick={() => s.setOrientation(s.orientation === 'vertical' ? 'horizontal' : 'vertical')}
        >
          <RotateCw size={15} /> {s.orientation === 'vertical' ? 'Ver horizontal' : 'Ver vertical'}
        </button>
        <button
          className={tool}
          disabled={!formation}
          onClick={() => s.applyFormation(s.formationId)}
          title="Devuelve a los jugadores a las posiciones de la formación"
        >
          <RefreshCw size={15} /> Reajustar
        </button>
        <button
          className={tool}
          onClick={() => window.confirm('¿Reiniciar la alineación con los titulares automáticos?') && s.loadTeam(s.team!)}
        >
          <RotateCcw size={15} /> Reiniciar
        </button>
        <span
          className={cn(
            'ml-auto rounded-full px-3 py-1 text-sm font-semibold',
            s.pitch.length > 11 ? 'bg-amber-400 text-black' : 'bg-ink-700 text-white',
          )}
        >
          Titulares {s.pitch.length}/11
        </span>
      </div>

      {s.team.source === 'demo' && (
        <p className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Datos de demostración: equipos y jugadores ficticios, sin fotografías. Se reemplazarán por datos reales al
          conectar API-Football (Fase 2).
        </p>
      )}
      {s.pitch.length > 11 && (
        <p role="status" className="flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle size={14} /> Hay {s.pitch.length} jugadores en la cancha (lo habitual son 11). Puedes mantener
          esta configuración especial.
        </p>
      )}
      {s.pitch.length < 11 && (
        <p role="status" className="text-xs text-zinc-500">
          Solo hay {s.pitch.length} titulares en la cancha. Añade jugadores desde la pestaña Plantilla.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          <Pitch
            ref={pitchRef}
            orientation={s.orientation}
            onBackgroundClick={() => s.select(null)}
            overlay={
              <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white">
                {formation?.name ?? 'Disposición libre'}
                {s.formationModified && <span className="ml-1 text-amber-300">· modificada</span>}
              </div>
            }
          >
            {(cardW) =>
              s.pitch.map((e) => {
                const p = byId.get(e.playerId);
                if (!p) return null;
                const { left, top } = toDisplay(e, s.orientation);
                const dragging = activeId === e.playerId;
                const selected = s.selectedId === e.playerId;
                return (
                  <div
                    key={e.playerId}
                    className={cn('absolute', !dragging && 'transition-[left,top] duration-300 ease-out')}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: dragging ? 40 : selected ? 30 : 10,
                    }}
                  >
                    <PlayerCard
                      player={p}
                      number={numberOf(p)}
                      label={labelOf(p)}
                      width={cardW}
                      source="pitch"
                      group={effectiveGroup(p, s.goalkeeperId)}
                      isCaptain={s.captainId === p.id}
                      selected={selected}
                      dragging={dragging}
                      onPointerDown={(ev) => start(ev, p.id, 'pitch')}
                    />
                  </div>
                );
              })
            }
          </Pitch>

          <Bench
            players={benchPlayers}
            numberOf={numberOf}
            labelOf={labelOf}
            selectedId={s.selectedId}
            coach={s.team.coach}
            activeId={activeId}
            overBench={overBench}
            onStartDrag={start}
          />
        </div>

        <aside className="rounded-xl border border-white/10 bg-ink-900 p-3 xl:sticky xl:top-20 xl:self-start">
          <div role="tablist" className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-ink-800 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-md py-1.5 text-sm font-medium',
                  tab === t.id ? 'bg-ink-600 text-white' : 'text-zinc-400 hover:text-white',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'jugador' && <PlayerPanel />}
          {tab === 'plantilla' && <SquadList onStartDrag={start} />}
          {tab === 'formaciones' && <FormationPicker />}
        </aside>
      </div>

      {ghost && ghostPlayer && (
        <div className="pointer-events-none fixed z-50" style={{ left: ghost.x, top: ghost.y, transform: 'translate(-50%, -60%)' }}>
          <PlayerCard
            player={ghostPlayer}
            number={numberOf(ghostPlayer)}
            label={labelOf(ghostPlayer)}
            width={64}
            source="squad"
            dragging
          />
        </div>
      )}
    </div>
  );
}
