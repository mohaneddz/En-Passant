export interface Player {
  id: number;               // Primary key
  name: string;             // Not null
  rating: number;   // Nullable
  wins: number;     // smallint
  losses: number;   // smallint
  draws: number;    // smallint
  games: number;    // smallint
  opponents: number[]; // Array of opponent IDs
  color: number;    // smallint (e.g., color balance)
  olor: number; // Signed streak counter (+1, +2, -1, -2)
  byes: number;     // smallint
  is_active: boolean; // Active status
  is_present: boolean; // Present status

  // Computed properties
  score?: number;
  rank?: number;
  buchholz?: number;
};