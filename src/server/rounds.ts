'use server';
import { supabase } from '@/lib/supabase/client';

export async function getRounds() {
    const { data, error } = await supabase
        .from('rounds')
        .select(`
            id,
            round_number,
            status,
            games (
                id,
                result,
                white_player:white_player_id (name),
                black_player:black_player_id (name)
            )
        `)
        .order('round_number', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    const result = data.map((round) => ({
        id: round.id,
        label: `Round ${round.round_number}`,
        status: mapRoundStatus(round.status),
        games: round.games.map((game: any, index: number) => {
            const { text, color } = mapGameResult(game.result);
            return {
                gameNumber: index + 1,
                whitePlayer: game.white_player?.name ?? 'Unknown',
                blackPlayer: game.black_player?.name ?? 'Unknown',
                status: text,
                statusColor: color
            };
        })
    }));
    return result;
}

function mapRoundStatus(status: string | null) {
    switch (status) {
        case 'active': return 'In progress';
        case 'completed': return 'Completed';
        default: return 'Upcoming';
    }
}

function mapGameResult(result: string | null) {
    if (!result || result === 'scheduled') return { text: 'Scheduled', color: 'gray' };
    
    const r = result.toLowerCase();
    
    if (r === '1-0' || r === 'white_wins') return { text: 'White Wins', color: 'green' };
    if (r === '0-1' || r === 'black_wins') return { text: 'Black Wins', color: 'red' };
    if (r === '1/2-1/2' || r === 'draw') return { text: 'Draw', color: 'gray' };
    if (r === 'live') return { text: 'Live', color: undefined };

    return { text: result, color: 'gray' };
}
