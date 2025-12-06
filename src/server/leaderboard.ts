'use server';
import { supabase } from '@/lib/supabase/client';
import { calculateBuchholzScores } from './players';

export async function getLeaderboard() {
	const { data, error } = await supabase
		.from('players')
		.select('*')
		.eq('is_active', true)

	if (error) {
		throw new Error('Failed to fetch leaderboard data');
	}

	// Calculate score and Buchholz scores dynamically
	const leaderboard = await Promise.all(
		data.map(async (player) => {
			const score = (player.wins || 0) + (player.byes || 0) + (player.draws || 0) * 0.5;
			const buchholz = await calculateBuchholzScores(player.id);
			return {
				...player,
				score,
				buchholz,
			};
		})
	);

	return leaderboard;
}
