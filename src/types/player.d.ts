export interface Player {
  id: number;               // Primary key
  name: string;             // Not null
  rating: bigint;   // Nullable
  wins: number;     // smallint
  losses: number;   // smallint
  draws: number;    // smallint
  games: number;    // smallint
  opponents: bigint[]; // Array of opponent IDs
  color: number;    // smallint (e.g., color balance)
  color_streak: number; // Signed streak counter (+1, +2, -1, -2)
  byes: number;     // smallint
  is_active: boolean; // Active status

  // Computed properties
  score?: number;
  rank?: number;
};