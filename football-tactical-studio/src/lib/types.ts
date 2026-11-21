export type PositionGroup = 'GK' | 'DF' | 'MF' | 'FW';
export type Orientation = 'vertical' | 'horizontal';
export type DataSource = 'demo' | 'api-football' | 'sportmonks' | 'football-data';

export interface Point {
  /** 0-100, izquierda → derecha en orientación vertical */
  x: number;
  /** 0-100, 0 = portería rival (ataque), 100 = portería propia */
  y: number;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  number: number;
  position: PositionGroup;
  nationality: string | null;
  age: number | null;
  heightCm: number | null;
  photoUrl: string | null;
  /** Valoración OFICIAL del proveedor. null = no disponible. Nunca inventar. */
  rating: number | null;
  source: DataSource;
}

export interface Coach {
  id: string;
  name: string;
  nationality: string | null;
  photoUrl: string | null;
  teamName: string;
}

export interface Team {
  id: string;
  name: string;
  country: string;
  competition: string | null;
  type: 'club' | 'national';
  crestUrl: string | null;
  primaryColor: string;
  source: DataSource;
  fetchedAt: string | null;
  squad: Player[];
  coach: Coach | null;
}

export type TeamSummary = Omit<Team, 'squad' | 'coach'>;

export interface PitchEntry extends Point {
  playerId: string;
}

export interface Formation {
  id: string;
  name: string;
  kind: 'preset' | 'custom';
  /** Coordenadas independientes del equipo: sirven para cualquier plantilla */
  slots: Point[];
  createdAt?: string;
}
