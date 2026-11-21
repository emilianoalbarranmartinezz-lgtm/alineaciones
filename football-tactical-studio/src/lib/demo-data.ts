import type { Player, PositionGroup, Team } from './types';

/**
 * DATOS DE DEMOSTRACIÓN. Son jugadores y equipos FICTICIOS (source: 'demo').
 * No hay fotos, nacionalidades ni edades porque no se inventan datos reales:
 * la interfaz muestra "No disponible" y un avatar predeterminado.
 */
const SPEC: Array<[PositionGroup, number[]]> = [
  ['GK', [1, 13, 25]],
  ['DF', [2, 3, 4, 5, 12, 15, 22, 23]],
  ['MF', [6, 8, 10, 14, 16, 18, 20, 21]],
  ['FW', [7, 9, 11, 17, 19]],
];
const LABEL: Record<PositionGroup, string> = { GK: 'Portero', DF: 'Defensa', MF: 'Mediocampista', FW: 'Delantero' };
const ABBR: Record<PositionGroup, string> = { GK: 'P', DF: 'D', MF: 'M', FW: 'F' };

function buildSquad(teamId: string, teamName: string, tag: string): Player[] {
  return SPEC.flatMap(([group, numbers]) =>
    numbers.map((number, i) => ({
      id: `${teamId}:${group}${i + 1}`,
      name: `${LABEL[group]} demo ${i + 1} (${teamName})`,
      shortName: `${tag} ${ABBR[group]}${i + 1}`,
      number,
      position: group,
      nationality: null,
      age: null,
      heightCm: null,
      photoUrl: null,
      rating: null,
      source: 'demo' as const,
    })),
  );
}

function demoTeam(id: string, name: string, tag: string, color: string): Team {
  return {
    id,
    name,
    country: 'País demo',
    competition: 'Liga demo',
    type: 'club',
    crestUrl: null,
    primaryColor: color,
    source: 'demo',
    fetchedAt: null,
    squad: buildSquad(id, name, tag),
    coach: { id: `${id}:coach`, name: `Entrenador demo (${name})`, nationality: null, photoUrl: null, teamName: name },
  };
}

export const DEMO_TEAMS: Team[] = [
  demoTeam('demo-azul', 'Demo FC Azul', 'Azul', '#2563eb'),
  demoTeam('demo-rojo', 'Demo FC Rojo', 'Rojo', '#dc2626'),
];
