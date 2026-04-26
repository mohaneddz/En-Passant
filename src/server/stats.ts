import { supabase } from "@/lib/supabase/client";
import { isPendingMatch } from "./tournament";
import { MatchRecord } from "@/types/game";

export interface StatsGridProps {
  stats: {
    totalPlayers: number | null;
    totalGames: number | null;
    totalRounds: number | null;
    gamesPlayed: number | null;
  };
}

export async function getStats() {
  const [playersResult, matchesResult] = await Promise.all([
    supabase.from("players").select("id", { count: "exact" }).eq("is_active", true),
    supabase.from("matches").select("*"),
  ]);

  if (playersResult.error) {
    throw playersResult.error;
  }

  if (matchesResult.error) {
    throw matchesResult.error;
  }

  const matches = (matchesResult.data || []) as MatchRecord[];
  const totalRounds = matches.length > 0 ? Math.max(...matches.map((m) => m.round_number)) : 0;
  const gamesPlayed = matches.filter((m) => !isPendingMatch(m)).length;

  return {
    totalPlayers: playersResult.count ?? 0,
    totalGames: matches.length,
    totalRounds,
    gamesPlayed,
  };
}
