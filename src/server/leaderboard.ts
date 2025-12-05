'use server';
import { supabase } from '@/lib/supabase/client';

export async function getLeaderboard() {
	const { data, error } = await supabase
		.from('players')
		.select('*')
		.eq('is_active', true)

	if (error) {
		throw new Error('Failed to fetch leaderboard data');
	}

	// Calculate score dynamically: wins + byes + 0.5 * draws
	const leaderboard = data.map((player) => ({
		...player,
		score: (player.wins || 0) + (player.byes || 0) + (player.draws || 0) * 0.5,
	}));

	return leaderboard;
}
