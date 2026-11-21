import type { Orientation, Point, PositionGroup } from './types';

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const clampPoint = (p: Point): Point => ({ x: clamp(p.x, 3, 97), y: clamp(p.y, 3, 97) });

/**
 * Las coordenadas se guardan siempre en formato "vertical" (ataque hacia arriba).
 * En horizontal se rota 90° (ataque hacia la derecha): así cambiar de orientación
 * nunca altera las posiciones guardadas.
 */
export function toDisplay(p: Point, o: Orientation): { left: number; top: number } {
  return o === 'vertical' ? { left: p.x, top: p.y } : { left: 100 - p.y, top: p.x };
}

export function fromDisplay(left: number, top: number, o: Orientation): Point {
  return o === 'vertical' ? { x: left, y: top } : { x: top, y: 100 - left };
}

const BAND_Y: Record<PositionGroup, number> = { GK: 92, DF: 74, MF: 48, FW: 22 };

/** Busca un hueco libre en la franja de la posición para no solapar tarjetas. */
export function findFreeSpot(group: PositionGroup, existing: Point[]): Point {
  const y = BAND_Y[group];
  if (existing.length === 0) return { x: 50, y };
  let best: Point = { x: 50, y };
  let bestScore = -1;
  for (let x = 8; x <= 92; x += 4) {
    const score = Math.min(...existing.map((e) => Math.hypot((e.x - x) * 0.65, e.y - y)));
    if (score > bestScore) {
      bestScore = score;
      best = { x, y };
    }
  }
  return best;
}
