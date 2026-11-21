import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Formation, Orientation, PitchEntry, Point, Team } from '@/lib/types';
import { PRESET_FORMATIONS, assignToSlots, findFormation } from '@/lib/formations';
import { buildLineup, effectiveGroup } from '@/lib/lineup';
import { clampPoint, findFreeSpot } from '@/lib/geometry';

export interface Override {
  number?: number;
  shortName?: string;
}

interface EditorState {
  team: Team | null;
  orientation: Orientation;
  /** id de formación predeterminada o personalizada; '' = disposición libre */
  formationId: string;
  formationModified: boolean;
  pitch: PitchEntry[];
  bench: string[];
  captainId: string | null;
  goalkeeperId: string | null;
  overrides: Record<string, Override>;
  selectedId: string | null;
  customFormations: Formation[];

  loadTeam: (team: Team) => void;
  setOrientation: (o: Orientation) => void;
  applyFormation: (id: string) => void;
  select: (id: string | null) => void;

  movePitchPlayer: (id: string, p: Point) => void;
  swapPitch: (aId: string, bId: string, aOrigin?: Point) => void;
  swapPitchBench: (pitchId: string, benchId: string, origin?: Point) => void;
  replaceOnPitch: (targetId: string, newId: string) => void;
  addToPitch: (id: string, p?: Point) => void;
  sendToBench: (id: string) => void;
  removeFromLineup: (id: string) => void;

  toggleCaptain: (id: string) => void;
  toggleGoalkeeper: (id: string) => void;
  setOverride: (id: string, patch: Override) => void;

  saveCurrentAsCustom: (name: string) => string | null;
  overwriteFormation: (id: string) => void;
  renameFormation: (id: string, name: string) => void;
  duplicateFormation: (id: string) => void;
  deleteFormation: (id: string) => void;
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      team: null,
      orientation: 'vertical',
      formationId: '4-3-3',
      formationModified: false,
      pitch: [],
      bench: [],
      captainId: null,
      goalkeeperId: null,
      overrides: {},
      selectedId: null,
      customFormations: [],

      loadTeam: (team) => {
        const s = get();
        const f = findFormation(s.formationId, s.customFormations) ?? PRESET_FORMATIONS[0];
        const { pitch, bench, goalkeeperId } = buildLineup(team.squad, f.slots);
        set({
          team,
          pitch,
          bench,
          goalkeeperId,
          captainId: null,
          overrides: {},
          selectedId: null,
          formationId: f.id,
          formationModified: false,
        });
      },

      setOrientation: (orientation) => set({ orientation }),
      select: (selectedId) => set({ selectedId }),

      applyFormation: (id) => {
        const s = get();
        const f = findFormation(id, s.customFormations);
        if (!f || !s.team) return;
        const byId = new Map(s.team.squad.map((p) => [p.id, p]));
        const items = s.pitch.flatMap((e) => {
          const p = byId.get(e.playerId);
          return p ? [{ id: e.playerId, group: effectiveGroup(p, s.goalkeeperId), x: e.x, y: e.y }] : [];
        });
        const map = assignToSlots(items, f.slots);
        set({
          formationId: id,
          formationModified: false,
          pitch: s.pitch.map((e) => {
            const pt = map.get(e.playerId);
            return pt ? { ...e, x: pt.x, y: pt.y } : e;
          }),
        });
      },

      movePitchPlayer: (id, p) =>
        set((s) => ({
          formationModified: true,
          pitch: s.pitch.map((e) => (e.playerId === id ? { ...e, ...clampPoint(p) } : e)),
        })),

      swapPitch: (aId, bId, aOrigin) =>
        set((s) => {
          const a = s.pitch.find((e) => e.playerId === aId);
          const b = s.pitch.find((e) => e.playerId === bId);
          if (!a || !b) return s;
          const bPos = { x: b.x, y: b.y };
          const aPos = aOrigin ?? { x: a.x, y: a.y };
          return {
            formationModified: true,
            pitch: s.pitch.map((e) =>
              e.playerId === aId ? { ...e, ...bPos } : e.playerId === bId ? { ...e, ...aPos } : e,
            ),
          };
        }),

      // Un suplente entra por un titular: hereda su posición (y la portería si era portero).
      swapPitchBench: (pitchId, benchId, origin) =>
        set((s) => {
          const a = s.pitch.find((e) => e.playerId === pitchId);
          if (!a || !s.bench.includes(benchId)) return s;
          const pos = origin ?? { x: a.x, y: a.y };
          return {
            formationModified: true,
            pitch: s.pitch.map((e) => (e.playerId === pitchId ? { playerId: benchId, ...pos } : e)),
            bench: s.bench.map((id) => (id === benchId ? pitchId : id)),
            captainId: s.captainId === pitchId ? null : s.captainId,
            goalkeeperId: s.goalkeeperId === pitchId ? benchId : s.goalkeeperId,
          };
        }),

