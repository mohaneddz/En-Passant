import { supabase } from '@/lib/supabase/client';

export interface StatsGridProps {
  stats: {
    totalPlayers: number | null;
    totalGames: number | null;
    totalRounds: number | null;
    gamesPlayed: number | null;
  };
}

export async function getStats() {

    const { data: playersData, error: playersDrror } = await supabase.from('players').select('*');
	const { data: gamesData, error: gamesRrror } = await supabase.from('games').select('*');

  // console.log(playersData, gamesData);

    const result = {
        totalPlayers: playersData?.length,
        totalGames: gamesData?.length,
        totalRounds: (gamesData && gamesData.length > 0) ? Math.max(...gamesData.map((g) => g.round)) : 0,
        gamesPlayed: gamesData ? gamesData.filter((g) => g.result !== null).length : 0,
    }

    return result;
}
