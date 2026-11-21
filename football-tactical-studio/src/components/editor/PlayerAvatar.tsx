'use client';

import { useState } from 'react';

export function DefaultAvatar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`h-full w-full ${className}`} aria-hidden>
      <rect width="100" height="100" fill="#27272a" />
      <circle cx="50" cy="38" r="17" fill="#52525b" />
      <path d="M16 100c0-22 15-36 34-36s34 14 34 36z" fill="#52525b" />
    </svg>
  );
}

/** Foto con avatar predeterminado si falta la URL o la imagen falla al cargar. */
export function PlayerAvatar({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <DefaultAvatar />;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover object-top"
    />
  );
}