      // Un jugador libre sustituye a un titular; el titular pasa al banquillo.
      replaceOnPitch: (targetId, newId) =>
        set((s) => {
          const t = s.pitch.find((e) => e.playerId === targetId);
          if (!t || targetId === newId) return s;
          return {
            formationModified: true,
            pitch: s.pitch.map((e) => (e.playerId === targetId ? { playerId: newId, x: e.x, y: e.y } : e)),
            bench: [...s.bench.filter((id) => id !== newId), targetId],
            captainId: s.captainId === targetId ? null : s.captainId,
            goalkeeperId: s.goalkeeperId === targetId ? newId : s.goalkeeperId,
          };
        }),

      addToPitch: (id, p) =>
        set((s) => {
          if (!s.team || s.pitch.some((e) => e.playerId === id)) return s;
          const pl = s.team.squad.find((x) => x.id === id);
          if (!pl) return s;
          const pt = p ? clampPoint(p) : findFreeSpot(effectiveGroup(pl, s.goalkeeperId), s.pitch);
          return {
            formationModified: true,
            pitch: [...s.pitch, { playerId: id, ...pt }],
            bench: s.bench.filter((b) => b !== id),
            goalkeeperId: s.goalkeeperId === null && pl.position === 'GK' ? id : s.goalkeeperId,
          };
        }),

      sendToBench: (id) =>
        set((s) => ({
          formationModified: s.pitch.some((e) => e.playerId === id) ? true : s.formationModified,
          pitch: s.pitch.filter((e) => e.playerId !== id),
          bench: s.bench.includes(id) ? s.bench : [...s.bench, id],
          captainId: s.captainId === id ? null : s.captainId,
          goalkeeperId: s.goalkeeperId === id ? null : s.goalkeeperId,
        })),

      removeFromLineup: (id) =>
        set((s) => ({
          formationModified: s.pitch.some((e) => e.playerId === id) ? true : s.formationModified,
          pitch: s.pitch.filter((e) => e.playerId !== id),
          bench: s.bench.filter((b) => b !== id),
          captainId: s.captainId === id ? null : s.captainId,
          goalkeeperId: s.goalkeeperId === id ? null : s.goalkeeperId,
        })),

      toggleCaptain: (id) =>
        set((s) =>
          s.pitch.some((e) => e.playerId === id) ? { captainId: s.captainId === id ? null : id } : s,
        ),

      toggleGoalkeeper: (id) =>
        set((s) =>
          s.pitch.some((e) => e.playerId === id) ? { goalkeeperId: s.goalkeeperId === id ? null : id } : s,
        ),

      setOverride: (id, patch) =>
        set((s) => {
          const cur: Override = { ...s.overrides[id], ...patch };
          if (cur.number === undefined) delete cur.number;
          if (!cur.shortName) delete cur.shortName;
          const next = { ...s.overrides };
          if (Object.keys(cur).length === 0) delete next[id];
          else next[id] = cur;
          return { overrides: next };
        }),

      saveCurrentAsCustom: (name) => {
        const s = get();
        const slots = s.pitch.map((e) => ({ x: e.x, y: e.y }));
        if (slots.length === 0) return null;
        const f: Formation = {
          id: `custom-${uid()}`,
          name: name.trim() || 'Mi formación',
          kind: 'custom',
          slots,
          createdAt: new Date().toISOString(),
        };
        set({ customFormations: [...s.customFormations, f], formationId: f.id, formationModified: false });
        return f.id;
      },

      overwriteFormation: (id) =>
        set((s) => {
          if (!s.customFormations.some((f) => f.id === id)) return s;
          const slots = s.pitch.map((e) => ({ x: e.x, y: e.y }));
          return {
            customFormations: s.customFormations.map((f) => (f.id === id ? { ...f, slots } : f)),
            formationId: id,
            formationModified: false,
          };
        }),

      renameFormation: (id, name) =>
        set((s) => ({
          customFormations: s.customFormations.map((f) => (f.id === id ? { ...f, name: name.trim() || f.name } : f)),
        })),

      duplicateFormation: (id) =>
        set((s) => {
          const f = findFormation(id, s.customFormations);
          if (!f) return s;
          const copy: Formation = {
            id: `custom-${uid()}`,
            name: f.kind === 'preset' ? `${f.name} personalizada` : `${f.name} (copia)`,
            kind: 'custom',
            slots: f.slots.map((p) => ({ ...p })),
            createdAt: new Date().toISOString(),
          };
          return { customFormations: [...s.customFormations, copy] };
        }),

      deleteFormation: (id) =>
        set((s) => ({
          customFormations: s.customFormations.filter((f) => f.id !== id),
          formationId: s.formationId === id ? '' : s.formationId,
        })),
    }),
    {
      name: 'fts-editor-v1',
      version: 1,
      skipHydration: true, // se rehidrata en el cliente para evitar errores de hidratación de Next
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        team: s.team,
        orientation: s.orientation,
        formationId: s.formationId,
        formationModified: s.formationModified,
        pitch: s.pitch,
        bench: s.bench,
        captainId: s.captainId,
        goalkeeperId: s.goalkeeperId,
        overrides: s.overrides,
        customFormations: s.customFormations,
      }),
    },
  ),
);
