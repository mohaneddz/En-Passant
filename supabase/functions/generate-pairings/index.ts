import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Database } from '../../../src/lib/supabase/database.types.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get all active players sorted by score (Swiss)
    const { data: players, error: playersError } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('buchholz', { ascending: false })
      .order('wins', { ascending: false })

    if (playersError) throw playersError

    // Filter active players
    const { data: activePlayersDetails, error: activeError } = await supabase
      .from('players')
      .select('id, is_active')
      .eq('is_active', true)
    
    if (activeError) throw activeError

    const activeIds = new Set(activePlayersDetails.map(p => p.id))
    const activePlayers = players.filter(p => activeIds.has(p.id))

    // 2. Get history
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('white_player_id, black_player_id, result')
    
    if (gamesError) throw gamesError

    const playedAgainst = new Map<string, Set<string>>()
    const receivedBye = new Set<string>()

    games.forEach(game => {
      if (game.result === 'bye') {
        if (game.white_player_id) receivedBye.add(game.white_player_id)
        if (game.black_player_id) receivedBye.add(game.black_player_id)
      } else {
        if (game.white_player_id && game.black_player_id) {
             if (!playedAgainst.has(game.white_player_id)) playedAgainst.set(game.white_player_id, new Set())
             if (!playedAgainst.has(game.black_player_id)) playedAgainst.set(game.black_player_id, new Set())
             playedAgainst.get(game.white_player_id)!.add(game.black_player_id)
             playedAgainst.get(game.black_player_id)!.add(game.white_player_id)
        }
      }
    })

    // 3. Determine Round
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('round_number')
      .order('round_number', { ascending: false })
      .limit(1)
    
    if (roundsError) throw roundsError
    
    const nextRoundNumber = (rounds?.[0]?.round_number ?? 0) + 1

    // 4. Pairing
    const pairings: { white: string; black: string | null; result?: string }[] = []
    
    // Handle Bye
    if (activePlayers.length % 2 !== 0) {
      let byeIndex = activePlayers.length - 1
      while (byeIndex >= 0) {
        if (!receivedBye.has(activePlayers[byeIndex].id)) break
        byeIndex--
      }
      if (byeIndex < 0) byeIndex = activePlayers.length - 1
      
      const byePlayer = activePlayers[byeIndex]
      pairings.push({ white: byePlayer.id, black: null, result: 'bye' })
      activePlayers.splice(byeIndex, 1)
    }

    const pairedIds = new Set<string>()
    
    for (let i = 0; i < activePlayers.length; i++) {
      const p1 = activePlayers[i]
      if (pairedIds.has(p1.id)) continue

      let paired = false
      for (let j = i + 1; j < activePlayers.length; j++) {
        const p2 = activePlayers[j]
        if (pairedIds.has(p2.id)) continue

        const p1Played = playedAgainst.get(p1.id)
        if (!p1Played || !p1Played.has(p2.id)) {
          pairings.push({ white: p1.id, black: p2.id })
          pairedIds.add(p1.id)
          pairedIds.add(p2.id)
          paired = true
          break
        }
      }

      if (!paired) {
        // Fallback
        for (let j = i + 1; j < activePlayers.length; j++) {
            const p2 = activePlayers[j]
            if (pairedIds.has(p2.id)) continue
            pairings.push({ white: p1.id, black: p2.id })
            pairedIds.add(p1.id)
            pairedIds.add(p2.id)
            paired = true
            break
        }
      }
    }

    // 5. Save
    const { data: newRound, error: newRoundError } = await supabase
        .from('rounds')
        .insert({ round_number: nextRoundNumber, status: 'active', is_current: true })
        .select()
        .single()

    if (newRoundError) throw newRoundError

    await supabase
        .from('rounds')
        .update({ is_current: false })
        .neq('id', newRound.id)

    const gamesToInsert = pairings.map(p => ({
        round_id: newRound.id,
        white_player_id: p.white,
        black_player_id: p.black,
        result: p.result || 'scheduled'
    }))

    const { error: insertError } = await supabase
        .from('games')
        .insert(gamesToInsert)

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ success: true, round: newRound, pairings: gamesToInsert }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
