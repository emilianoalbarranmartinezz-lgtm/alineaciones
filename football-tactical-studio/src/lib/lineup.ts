import type { PitchEntry, Player, Point, PositionGroup } from './types';
import { assignToSlots, groupFromY } from './formations';

/** Si hay un portero designado distinto, los demás porteros cuentan como defensas. */
export function effectiveGroup(player: Player, goalkeeperId: string | null): PositionGroup {
  if (goalkeeperId) {
    if (player.id === goalkeeperId) return 'GK';
    if (player.position === 'GK') return 'DF';
  }
  return player.position;
}

/** Alineación inicial: elige titulares por posición según la formación y 9 suplentes. */
export function buildLineup(squad: Player[], slots: Point[]) {
  const need: Record<PositionGroup, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  slots.forEach((s) => {
    need[groupFromY(s.y)] += 1;
  });

  const rest = [...squad];
  const picked: Player[] = [];
  const groups: PositionGroup[] = ['GK', 'DF', 'MF', 'FW'];
  for (const g of groups) {
    let n = need[g];
    for (let i = 0; i < rest.length && n > 0; ) {
      if (rest[i].position === g) {
        picked.push(rest.splice(i, 1)[0]);
        n -= 1;
      } else {
        i += 1;
      }
    }
  }
  while (picked.length < slots.length && rest.length > 0) picked.push(rest.shift() as Player);

  const items = picked.map((p, i) => ({ id: p.id, group: p.position, x: i, y: 0 }));
  const map = assignToSlots(items, slots);
  const pitch: PitchEntry[] = picked.flatMap((p) => {
    const pt = map.get(p.id);
    return pt ? [{ playerId: p.id, x: pt.x, y: pt.y }] : [];
  });

  const bench: string[] = [];
  const gkIdx = rest.findIndex((p) => p.position === 'GK');
  if (gkIdx >= 0) bench.push(rest.splice(gkIdx, 1)[0].id);
  while (bench.length < 9 && rest.length > 0) bench.push((rest.shift() as Player).id);

  const gk = pitch.map((e) => squad.find((p) => p.id === e.playerId)).find((p) => p?.position === 'GK');
  return { pitch, bench, goalkeeperId: gk ? gk.id : null };
}
