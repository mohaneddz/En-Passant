import { supabase } from '@/lib/supabase/client';
import { Player } from '@/types/player';

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

export async function getCurrentRound() {
  const { data, error } = await supabase
    .from('games')
    .select('round')
    .order('round', { ascending: false })
    .limit(1);

  if (error){
    // console.error('Error fetching current round:', error);
    throw new Error('Failed to fetch current round');
  }

  return data?.[0]?.round ?? 0;
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

// --- Color Logic ---

export type ColorPreference = 'MUST_WHITE' | 'MUST_BLACK' | 'PREFER_WHITE' | 'PREFER_BLACK' | 'NEUTRAL';

export function getColorPreference(streak: number): ColorPreference {
    if (streak >= 2) return 'MUST_BLACK';
    if (streak <= -2) return 'MUST_WHITE';
    if (streak === 1) return 'PREFER_BLACK';
    if (streak === -1) return 'PREFER_WHITE';
    return 'NEUTRAL';
}

export function isColorCompatible(p1Streak: number, p2Streak: number): boolean {
    const p1Pref = getColorPreference(p1Streak);
    const p2Pref = getColorPreference(p2Streak);

    // Incompatible if both MUST play the same color
    if (p1Pref === 'MUST_WHITE' && p2Pref === 'MUST_WHITE') return false;
    if (p1Pref === 'MUST_BLACK' && p2Pref === 'MUST_BLACK') return false;

    return true;
}

export function calculateNextStreak(currentStreak: number, assignedColor: 'white' | 'black'): number {
    if (assignedColor === 'white') {
        // If already +1 (white last game), becomes +2. Otherwise +1.
        return currentStreak === 1 ? 2 : 1;
    } else {
        // If already -1 (black last game), becomes -2. Otherwise -1.
        return currentStreak === -1 ? -2 : -1;
    }
}

export function assignMatchColors(p1: Player, p2: Player): { white: Player; black: Player } {
    const p1Pref = getColorPreference(p1.color_streak);
    const p2Pref = getColorPreference(p2.color_streak);

    // 1. Handle Forced Constraints
    if (p1Pref === 'MUST_WHITE') return { white: p1, black: p2 };
    if (p1Pref === 'MUST_BLACK') return { white: p2, black: p1 };
    if (p2Pref === 'MUST_WHITE') return { white: p2, black: p1 };
    if (p2Pref === 'MUST_BLACK') return { white: p1, black: p2 };

    // 2. Handle Preferences (Perfect Match)
    // One prefers white, one prefers black
    if (p1Pref === 'PREFER_WHITE' && p2Pref === 'PREFER_BLACK') return { white: p1, black: p2 };
    if (p1Pref === 'PREFER_BLACK' && p2Pref === 'PREFER_WHITE') return { white: p2, black: p1 };

    // 3. Handle Same Preferences (Conflict) or Neutral
    // If p1Streak > p2Streak (e.g. p1=+1, p2=0). p1 needs Black more. p2 is neutral.
    // p1 plays Black (-1), p2 plays White (+1).
    
    if (p1.color_streak > p2.color_streak) {
        // p1 is more "positive" (more whites), so p1 should play Black.
        return { white: p2, black: p1 };
    }
    if (p2.color_streak > p1.color_streak) {
        // p2 is more "positive", so p2 should play Black.
        return { white: p1, black: p2 };
    }

    // If streaks are equal (e.g. 0 vs 0, or +1 vs +1)
    // Randomly assign or use ID/Rating as deterministic tie breaker.
    // Using random for fairness if no other metric.
    return Math.random() < 0.5 ? { white: p1, black: p2 } : { white: p2, black: p1 };
}

export function generatePairings(players: Player[]): { pairs: { p1: Player, p2: Player }[], bye: Player | null } {
    // Sort by Score (desc), then Rating (desc)
    let workingPlayers = [...players].sort((a, b) => {
        if ((a.score || 0) !== (b.score || 0)) return (b.score || 0) - (a.score || 0);
        return Number(b.rating || 0) - Number(a.rating || 0);
    });

    let bye: Player | null = null;
    if (workingPlayers.length % 2 !== 0) {
        // Give bye to the lowest ranked player who hasn't had a bye yet
        for (let i = workingPlayers.length - 1; i >= 0; i--) {
            if (workingPlayers[i].byes === 0) {
                bye = workingPlayers[i];
                workingPlayers.splice(i, 1);
                break;
            }
        }
        // If everyone has had a bye, just take the last one.
        if (!bye) {
            bye = workingPlayers.pop()!;
        }
    }

    const pairs: { p1: Player, p2: Player }[] = [];
    const used = new Set<number>();

    for (let i = 0; i < workingPlayers.length; i++) {
        if (used.has(workingPlayers[i].id)) continue;

        const p1 = workingPlayers[i];
        let paired = false;

        for (let j = i + 1; j < workingPlayers.length; j++) {
            if (used.has(workingPlayers[j].id)) continue;
            const p2 = workingPlayers[j];

            // 1. Avoid Rematches
            // Note: opponents is bigint[], p2.id is number.
            if (p1.opponents && p1.opponents.some(opId => Number(opId) === p2.id)) continue;

            // 2. Color Compatibility
            if (!isColorCompatible(p1.color_streak, p2.color_streak)) continue;

            // Match found
            pairs.push({ p1, p2 });
            used.add(p1.id);
            used.add(p2.id);
            paired = true;
            break;
        }

        if (!paired) {
            console.error(`CRITICAL: Could not pair player ${p1.id} in greedy pass.`);
            // In a real implementation, we would backtrack here.
        }
    }

    return { pairs, bye };
}