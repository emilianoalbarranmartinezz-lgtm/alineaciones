'use client';

import { Copy, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PRESET_FORMATIONS } from '@/lib/formations';
import { useEditorStore } from '@/store/editor-store';
import { FormationThumb } from './FormationThumb';

const iconBtn =
  'grid h-7 w-7 place-items-center rounded-md bg-ink-700 text-zinc-300 hover:bg-ink-600 hover:text-white';

export function FormationPicker() {
  const {
    formationId,
    formationModified,
    customFormations,
    pitch,
    applyFormation,
    saveCurrentAsCustom,
    renameFormation,
    duplicateFormation,
    deleteFormation,
    overwriteFormation,
  } = useEditorStore();

  const saveCurrent = () => {
    const name = window.prompt('Nombre de la formación', 'Mi formación');
    if (name !== null) saveCurrentAsCustom(name);
  };

  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 font-display text-sm font-semibold text-zinc-200">Predeterminadas</h3>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_FORMATIONS.map((f) => {
            const active = formationId === f.id;
            return (
              <div key={f.id} className="relative">
                <button
                  onClick={() => applyFormation(f.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full flex-col items-center gap-1 rounded-lg border p-2 transition-colors',
                    active ? 'border-accent bg-accent/10' : 'border-white/10 bg-ink-800 hover:border-white/30',
                  )}
                >
                  <div className="h-16 w-11">
                    <FormationThumb slots={f.slots} />
                  </div>
                  <span className="text-xs font-semibold text-white">{f.name}</span>
                  {active && formationModified && <span className="text-[10px] text-amber-400">modificada</span>}
                </button>
                <button
                  title="Guardar una copia como formación personalizada"
                  onClick={() => duplicateFormation(f.id)}
                  className={cn(iconBtn, 'absolute right-1 top-1 h-6 w-6')}
                >
                  <Plus size={12} />
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Cambiar de formación reubica a los jugadores actuales; no quita a nadie ni reinicia dorsales, capitán o nombres.
        </p>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-zinc-200">Personalizadas</h3>
          <button
            onClick={saveCurrent}
            disabled={pitch.length === 0}
            className="flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-black disabled:opacity-40"
          >
            <Save size={12} /> Guardar disposición actual
          </button>
        </div>
        {customFormations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/15 p-3 text-xs text-zinc-500">
            Aún no tienes formaciones propias. Mueve a los jugadores como quieras y guarda la disposición, o crea una
            copia de una predeterminada con el botón +. Sirven con cualquier equipo.
          </p>
        ) : (
          <ul className="space-y-2">
            {customFormations.map((f) => {
              const active = formationId === f.id;
              return (
                <li
                  key={f.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-2',
                    active ? 'border-accent bg-accent/10' : 'border-white/10 bg-ink-800',
                  )}
                >
                  <button onClick={() => applyFormation(f.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <div className="h-12 w-8 shrink-0">
                      <FormationThumb slots={f.slots} />
                    </div>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">{f.name}</span>
                      <span className="block text-[11px] text-zinc-500">
                        {f.slots.length} jugadores{active && formationModified ? ' · modificada' : ''}
                      </span>
                    </span>
                  </button>
                  <button
                    title="Sobrescribir con la disposición actual"
                    className={iconBtn}
                    onClick={() => {
                      if (window.confirm(`¿Sobrescribir "${f.name}" con la disposición actual?`)) overwriteFormation(f.id);
                    }}
                  >
                    <Save size={13} />
                  </button>
                  <button
                    title="Renombrar"
                    className={iconBtn}
                    onClick={() => {
                      const n = window.prompt('Nuevo nombre', f.name);
                      if (n !== null) renameFormation(f.id, n);
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button title="Duplicar" className={iconBtn} onClick={() => duplicateFormation(f.id)}>
                    <Copy size={13} />
                  </button>
                  <button
                    title="Eliminar"
                    className={cn(iconBtn, 'hover:bg-rose-600')}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la formación "${f.name}"?`)) deleteFormation(f.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
