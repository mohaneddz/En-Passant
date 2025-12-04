// supabase/functions/generate-pairings/index.ts
import { createServerSideClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const supabase = await createServerSideClient();
    const body = await req.json();
    const roundNumber = Number(body.roundNumber);
    const roundId = body.roundId;

    console.log(`Generating pairings for Round ${roundNumber} (ID: ${roundId})`);

    if (!roundId) {
      return NextResponse.json({ error: "roundId is required" }, { status: 400 });
    }

    // 2. Fetch Players
    let players = [];
    let pError = null;

    if (roundNumber === 1) {
      // Round 1: Fetch from players table directly
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('is_active', true)
      players = data || [];
      pError = error;
    } else {
      // Round 2+: Fetch from leaderboard
      const { data, error } = await supabase
        .from('leaderboard') 
        .select('*')
        .eq('is_active', true) 
        .order('points', { ascending: false })
      players = data || [];
      pError = error;
    }
      
    if (pError) {
        console.error("Error fetching players:", pError);
        return NextResponse.json({ error: `Database error fetching players: ${pError.message}` }, { status: 400 });
    }

    // Normalize players to ensure they have an 'id' property (leaderboard view might use player_id)
    players = players.map(p => ({
      ...p,
      id: p.id || p.player_id
    }));
    
    if (players.length === 0) {
       return NextResponse.json({ error: "No active players found. Ensure players are added and active." }, { status: 400 });
    }

    // 3. Handle Odd Numbers (The Bye)
    let byePlayer = null;
    if (players.length % 2 !== 0) {
      byePlayer = players.pop(); 
    }

    // 4. Fetch Previous Games
    const { data: history } = await supabase
      .from('games')
      .select('white_player_id, black_player_id')
    
    const playedSet = new Set();
    history?.forEach(g => {
      playedSet.add(`${g.white_player_id}-${g.black_player_id}`);
      playedSet.add(`${g.black_player_id}-${g.white_player_id}`);
    });

    // 5. The Pairing Algorithm
    const pairings = [];
    const assigned = new Set();

    if (roundNumber === 1) {
      players.sort(() => Math.random() - 0.5);
    }

    for (let i = 0; i < players.length; i++) {
      if (assigned.has(players[i].id)) continue;

      const p1 = players[i];
      let paired = false;

      for (let j = i + 1; j < players.length; j++) {
        if (assigned.has(players[j].id)) continue;
        const p2 = players[j];
        
        const pairKey = `${p1.id}-${p2.id}`;
        if (!playedSet.has(pairKey)) {
          pairings.push({
            round_id: roundId, 
            white_player_id: p1.id, 
            black_player_id: p2.id,
            result: 'draw'
          });
          assigned.add(p1.id);
          assigned.add(p2.id);
          paired = true;
          break;
        }
      }
      
      // Fallback: Pair with next available if strict pairing fails
      if (!paired) {
        for (let j = i + 1; j < players.length; j++) {
            if (assigned.has(players[j].id)) continue;
            const p2 = players[j];
            pairings.push({
                round_id: roundId, 
                white_player_id: p1.id, 
                black_player_id: p2.id,
                result: 'draw'
            });
            assigned.add(p1.id);
            assigned.add(p2.id);
            paired = true;
            break;
        }
      }
    }

    // 6. Add the Bye
    if (byePlayer) {
      pairings.push({
        round_id: roundId,
        white_player_id: byePlayer.id,
        black_player_id: null, 
        result: 'bye'
      });
    }

    // 7. Insert into DB
    if (pairings.length > 0) {
      const { error: insertError } = await supabase
        .from('games')
        .insert(pairings)
        .select()
      
      if(insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json({ success: false, error: `Failed to insert pairings: ${insertError.message}` }, { status: 400 });
      }
    }

    // Reset all rounds is_current to false
    await supabase.from('rounds').update({ is_current: false }).neq('id', roundId);

    // Ensure previous active rounds are marked as completed
    await supabase.from('rounds').update({ status: 'Completed' }).neq('id', roundId).eq('status', 'Active');

    // Update round status to 'Active' and set is_current to true
    await supabase.from('rounds').update({ status: 'Active', is_current: true }).eq('id', roundId);

    return NextResponse.json({ success: true, pairings });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}