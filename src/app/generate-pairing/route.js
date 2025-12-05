// supabase/functions/generate-pairings/index.ts
import { createServerSideClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// HINT: The error "Failed to parse URL from undefined/generate-pairing" is in the code calling this route.
// It implies a missing base URL variable. If calling from the client, use a relative path: fetch('/generate-pairing', ...)

export async function POST(req) {
  const supabase = createServerSideClient();
  
  // Safely parse body
  const body = await req.json().catch(() => ({}));
  console.log("Received body:", body);
  const { roundNumber } = body;

  if (!roundNumber) {
    console.error("Missing roundNumber in request");
    return NextResponse.json({ error: "Missing roundNumber" }, { status: 400 });
  }

  console.log(`Starting pairing generation for Round ${roundNumber}`);

  // Update all existing rounds to not current and completed
  await supabase
    .from('rounds')
    .update({ is_current: false, status: 'completed' });

  // Create new round
  console.log("Creating new round...");
  const { data: newRound, error: roundError } = await supabase
    .from('rounds')
    .insert([{ round_number: roundNumber, is_current: true, status: 'active' }])
    .select()
    .single();

  if (roundError) {
    console.error("Error creating round:", roundError);
    return NextResponse.json({ error: roundError }, { status: 400 });
  }

  const roundId = newRound.id;
  console.log(`New round created with ID: ${roundId}`);

  // 2. Fetch Players
  // If Round 1: Just get active players
  // If Round 2+: Get players sorted by Score (from the leaderboard view)
  console.log("Fetching players from leaderboard...");
  let { data: players, error: pError } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("is_active", true) // Only pair active players
    .order("points", { ascending: false }); // Higher scores first (Swiss rule)

  if (pError) {
    console.error("Error fetching players:", pError);
    return NextResponse.json({ error: pError }, { status: 400 });
  }
  
  console.log(`Fetched ${players.length} active players.`);

  // 3. Handle Odd Numbers (The Bye)
  let byePlayer = null;
  if (players.length % 2 !== 0) {
    // In Swiss, the lowest ranked player gets the bye,
    // BUT we must check if they already had a bye.
    // (For simplicity here, we just take the last player in the list)
    byePlayer = players.pop();
    console.log(`Odd number of players. Bye assigned to: ${byePlayer.id}`);
  }

  // 4. Fetch Previous Games (To avoid repeats)
  console.log("Fetching game history...");
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
  console.log("Starting pairing algorithm...");
  const pairings = [];
  const assigned = new Set();

  // If Round 1, Shuffle randomly first (Optional, but recommended)
  if (roundNumber === 1) {
    console.log("Round 1: Shuffling players randomly.");
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
        console.log(`Pairing found: ${p1.id} vs ${p2.id}`);
        pairings.push({
          round_id: roundId,
          white_player_id: p1.id,
          black_player_id: p2.id,
          result: null, // Set to null initially, not a random result
        });
        assigned.add(p1.id);
        assigned.add(p2.id);
        paired = true;
        break;
      }
    }

    // Fallback: If p1 matches nobody (rare in huge pools, possible in small ones),
    if (!paired) {
        console.warn(`Could not find a valid opponent for player ${p1.id}`);
    }
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

  console.log(`Generated ${pairings.length} pairings. Inserting into DB...`);

  // 7. Insert into DB
  const { error: insertError } = await supabase
    .from('games')
    .insert(pairings);
  if (insertError) {
    console.error("Error inserting pairings:", insertError);
    return NextResponse.json({ success: false, error: insertError }, { status: 500 });
  }
  
  console.log("Pairings inserted successfully.");
  return NextResponse.json({ success: true, roundId });
}
