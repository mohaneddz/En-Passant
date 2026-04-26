export interface Player {
  id: number;
  full_name: string;
  elo: number;
  is_active: boolean;
  is_present: boolean;
  created_at?: string;

  // Backward-compatible aliases for existing UI code
  name: string;
  rating: number;

  // Derived tournament stats
  wins: number;
  losses: number;
  draws: number;
  games: number;
  byes: number;
  score: number;
  buchholz: number;
  opponents: number[];
  color: number;
  rank?: number;
}
