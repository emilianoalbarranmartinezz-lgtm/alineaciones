'use client';

import { useCallback, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import { fromDisplay } from '@/lib/geometry';
import type { Point } from '@/lib/types';
import { useEditorStore } from '@/store/editor-store';

export type DragSource = 'pitch' | 'bench' | 'squad';
export interface Ghost {
  playerId: string;
  x: number;
  y: number;
}
export type StartDrag = (e: PointerEvent<HTMLElement>, playerId: string, source: DragSource) => void;

/**
 * Arrastre unificado con Pointer Events (ratón, táctil y lápiz).
 * - Desde la cancha: la tarjeta sigue al puntero en vivo, sin posiciones predefinidas.
 * - Desde banquillo/plantilla: aparece una tarjeta "fantasma" que se suelta sobre la cancha.
 * - Soltar sobre otra tarjeta intercambia; soltar sobre el banquillo envía al jugador a la banca.
 * Un toque sin movimiento (< 6 px) selecciona al jugador.
 */
export function useCardDrag(pitchRef: RefObject<HTMLDivElement>) {
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [overBench, setOverBench] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const start: StartDrag = useCallback(
    (e, playerId, source) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const sx = e.clientX;
      const sy = e.clientY;
      let moved = false;
      const origin = useEditorStore.getState().pitch.find((p) => p.playerId === playerId);
      const originPoint: Point | undefined = origin ? { x: origin.x, y: origin.y } : undefined;

      const toPoint = (cx: number, cy: number): Point | null => {
        const el = pitchRef.current;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const left = ((cx - r.left) / r.width) * 100;
        const top = ((cy - r.top) / r.height) * 100;
        return fromDisplay(left, top, useEditorStore.getState().orientation);
      };

      const inspect = (cx: number, cy: number) => {
        let target: { id: string; source: string } | null = null;
        let bench = false;
        let pitch = false;
        for (const node of document.elementsFromPoint(cx, cy)) {
          const el = node as HTMLElement;
          const card = el.closest?.('[data-player-id]') as HTMLElement | null;
          if (card && !target && card.dataset.playerId !== playerId && card.dataset.source !== 'squad') {
            target = { id: card.dataset.playerId as string, source: card.dataset.source as string };
          }
          if (el.closest?.('[data-dropzone="bench"]')) bench = true;
          if (el.closest?.('[data-pitch]')) pitch = true;
        }
        return { target, bench, pitch };
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        setGhost(null);
        setOverBench(false);
        setActiveId(null);
      };

      const onMove = (ev: { clientX: number; clientY: number; preventDefault: () => void }) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
        if (!moved) {
          moved = true;
          setActiveId(playerId);
        }
        ev.preventDefault();
        if (source === 'pitch') {
          const p = toPoint(ev.clientX, ev.clientY);
          if (p) useEditorStore.getState().movePitchPlayer(playerId, p);
        } else {
          setGhost({ playerId, x: ev.clientX, y: ev.clientY });
        }
        setOverBench(inspect(ev.clientX, ev.clientY).bench);
      };

      const onCancel = () => {
        const wasMoved = moved;
        cleanup();
        if (wasMoved && source === 'pitch' && originPoint) {
          useEditorStore.getState().movePitchPlayer(playerId, originPoint);
        }
      };

      const onUp = (ev: { clientX: number; clientY: number }) => {
        cleanup();
        const st = useEditorStore.getState();
        if (!moved) {
          st.select(playerId);
          return;
        }
        const { target, bench, pitch } = inspect(ev.clientX, ev.clientY);
        const point = toPoint(ev.clientX, ev.clientY);

        if (source === 'pitch') {
          if (target?.source === 'pitch') st.swapPitch(playerId, target.id, originPoint);
          else if (target?.source === 'bench') st.swapPitchBench(playerId, target.id, originPoint);
          else if (bench) st.sendToBench(playerId);
          else if (!pitch && originPoint) st.movePitchPlayer(playerId, originPoint);
          return;
        }
        if (source === 'bench') {
          if (target?.source === 'pitch') st.swapPitchBench(target.id, playerId);
          else if (pitch && point) st.addToPitch(playerId, point);
          return;
        }
        // source === 'squad' (jugador libre)
        if (target?.source === 'pitch') st.replaceOnPitch(target.id, playerId);
        else if (target?.source === 'bench' || bench) st.sendToBench(playerId);
        else if (pitch && point) st.addToPitch(playerId, point);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    },
    [pitchRef],
  );

  return { start, ghost, overBench, activeId };
}
