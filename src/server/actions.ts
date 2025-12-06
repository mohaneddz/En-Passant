import { supabase } from '@/lib/supabase/client';
// import { revalidatePath } from 'next/cache';
import { getPlayers, updatePlayerStreaks } from './players';
import { generatePairings, assignMatchColors, calculateNextStreak } from './games';

export async function generateNextRound() {
	try {
        // 1. Fetch Players
        const players = await getPlayers();
        if (!players || players.length < 2) {
            return { success: false, error: 'Not enough players to generate a round' };
        }

        // 2. Generate Pairings
        const { pairs, bye } = generatePairings(players);

        // 3. Prepare Data
        const matchesToInsert = [];
        const streakUpdates: { playerId: number, newStreak: number }[] = [];

        // Determine current round number
        const { data: maxRoundData } = await supabase
            .from('games')
            .select('round')
            .order('round', { ascending: false })
            .limit(1)
            .single();
        
        const nextRound = (maxRoundData?.round || 0) + 1;

        for (const pair of pairs) {
            // Assign Colors
            const { white, black } = assignMatchColors(pair.p1, pair.p2);

            // Create Match Record
            matchesToInsert.push({
                white: white.id,
                black: black.id,
                round: nextRound,
                status: 'scheduled',
            });

            // Calculate New Streaks
            const whiteNewStreak = calculateNextStreak(white.color_streak || 0, 'white');
            const blackNewStreak = calculateNextStreak(black.color_streak || 0, 'black');

            streakUpdates.push({ playerId: white.id, newStreak: whiteNewStreak });
            streakUpdates.push({ playerId: black.id, newStreak: blackNewStreak });
        }

        // Handle Bye
        if (bye) {
            matchesToInsert.push({
                white: bye.id,
                black: null, // Assuming nullable for Bye
                round: nextRound,
                status: 'bye',
                result: '1-0' // Auto-win for bye
            });
            // Bye gives no color change, so we don't add to streakUpdates
        }

        // 4. Execute DB Operations
        
        // Insert Matches
        const { error: matchError } = await supabase
            .from('games')
            .insert(matchesToInsert);
        
        if (matchError) throw matchError;

        // Update Streaks
        if (streakUpdates.length > 0) {
            await updatePlayerStreaks(streakUpdates);
        }

        // revalidatePath('/dashboard');
        // revalidatePath('/games');
        
        return { success: true };

	} catch (error) {
		console.error('Error generating next round:', error);
		return { success: false, error };
	}
}
