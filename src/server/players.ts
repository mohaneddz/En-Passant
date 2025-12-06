import { Player } from '@/types/player';
import { supabase } from '@/lib/supabase/client';

export async function getPlayers() {
	const { data, error } = await supabase
		.from('players')
		.select('*')
		.order('wins', { ascending: false })
		.order('games', { ascending: false });
	if (error) {
		throw error;
	}
	return data;
}

export async function addPlayer(name: string, rating: number = 1200) {
	const { data, error } = await supabase.from('players').insert([{ name, rating }]);
	if (error) {
		throw error;
	}
	return data;
}

export async function deletePlayer(id: number) {
	const { data, error } = await supabase.from('players').update({ is_active: false }).eq('id', id);
	if (error) {
		throw error;
	}
	return data;
}

export async function restorePlayer(id: number) {
	const { data, error } = await supabase.from('players').update({ is_active: true }).eq('id', id);
	if (error) {
		throw error;
	}
	return data;
}

export async function markAbsent(id: number) {
	const { data, error } = await supabase.from('players').update({ is_present: false }).eq('id', id);
	if (error) {
		throw error;
	}
	return data;
}

export async function markPresent(id: number) {
	const { data, error } = await supabase.from('players').update({ is_present: true }).eq('id', id);
	if (error) {
		throw error;
	}
	return data;
}


export async function editPlayer(data: Player) {
	const { data: updatedData, error } = await supabase.from('players').update(data).eq('id', data.id);
	if (error) {
		throw error;
	}
	return updatedData;
}

export async function getPlayerById(id: number) {
	const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
	if (error) {
		throw error;
	}
	return data;
}

export async function calculateScore(id: number) {
	const { data, error } = await supabase.from('players').select('wins, draws, byes').eq('id', id).single();
	
    if (error) {
		throw error;
	}

	const result = (data.wins || 0) + (data.byes || 0) + (data.draws || 0) * 0.5;

	return result;
}

export async function calculateBuchholzScores(id: number) {
	const { data, error } = await supabase.from('players').select('opponents').eq('id', id).single();

    if (error) {
		throw error;
	}

    if (!data.opponents || data.opponents.length === 0) {
        return 0;
    }

    // Fetch all opponents' stats in one query instead of looping
    const { data: opponentsData, error: oppError } = await supabase
        .from('players')
        .select('wins, draws, byes')
        .in('id', data.opponents);

    if (oppError) {
        throw oppError;
    }

    // Calculate sum of opponents' scores
    const result = opponentsData.reduce((acc, curr) => {
        const score = (curr.wins || 0) + (curr.byes || 0) + (curr.draws || 0) * 0.5;
        return acc + score;
    }, 0);

	return result;
}

export async function updatePlayerStreaks(updates: { playerId: number, newStreak: number }[]) {
    // Perform updates in parallel
    const promises = updates.map(({ playerId, newStreak }) => 
        supabase
            .from('players')
            .update({ olor: newStreak })
            .eq('id', playerId)
    );

    const results = await Promise.all(promises);
    
    // Check for errors
    const errors = results.filter(r => r.error).map(r => r.error);
    if (errors.length > 0) {
        console.error('Errors updating player streaks:', errors);
        throw new Error('Failed to update some player streaks');
    }
}

export async function resetAllPlayers() {

	// # apply to all
	const { data, error } = await supabase.from('players').update({
		wins: 0,
		losses: 0,
		draws: 0,
		byes: 0,
		games: 0,
		opponents: [],
		color: 0,
		is_active: true,
	})
	.neq('id', 0); 
	
	if (error) {
		throw error;
	}
	return data;
}