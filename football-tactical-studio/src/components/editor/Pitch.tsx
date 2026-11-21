'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Orientation } from '@/lib/types';

/** Cancha dibujada en SVG (proporción 68×105 aprox.). En horizontal se rota el dibujo, no las tarjetas. */
function PitchSvg({ orientation }: { orientation: Orientation }) {
  const v = orientation === 'vertical';
  const line = { stroke: 'rgba(255,255,255,0.82)', strokeWidth: 3, fill: 'none' } as const;
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={v ? '0 0 680 1050' : '0 0 1050 680'}
      aria-hidden
    >
      <g transform={v ? undefined : 'translate(1050 0) rotate(90)'}>
        <rect width="680" height="1050" fill="#0f3d22" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x="20" y={20 + i * 101} width="640" height="101" fill={i % 2 ? '#188a43' : '#16803c'} />
        ))}
        <rect x="20" y="20" width="640" height="1010" {...line} />
        <line x1="20" y1="525" x2="660" y2="525" {...line} />
        <circle cx="340" cy="525" r="86" {...line} />
        <circle cx="340" cy="525" r="5" fill="rgba(255,255,255,0.85)" />
        {/* Área superior */}
        <rect x="150.5" y="20" width="379" height="155" {...line} />
        <rect x="254" y="20" width="172" height="52" {...line} />
        <circle cx="340" cy="124" r="4" fill="rgba(255,255,255,0.85)" />
        <path d="M270.8 175 A86 86 0 0 0 409.2 175" {...line} />
        <rect x="305.5" y="2" width="69" height="18" {...line} />
        {/* Área inferior */}
        <rect x="150.5" y="875" width="379" height="155" {...line} />
        <rect x="254" y="978" width="172" height="52" {...line} />
        <circle cx="340" cy="926" r="4" fill="rgba(255,255,255,0.85)" />
        <path d="M270.8 875 A86 86 0 0 1 409.2 875" {...line} />
        <rect x="305.5" y="1030" width="69" height="18" {...line} />
        {/* Corners */}
        <path d="M20 34 A14 14 0 0 0 34 20" {...line} />
        <path d="M646 20 A14 14 0 0 0 660 34" {...line} />
        <path d="M34 1030 A14 14 0 0 0 20 1016" {...line} />
        <path d="M660 1016 A14 14 0 0 0 646 1030" {...line} />
      </g>
    </svg>
  );
}

interface Props {
  orientation: Orientation;
  children: (cardWidth: number) => ReactNode;
  overlay?: ReactNode;
  onBackgroundClick?: () => void;
}

export const Pitch = forwardRef<HTMLDivElement, Props>(function Pitch(
  { orientation, children, overlay, onBackgroundClick },
  ref,
) {
  const inner = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLDivElement);
  const [w, setW] = useState(360);

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const vertical = orientation === 'vertical';
  const cardWidth = Math.round(Math.max(40, Math.min(88, w * (vertical ? 0.15 : 0.085))));

  return (
    <div
      ref={inner}
      data-pitch
      onClick={onBackgroundClick}
      className="relative mx-auto select-none overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/60"
      style={{
        aspectRatio: vertical ? '680 / 1050' : '1050 / 680',
        width: '100%',
        maxWidth: vertical ? 'calc(78vh * 680 / 1050)' : 'calc(78vh * 1050 / 680)',
      }}
    >
      <PitchSvg orientation={orientation} />
      {children(cardWidth)}
      {overlay}
    </div>
  );
});
