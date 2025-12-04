import { createServerSideClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const supabase = await createServerSideClient();
    const body = await req.json();
    const roundId = body.roundId;
    const roundNumber = Number(body.roundNumber);

    if (!roundId) {
      return NextResponse.json({ error: "roundId is required" }, { status: 400 });
    }

    // 1. Delete games for this round
    const { error: deleteError } = await supabase
      .from('games')
      .delete()
      .eq('round_id', roundId);

    if (deleteError) {
      console.error("Error deleting games:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // 2. Reset round status to 'Pending' (or whatever the initial state is)
    // Assuming we want to allow re-generation
    const { error: updateError } = await supabase
      .from('rounds')
      .update({ status: 'Pending' }) // Or 'Created' depending on your schema
      .eq('id', roundId);

    if (updateError) {
        console.error("Error updating round status:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 3. If Round 1, reset leaderboard
    if (roundNumber === 1) {
        const { error: leaderboardError } = await supabase
            .from('leaderboard')
            .update({ 
                score: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                buchholz: 0
            })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows safely

        if (leaderboardError) {
            console.error("Error resetting leaderboard:", leaderboardError);
            return NextResponse.json({ error: leaderboardError.message }, { status: 400 });
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Undo route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
