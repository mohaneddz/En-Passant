// BUT HERE THE OTHER METHOD WITH NO API???
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

export type Player = Database['public']['Tables']['players']['Row'];
export type Leaderboard = Database['public']['Tables']['leaderboard']['Row']
export type Round = Database['public']['Tables']['rounds']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];

export type LeaderboardView = Database['public']['Views']['leaderboard']['Row'];

// --- Players ---

/**
 * Fetches all active players from the leaderboard view.
 * Ordered by points (desc), buchholz (desc), and wins (desc).
 */
export const getPlayers = async () => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('points', { ascending: false })
    .order('buchholz', { ascending: false })
    .order('wins', { ascending: false });

  if (error) throw error;
  return data as LeaderboardView[];
};

/**
 * Adds a new player to the tournament.
 */
export const addPlayer = async (name: string, rating: number = 1000) => {
  const { data, error } = await supabase
    .from('players')
    .insert([{ name, rating, is_active: true }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Updates a player's details.
 */
export const updatePlayer = async (id: string, updates: Partial<Player>) => {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Soft deletes a player by setting is_active to false.
 */
export const deletePlayer = async (id: string) => {
  const { data, error } = await supabase
    .from('players')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- Rounds ---

/**
 * Fetches all rounds ordered by round number.
 */
export const getRounds = async () => {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .order('round_number', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Creates a new round.
 */
export const createRound = async (roundNumber: number) => {
  const { data, error } = await supabase
    .from('rounds')
    .insert([{ round_number: roundNumber, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Gets the current active round.
 */
export const getCurrentRound = async () => {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('is_current', true)
    .single();
  if (error && error.code == 'PGRST116') return null;
  if (error) throw error;
  return data;
};

// --- Games ---

/**
 * Fetches games for a specific round, including player names.
 */
export const getGames = async (roundId: string) => {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      white_player:players!white_player_id(name),
      black_player:players!black_player_id(name)
    `)
    .eq('round_id', roundId);

  if (error) throw error;
  return data;
};

/**
 * Updates the result of a game.
 */
export const updateGameResult = async (gameId: string, result: Database['public']['Enums']['game_result']) => {
  const { data, error } = await supabase
    .from('games')
    .update({ result })
    .eq('id', gameId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * get Stats
 */

export const getStats = async () => {
  const { count: totalPlayers, error } = await supabase
    .from('players')
    .select('*', {count: 'exact'});
    const {count: totalRounds} = await supabase
    .from('rounds')
    .select('*', {count: 'exact'})
    
    const {count: gamesPlayed} = await supabase
    .from('games')
    .select('*', {count: 'exact'})
    const currentRound = await getCurrentRound();
  if (error) throw error;
  return {totalPlayers, totalRounds, gamesPlayed, currentRound: currentRound?.round_number};
};

// --- Leaderboard ---

export const addLeaderboardEntry = async (playerId: string) => {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{ id: playerId, name: '', points: 0, wins: 0, losses: 0, draws: 0, buchholz: 0, is_active: true }])
    .select()
    .single();
  if (error) throw error;
  return data;
}