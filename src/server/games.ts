import { supabase } from '@/lib/supabase/client';

const playerCache = new Map<number, Promise<string>>();

export async function getGames() {
    const { data, error } = await supabase
        .from('games')
        .select('id, white, black, status, presence, round');

    if (error) {
        console.error('Error fetching games:', error);
        throw new Error('Failed to fetch games data');
    }

    return data;
}

export function getPlayerNameById(id: number) {
    if (playerCache.has(id)) return playerCache.get(id)!;

    const promise = (async () => {
        const { data, error } = await supabase
            .from('players')
            .select('name')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching player name:', error);
            return 'Unknown Player';
        }
        return data?.name || 'Unknown Player';
    })();

    playerCache.set(id, promise);
    return promise;
}