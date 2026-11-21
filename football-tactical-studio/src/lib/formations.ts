import type { Formation, Point, PositionGroup } from './types';

const round = (n: number) => Math.round(n * 10) / 10;

function spread(count: number): number[] {
  if (count === 1) return [50];
  const m = count >= 5 ? 10 : count === 4 ? 14 : count === 3 ? 22 : 32;
  return Array.from({ length: count }, (_, i) => round(m + (i * (100 - 2 * m)) / (count - 1)));
}

/** [portero] + líneas de campo de atrás hacia adelante. */
export function slotsFromLines(lines: number[]): Point[] {
  const n = lines.length;
  const top = 18;
  const bottom = 76;
  const slots: Point[] = [{ x: 50, y: 92 }];
  lines.forEach((count, i) => {
    const y = n === 1 ? 50 : round(bottom - (i * (bottom - top)) / (n - 1));
    spread(count).forEach((x) => slots.push({ x, y }));
  });
  return slots;
}

const DEFS: Array<[string, number[]]> = [
  ['4-3-3', [4, 3, 3]],
  ['4-4-2', [4, 4, 2]],
  ['4-2-3-1', [4, 2, 3, 1]],
  ['3-5-2', [3, 5, 2]],
  ['3-4-3', [3, 4, 3]],
  ['5-3-2', [5, 3, 2]],
  ['4-1-4-1', [4, 1, 4, 1]],
  ['4-5-1', [4, 5, 1]],
  ['3-4-2-1', [3, 4, 2, 1]],
  ['4-2-2-2', [4, 2, 2, 2]],
];

export const PRESET_FORMATIONS: Formation[] = DEFS.map(([id, lines]) => ({
  id,
  name: id,
  kind: 'preset',
  slots: slotsFromLines(lines),
}));

export function findFormation(id: string, custom: Formation[]): Formation | undefined {
  return [...PRESET_FORMATIONS, ...custom].find((f) => f.id === id);
}

export function groupFromY(y: number): PositionGroup {
  if (y >= 85) return 'GK';
  if (y >= 62) return 'DF';
  if (y >= 34) return 'MF';
  return 'FW';
}

export interface SlotItem {
  id: string;
  group: PositionGroup;
  x: number;
  y: number;
}

const GROUP_ORDER: PositionGroup[] = ['GK', 'DF', 'MF', 'FW'];

function toRows(slots: Point[]): Point[][] {
  const sorted = [...slots].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: Point[][] = [];
  sorted.forEach((s) => {
    const last = rows[rows.length - 1];
    if (last && Math.abs(last[0].y - s.y) < 2) last.push(s);
    else rows.push([s]);
  });
  rows.forEach((r) => r.sort((a, b) => a.x - b.x));
  return rows;
}

function evenIdx(total: number, pick: number): number[] {
  if (pick >= total) return Array.from({ length: total }, (_, i) => i);
  if (pick === 1) return [Math.floor((total - 1) / 2)];
  return Array.from({ length: pick }, (_, i) => Math.round((i * (total - 1)) / (pick - 1)));
}

/**
 * Reparte jugadores en las posiciones de una formación SIN descartar a nadie:
 * respeta el grupo (POR/DEF/MED/DEL), conserva el lado (izq./der.) y, si sobran
 * jugadores de un grupo, los coloca en huecos libres de otros grupos.
 */
export function assignToSlots(items: SlotItem[], slots: Point[]): Map<string, Point> {
  const result = new Map<string, Point>();
  const used = new Set<Point>();
  const leftover: SlotItem[] = [];

  for (const g of GROUP_ORDER) {
    const rows = toRows(slots.filter((s) => groupFromY(s.y) === g));
    const total = rows.reduce((acc, r) => acc + r.length, 0);
    const ps = items.filter((i) => i.group === g).sort((a, b) => b.y - a.y || a.x - b.x);
    const count = Math.min(ps.length, total);
    leftover.push(...ps.slice(count));

    let cursor = 0;
    let remaining = count;
    for (const row of rows) {
      const take = Math.min(row.length, remaining);
      if (take === 0) break;
      const chunk = ps.slice(cursor, cursor + take).sort((a, b) => a.x - b.x);
      const idx = evenIdx(row.length, take);
      chunk.forEach((p, k) => {
        const s = row[idx[k]];
        result.set(p.id, { x: s.x, y: s.y });
        used.add(s);
      });
      cursor += take;
      remaining -= take;
    }
  }

  const free = slots.filter((s) => !used.has(s)).sort((a, b) => b.y - a.y || a.x - b.x);
  leftover.forEach((p, k) => {
    const s = free[k];
    if (s) result.set(p.id, { x: s.x, y: s.y });
  });
  return result;
}
