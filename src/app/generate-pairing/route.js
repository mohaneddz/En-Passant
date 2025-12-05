// supabase/functions/generate-pairings/index.ts
import { supabase } from "@/lib/supabase/client";
export async function POST(req) {
  const { roundNumber, roundId } = await req.json();

  // 2. Fetch Players
  // If Round 1: Just get active players
  // If Round 2+: Get players sorted by Score (from the leaderboard view)
  let { data: players, error: pError } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("is_active", true) // Only pair active players
    .order("points", { ascending: false }); // Higher scores first (Swiss rule)

  if (pError)
    return new Response(JSON.stringify({ error: pError }), { status: 400 });

  // 3. Handle Odd Numbers (The Bye)
  let byePlayer = null;
  if (players.length % 2 !== 0) {
    // In Swiss, the lowest ranked player gets the bye,
    // BUT we must check if they already had a bye.
    // (For simplicity here, we just take the last player in the list)
    byePlayer = players.pop();
  }

  // 4. Fetch Previous Games (To avoid repeats)
  const { data: history } = await supabase
    .from("games")
    .select("white_player_id, black_player_id");

  // Create a Set of "p1-p2" strings for fast lookup
  const playedSet = new Set();
  history?.forEach((g) => {
    playedSet.add(`${g.white_player_id}-${g.black_player_id}`);
    playedSet.add(`${g.black_player_id}-${g.white_player_id}`);
  });

  // 5. The Pairing Algorithm
  const pairings = [];
  const assigned = new Set();

  // If Round 1, Shuffle randomly first (Optional, but recommended)
  if (roundNumber === 1) {
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
          round_id: roundId,
          white_player_id: p1.id,
          black_player_id: p2.id,
          white_name: p1.name,
          black_name: p2.name,
          white_score: p1.points,
          black_score: p2.points,
          result: Math.random() > 0.5 ? "white_wins" : "black_wins",
        });
        assigned.add(p1.id);
        assigned.add(p2.id);
        paired = true;
        break;
      }
    }

    // Fallback: If p1 matches nobody (rare in huge pools, possible in small ones),
    // specific Swiss logic requires complex backtracking.
    // For this MVP, you might need a "force pair" or manual intervention flag.
  }

  // 6. Add the Bye (if exists)
  if (byePlayer) {
    pairings.push({
      round_id: roundId,
      white_player_id: byePlayer.id,
      black_player_id: null,
      result: "bye",
    });
  }

  //   7. Insert into DB
  //   const { error: insertError } = await supabase
  //     .from('games')
  //     .insert(pairings)
  //   if(insertError) return new Response(JSON.stringify({ success: false, error: insertError }), {
  //     headers: { "Content-Type": "application/json" },
  //   })
  return new Response(JSON.stringify({ success: true, pairings }), {
    headers: { "Content-Type": "application/json" },
  });
}
