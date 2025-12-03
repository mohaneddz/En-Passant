'use server';
import { supabase } from '@/lib/supabase/client';

export async function getLeaderboard() {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false })
    if (error) {
        throw new Error(error.message);
    }
    return data;
}
