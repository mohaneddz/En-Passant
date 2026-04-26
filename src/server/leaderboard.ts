import { supabase } from "@/lib/supabase/client";
import { MatchRecord } from "@/types/game";
import { derivePlayers, PlayerRow, sortByStandings } from "./tournament";

export async function getLeaderboard() {
  const [playersResult, matchesResult] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("matches").select("*"),
  ]);

  if (playersResult.error) {
    throw new Error(playersResult.error.message);
  }

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  const players = derivePlayers(
    (playersResult.data || []) as PlayerRow[],
    (matchesResult.data || []) as MatchRecord[]
  ).filter((player) => player.is_active);

  return sortByStandings(players).map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}
