import type { Point } from '@/lib/types';

export function FormationThumb({ slots }: { slots: Point[] }) {
  return (
    <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden>
      <rect width="100" height="150" rx="6" fill="#14532d" />
      <rect x="4" y="4" width="92" height="142" rx="3" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
      <line x1="4" y1="75" x2="96" y2="75" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
      {slots.map((s, i) => (
        <circle key={i} cx={4 + (s.x / 100) * 92} cy={4 + (s.y / 100) * 142} r="5" fill="#fff" />
      ))}
    </svg>
  );
}
