import { DEMO_TEAMS } from '@/lib/demo-data';
import type { DataProvider } from './types';

export const demoProvider: DataProvider = {
  id: 'demo',
  async searchTeams(query) {
    const q = query.trim().toLowerCase();
    return DEMO_TEAMS.filter((t) => !q || t.name.toLowerCase().includes(q)).map((t) => {
      const { squad: _squad, coach: _coach, ...summary } = t;
      return summary;
    });
  },
  async getTeam(teamId) {
    const team = DEMO_TEAMS.find((t) => t.id === teamId);
    if (!team) throw new Error(`Equipo no encontrado: ${teamId}`);
    return JSON.parse(JSON.stringify(team)) as typeof team;
  },
};
