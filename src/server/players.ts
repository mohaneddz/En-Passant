import { supabase } from "@/lib/supabase/client";
import { Player } from "@/types/player";
import { derivePlayers, PlayerRow, sortByStandings } from "./tournament";
import { MatchRecord } from "@/types/game";

async function fetchAllPlayersRows(): Promise<PlayerRow[]> {
  const { data, error } = await supabase.from("players").select("*");

  if (error) {
    throw error;
  }

  return (data || []) as PlayerRow[];
}

async function fetchAllMatchesRows(): Promise<MatchRecord[]> {
  const { data, error } = await supabase.from("matches").select("*");

  if (error) {
    throw error;
  }

  return (data || []) as MatchRecord[];
}

export async function getPlayers(): Promise<Player[]> {
  const [playersRows, matchesRows] = await Promise.all([
    fetchAllPlayersRows(),
    fetchAllMatchesRows(),
  ]);

  return sortByStandings(derivePlayers(playersRows, matchesRows));
}

export async function addPlayer(name: string, rating = 1200) {
  const fullName = name.trim();
  if (!fullName) {
    throw new Error("Full name is required");
  }

  const normalizedElo = Number.isFinite(rating) ? Math.max(0, Math.floor(rating)) : 1200;

  const { data, error } = await supabase
    .from("players")
    .insert([{ full_name: fullName, elo: normalizedElo }])
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePlayer(id: number) {
  const { data, error } = await supabase
    .from("players")
    .update({ is_active: false })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function restorePlayer(id: number) {
  const { data, error } = await supabase
    .from("players")
    .update({ is_active: true })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function markAbsent(id: number) {
  const { data, error } = await supabase
    .from("players")
    .update({ is_present: false })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function markPresent(id: number) {
  const { data, error } = await supabase
    .from("players")
    .update({ is_present: true })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function editPlayer(data: Player) {
  const fullName = data.full_name?.trim() || data.name?.trim();
  const elo = Number.isFinite(data.elo) ? data.elo : data.rating;

  const { data: updatedData, error } = await supabase
    .from("players")
    .update({
      ...(fullName ? { full_name: fullName } : {}),
      ...(Number.isFinite(elo) ? { elo } : {}),
      is_active: data.is_active,
      is_present: data.is_present,
    })
    .eq("id", data.id)
    .select();

  if (error) {
    throw error;
  }

  return updatedData;
}

export async function getPlayerById(id: number): Promise<Player> {
  const [players, matches] = await Promise.all([fetchAllPlayersRows(), fetchAllMatchesRows()]);
  const derived = derivePlayers(players, matches).find((player) => player.id === id);

  if (!derived) {
    throw new Error("Player not found");
  }

  return derived;
}

export async function calculateScore(id: number): Promise<number> {
  const player = await getPlayerById(id);
  return player.score;
}

export async function calculateBuchholzScores(id: number): Promise<number> {
  const player = await getPlayerById(id);
  return player.buchholz;
}

export async function updatePlayerStreaks(): Promise<void> {
  // No-op in the new schema. Color streak is derived from match history.
}

export async function resetAllPlayers() {
  const { error: deleteMatchesError } = await supabase
    .from("matches")
    .delete()
    .gt("id", 0);

  if (deleteMatchesError) {
    throw deleteMatchesError;
  }

  const { data, error } = await supabase
    .from("players")
    .update({ is_active: true, is_present: true })
    .gt("id", 0)
    .select();

  if (error) {
    throw error;
  }

  return data;
}
