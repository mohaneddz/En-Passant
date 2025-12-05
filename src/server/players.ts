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

export async function addPlayer(name: string) {
	const { data, error } = await supabase.from('players').insert([{ name }]);
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
