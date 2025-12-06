import { supabase } from '@/lib/supabase/client';
import { Player } from '@/types/player';


export async function updateGameResult(
    gameId: number,
    result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' | 'PENDING',
    is_bye: boolean,
    whiteId: number,
    blackId: number,
    presence: number
) {
    // 1. Fetch current game state to know what to undo
    const { data: currentGame, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

    if (gameError || !currentGame) {
        console.error('Error fetching game:', gameError);
        throw new Error('Failed to fetch game');
    }

    // 2. Fetch current player data
    const whitePlayerData = await supabase.from('players').select('*').eq('id', whiteId).single();
    const blackPlayerData = await supabase.from('players').select('*').eq('id', blackId).single();

    if (!whitePlayerData.data || !blackPlayerData.data) {
        console.error('Error fetching players');
        throw new Error('Failed to fetch players');
    }

    const whitePlayer = whitePlayerData.data;
    const blackPlayer = blackPlayerData.data;

    // Initialize stat changes (will accumulate undo + new)
    let whiteUpdates: any = {};
    let blackUpdates: any = {};

    // 3. UNDO LOGIC - Revert the old game state if it wasn't PENDING
    const oldStatus = currentGame.status;
    const oldPresence = currentGame.presence || 2;
    
    if (oldStatus !== 'PENDING') {
        // Revert wins/losses/draws based on old status
        if (oldStatus === 'WHITE_WINS') {
            whiteUpdates.wins = Math.max(0, whitePlayer.wins - 1);
            blackUpdates.losses = Math.max(0, blackPlayer.losses - 1);
            
            // If old game was a bye, remove bye point
            if (oldPresence < 2) {
                whiteUpdates.byes = Math.max(0, whitePlayer.byes - 1);
            }
        } else if (oldStatus === 'BLACK_WINS') {
            blackUpdates.wins = Math.max(0, blackPlayer.wins - 1);
            whiteUpdates.losses = Math.max(0, whitePlayer.losses - 1);
            
            // If old game was a bye, remove bye point
            if (oldPresence < 2) {
                blackUpdates.byes = Math.max(0, blackPlayer.byes - 1);
            }
        } else if (oldStatus === 'DRAW') {
            whiteUpdates.draws = Math.max(0, whitePlayer.draws - 1);
            blackUpdates.draws = Math.max(0, blackPlayer.draws - 1);
        }

        // Don't revert opponents or games count - they played regardless
        // Opponents list stays (they did face each other)
        // Games count stays (the game happened)
    }

    // 4. APPLY NEW LOGIC - Add new result stats
    if (result === 'WHITE_WINS') {
        whiteUpdates.wins = (whiteUpdates.wins !== undefined ? whiteUpdates.wins : whitePlayer.wins) + 1;
        blackUpdates.losses = (blackUpdates.losses !== undefined ? blackUpdates.losses : blackPlayer.losses) + 1;
        
        // If new game is a bye, add bye point
        if (is_bye) {
            whiteUpdates.byes = (whiteUpdates.byes !== undefined ? whiteUpdates.byes : whitePlayer.byes) + 1;
        }
    } else if (result === 'BLACK_WINS') {
        blackUpdates.wins = (blackUpdates.wins !== undefined ? blackUpdates.wins : blackPlayer.wins) + 1;
        whiteUpdates.losses = (whiteUpdates.losses !== undefined ? whiteUpdates.losses : whitePlayer.losses) + 1;
        
        // If new game is a bye, add bye point
        if (is_bye) {
            blackUpdates.byes = (blackUpdates.byes !== undefined ? blackUpdates.byes : blackPlayer.byes) + 1;
        }
    } else if (result === 'DRAW') {
        whiteUpdates.draws = (whiteUpdates.draws !== undefined ? whiteUpdates.draws : whitePlayer.draws) + 1;
        blackUpdates.draws = (blackUpdates.draws !== undefined ? blackUpdates.draws : blackPlayer.draws) + 1;
    }

    // 5. Update game status and presence in database
    const { error: updateError } = await supabase
        .from('games')
        .update({ status: result, presence: presence })
        .eq('id', gameId);

    if (updateError) {
        console.error('Error updating game:', updateError);
        throw new Error('Failed to update game');
    }

    // 6. Update white player stats
    if (Object.keys(whiteUpdates).length > 0) {
        const { error: whiteError } = await supabase
            .from('players')
            .update(whiteUpdates)
            .eq('id', whiteId);

        if (whiteError) {
            console.error('Error updating white player:', whiteError);
            throw new Error('Failed to update white player');
        }
    }

    // 7. Update black player stats
    if (Object.keys(blackUpdates).length > 0) {
        const { error: blackError } = await supabase
            .from('players')
            .update(blackUpdates)
            .eq('id', blackId);

        if (blackError) {
            console.error('Error updating black player:', blackError);
            throw new Error('Failed to update black player');
        }
    }

    return { success: true };
}

