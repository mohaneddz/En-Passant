'use server';

import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

export async function generateNextRound() {
  try {
    // 1. Get current rounds to determine next round number
    const { count: roundCount, error: countError } = await supabase
      .from('rounds')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const nextRoundNumber = (roundCount || 0) + 1;

    // 2. Create the new round
    const { data: newRound, error: roundError } = await supabase
      .from('rounds')
      .insert([
        { 
          round_number: nextRoundNumber, 
          status: 'active', // Start as active
          is_current: true 
        }
      ])
      .select()
      .single();

    if (roundError) throw roundError;

    // 3. Update previous rounds to not be current (optional, but good practice)
    await supabase
      .from('rounds')
      .update({ is_current: false })
      .neq('id', newRound.id);

    // 4. Fetch Players
    // If Round 1: Just get active players
    // If Round 2+: Get players sorted by Score (from the leaderboard view)
    let { data: players, error: pError } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("is_active", true) // Only pair active players
      .order("points", { ascending: false })
      .order("buchholz", { ascending: false }); // Add secondary sort

    if (pError) throw pError;

    // 5. Handle Odd Numbers (The Bye)
    let byePlayer = null;
    if (players && players.length % 2 !== 0) {
      // In Swiss, the lowest ranked player gets the bye,
      // BUT we must check if they already had a bye.
      // (For simplicity here, we just take the last player in the list)
      byePlayer = players.pop();
    }

    // 6. Fetch Previous Games (To avoid repeats)
    const { data: history } = await supabase
      .from("games")
      .select("white_player_id, black_player_id");

    // Create a Set of "p1-p2" strings for fast lookup
    const playedSet = new Set();
    history?.forEach((g) => {
      playedSet.add(`${g.white_player_id}-${g.black_player_id}`);
      playedSet.add(`${g.black_player_id}-${g.white_player_id}`);
    });

    // 7. The Pairing Algorithm
    const pairings = [];
    const assigned = new Set();

    if (players) {
      // If Round 1, Shuffle randomly first
      if (nextRoundNumber === 1) {
        players.sort(() => Math.random() - 0.5);
      }

      for (let i = 0; i < players.length; i++) {
        if (assigned.has(players[i].id)) continue;

        const p1 = players[i];
        let paired = false;

        // Look for the next best opponent
        for (let j = i + 1; j < players.length; j++) {
          if (assigned.has(players[j].id)) continue;

          const p2 = players[j];

          // Check if they played before
          const pairKey = `${p1.id}-${p2.id}`;
          if (!playedSet.has(pairKey)) {
            // Valid Pairing Found
            pairings.push({
              round_id: newRound.id,
              white_player_id: p1.id,
              black_player_id: p2.id,
              result: 'scheduled', // Default result
            });
            assigned.add(p1.id);
            assigned.add(p2.id);
            paired = true;
            break;
          }
        }

        // Fallback: If p1 matches nobody (rare in huge pools, possible in small ones),
        // specific Swiss logic requires complex backtracking.
        // For this MVP, if not paired, they might just sit out or we force pair.
        // For now, we'll log it or leave them unpaired (which is bad, but MVP).
        if (!paired) {
            console.warn(`Could not pair player ${p1.name} (${p1.id})`);
        }
      }
    }

    // 8. Add the Bye (if exists)
    if (byePlayer) {
      pairings.push({
        round_id: newRound.id,
        white_player_id: byePlayer.id,
        black_player_id: null,
        result: "bye",
      });
    }

    // 9. Insert into DB
    if (pairings.length > 0) {
      const { error: insertError } = await supabase
        .from('games')
        .insert(pairings);
      
      if (insertError) throw insertError;
    }

    // Notify the API route to generate pairings
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/generate-pairing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roundNumber: nextRoundNumber }),
    });

    if (!response.ok) {
      throw new Error('Failed to notify pairing generation');
    }

    revalidatePath('/dashboard');
    return { success: true, message: `Round ${nextRoundNumber} created successfully` };

  } catch (error: any) {
    console.error('Error generating round:', error);
    return { success: false, error: error.message };
  }
}

export async function undoLastRound() {
  try {
    // 1. Find the latest round
    const { data: latestRound, error: fetchError } = await supabase
      .from('rounds')
      .select('*')
      .order('round_number', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) throw fetchError;
    if (!latestRound) return { success: false, message: 'No rounds to undo' };

    // 2. Delete the round (Cascade should handle games)
    const { error: deleteError } = await supabase
      .from('rounds')
      .delete()
      .eq('id', latestRound.id);

    if (deleteError) throw deleteError;

    // 3. Set the previous round (if any) to current
    const { data: previousRound } = await supabase
        .from('rounds')
        .select('*')
        .order('round_number', { ascending: false })
        .limit(1)
        .single();
    
    if (previousRound) {
        await supabase
            .from('rounds')
            .update({ is_current: true })
            .eq('id', previousRound.id);
    }

    revalidatePath('/dashboard');
    return { success: true, message: `Round ${latestRound.round_number} undone successfully` };

  } catch (error: any) {
    console.error('Error undoing round:', error);
    return { success: false, error: error.message };
  }
}
