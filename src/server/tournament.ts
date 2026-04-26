import { Game, MatchRecord, MatchStatus } from "@/types/game";
import { Player } from "@/types/player";

export interface PlayerRow {
  id: number;
  full_name: string;
  elo: number;
  is_active: boolean;
  is_present: boolean;
  created_at?: string;
}

type DerivedAccumulator = {
  row: PlayerRow;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  byes: number;
  score: number;
  buchholz: number;
  color: number;
  opponents: Set<number>;
  colorHistory: Array<"white" | "black">;
};

function isNonNullScore(score: number | null): score is number {
  return typeof score === "number";
}

export function matchStatusFromRecord(match: MatchRecord): MatchStatus {
  if (match.is_bye) {
    return "WHITE_WINS";
  }

  const { white_score: whiteScore, black_score: blackScore } = match;

  if (!isNonNullScore(whiteScore) || !isNonNullScore(blackScore)) {
    return "PENDING";
  }

  if (whiteScore === blackScore) {
    return "DRAW";
  }

  return whiteScore > blackScore ? "WHITE_WINS" : "BLACK_WINS";
}

export function gameFromMatch(match: MatchRecord): Game {
  return {
    id: match.id,
    white: match.white_player_id,
    black: match.black_player_id ?? 0,
    status: matchStatusFromRecord(match),
    presence: match.is_bye ? 1 : 2,
    round: match.round_number,
  };
}

export function isPendingMatch(match: MatchRecord): boolean {
  return matchStatusFromRecord(match) === "PENDING";
}

function isCompletedNonBye(match: MatchRecord): boolean {
  return (
    !match.is_bye &&
    isNonNullScore(match.white_score) &&
    isNonNullScore(match.black_score) &&
    typeof match.black_player_id === "number"
  );
}

function isCompletedBye(match: MatchRecord): boolean {
  return match.is_bye && match.white_score === 1 && match.black_player_id == null;
}

function computeColorStreak(history: Array<"white" | "black">): number {
  if (history.length === 0) {
    return 0;
  }

  const last = history[history.length - 1];
  const beforeLast = history[history.length - 2];

  if (last === "white") {
    return beforeLast === "white" ? 2 : 1;
  }

  return beforeLast === "black" ? -2 : -1;
}

export function derivePlayers(players: PlayerRow[], matches: MatchRecord[]): Player[] {
  const accumulators = new Map<number, DerivedAccumulator>();

  for (const row of players) {
    accumulators.set(row.id, {
      row,
      wins: 0,
      losses: 0,
      draws: 0,
      games: 0,
      byes: 0,
      score: 0,
      buchholz: 0,
      color: 0,
      opponents: new Set<number>(),
      colorHistory: [],
    });
  }

  const sortedMatches = [...matches].sort((a, b) => {
    if (a.round_number !== b.round_number) {
      return a.round_number - b.round_number;
    }

    return a.id - b.id;
  });

  for (const match of sortedMatches) {
    const white = accumulators.get(match.white_player_id);
    if (!white) {
      continue;
    }

    if (isCompletedBye(match)) {
      white.games += 1;
      white.byes += 1;
      continue;
    }

    if (!isCompletedNonBye(match)) {
      continue;
    }

    const black = accumulators.get(match.black_player_id);
    if (!black) {
      continue;
    }

    const whiteScore = match.white_score as number;
    const blackScore = match.black_score as number;

    white.games += 1;
    black.games += 1;

    white.opponents.add(black.row.id);
    black.opponents.add(white.row.id);

    white.colorHistory.push("white");
    black.colorHistory.push("black");

    if (whiteScore > blackScore) {
      white.wins += 1;
      black.losses += 1;
    } else if (whiteScore < blackScore) {
      white.losses += 1;
      black.wins += 1;
    } else {
      white.draws += 1;
      black.draws += 1;
    }
  }

  for (const entry of accumulators.values()) {
    entry.score = entry.wins + entry.byes + entry.draws * 0.5;
    entry.color = computeColorStreak(entry.colorHistory);
  }

  for (const entry of accumulators.values()) {
    let buchholz = 0;
    for (const opponentId of entry.opponents.values()) {
      const opponent = accumulators.get(opponentId);
      if (opponent) {
        buchholz += opponent.score;
      }
    }

    entry.buchholz = buchholz;
  }

  return Array.from(accumulators.values()).map((entry) => ({
    id: entry.row.id,
    full_name: entry.row.full_name,
    elo: entry.row.elo,
    is_active: entry.row.is_active,
    is_present: entry.row.is_present,
    created_at: entry.row.created_at,

    name: entry.row.full_name,
    rating: entry.row.elo,

    wins: entry.wins,
    losses: entry.losses,
    draws: entry.draws,
    games: entry.games,
    byes: entry.byes,
    score: entry.score,
    buchholz: entry.buchholz,
    opponents: Array.from(entry.opponents.values()),
    color: entry.color,
  }));
}

export function sortByStandings(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (b.buchholz !== a.buchholz) {
      return b.buchholz - a.buchholz;
    }

    return b.elo - a.elo;
  });
}

export function scoresFromResult(result?: string): {
  whiteScore: number | null;
  blackScore: number | null;
} {
  if (!result) {
    return { whiteScore: null, blackScore: null };
  }

  if (result === "1-0") {
    return { whiteScore: 1, blackScore: 0 };
  }

  if (result === "0-1") {
    return { whiteScore: 0, blackScore: 1 };
  }

  if (result === "0.5-0.5") {
    return { whiteScore: 0.5, blackScore: 0.5 };
  }

  return { whiteScore: null, blackScore: null };
}
