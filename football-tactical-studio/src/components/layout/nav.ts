import type { LucideIcon } from 'lucide-react';
import { GitCompare, Home, Save, Scale, Settings, Target, Users } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  ready: boolean;
  phase?: number;
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Inicio', icon: Home, ready: true },
  { href: '/editor', label: 'Editor táctico', icon: Target, ready: true },
  { href: '/equipos', label: 'Equipos y plantillas', icon: Users, ready: false, phase: 2 },
  { href: '/comparador-equipos', label: 'Comparador de equipos', icon: GitCompare, ready: false, phase: 5 },
  { href: '/comparador-jugadores', label: 'Comparador de jugadores', icon: Scale, ready: false, phase: 5 },
  { href: '/alineaciones', label: 'Mis alineaciones', icon: Save, ready: false, phase: 6 },
  { href: '/configuracion', label: 'Configuración', icon: Settings, ready: false, phase: 2 },
];
