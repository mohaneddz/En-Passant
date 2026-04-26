export type MatchStatus = "PENDING" | "DRAW" | "WHITE_WINS" | "BLACK_WINS";

export interface MatchRecord {
  id: number;
  round_number: number;
  white_player_id: number;
  black_player_id: number | null;
  white_score: number | null;
  black_score: number | null;
  is_bye: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Game {
  id: number;
  white: number;
  black: number;
  status: MatchStatus;
  presence: number;
  round: number;
}
