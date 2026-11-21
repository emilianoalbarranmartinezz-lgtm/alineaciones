import type { DataSource, Team, TeamSummary } from '@/lib/types';

/**
 * Contrato único para cualquier proveedor de datos (demo, API-Football, Sportmonks…).
 * La interfaz solo habla con esta capa: cambiar de proveedor no toca los componentes.
 * Fase 2: implementar `ApiFootballProvider` (en servidor, con caché) tras Route Handlers.
 */
export interface DataProvider {
  id: DataSource;
  searchTeams(query: string): Promise<TeamSummary[]>;
  getTeam(teamId: string): Promise<Team>;
}
