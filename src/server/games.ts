import { supabase } from '@/lib/supabase/client';
import { Player } from '@/types/player';

const playerCache = new Map<number, Promise<string>>();

export async function getGames() {
	const { data, error } = await supabase.from('games').select('id, white, black, status, presence, round');

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

	if (error) {
		// console.error('Error fetching current round:', error);
		throw new Error('Failed to fetch current round');
	}

	return data?.[0]?.round ?? 0;
}

export function getPlayerNameById(id: number) {
	if (playerCache.has(id)) return playerCache.get(id)!;

	const promise = (async () => {
		const { data, error } = await supabase.from('players').select('name').eq('id', id).single();
		if (error) {
			console.error('Error fetching player name:', error);
			return 'Unknown Player';
		}
		return data?.name || 'Unknown Player';
	})();

	playerCache.set(id, promise);
	return promise;
}

export async function deleteGameById(id: number) {
	// Fetch the game to be deleted
	const { data: game, error: gameError } = await supabase
		.from('games')
		.select('*')
		.eq('id', id)
		.single();

	if (gameError || !game) {
		console.error('Error fetching game:', gameError);
		throw new Error('Failed to fetch game');
	}

	// Fetch white and black players
	const { data: whitePlayer, error: whiteError } = await supabase
		.from('players')
		.select('*')
		.eq('id', game.white)
		.single();

	const { data: blackPlayer, error: blackError } = await supabase
		.from('players')
		.select('*')
		.eq('id', game.black)
		.single();

	if (whiteError || blackError || !whitePlayer || !blackPlayer) {
		console.error('Error fetching players:', whiteError, blackError);
		throw new Error('Failed to fetch players');
	}

	// Remove opponents from each other's lists
	const updatedWhiteOpponents = (whitePlayer.opponents || []).filter(
		(opId: number) => Number(opId) !== game.black
	);
	const updatedBlackOpponents = (blackPlayer.opponents || []).filter(
		(opId: number) => Number(opId) !== game.white
	);

	// Determine stat changes based on game status
	let whiteUpdates: any = {
		opponents: updatedWhiteOpponents,
		color: 0,
		games: Math.max(0, whitePlayer.games - 1)
	};
	let blackUpdates: any = {
		opponents: updatedBlackOpponents,
		color: 0,
		games: Math.max(0, blackPlayer.games - 1)
	};

	const status = game.status;
	
	if (status === 'WHITE_WINS') {
		whiteUpdates.wins = Math.max(0, whitePlayer.wins - 1);
		blackUpdates.losses = Math.max(0, blackPlayer.losses - 1);
	} else if (status === 'BLACK_WINS') {
		blackUpdates.wins = Math.max(0, blackPlayer.wins - 1);
		whiteUpdates.losses = Math.max(0, whitePlayer.losses - 1);
	} else if (status === 'DRAW') {
		whiteUpdates.draws = Math.max(0, whitePlayer.draws - 1);
		blackUpdates.draws = Math.max(0, blackPlayer.draws - 1);
	} else if (status === 'BYE') {
		if (game.presence < 2) {
			if (status === 'WHITE_WINS'){
				whiteUpdates.byes = Math.max(0, whitePlayer.byes - 1);
			}else{
				blackUpdates.byes = Math.max(0, blackPlayer.byes - 1);
			}
		}
	}

	// Update white player
	const { error: whiteUpdateError } = await supabase
		.from('players')
		.update(whiteUpdates)
		.eq('id', game.white);

	// Update black player
	const { error: blackUpdateError } = await supabase
		.from('players')
		.update(blackUpdates)
		.eq('id', game.black);

	if (whiteUpdateError || blackUpdateError) {
		console.error('Error updating players:', whiteUpdateError, blackUpdateError);
		throw new Error('Failed to update players');
	}

	// Delete the game
	const { error: deleteError } = await supabase
		.from('games')
		.delete()
		.eq('id', id);

	if (deleteError) {
		console.error('Error deleting game:', deleteError);
		throw new Error('Failed to delete game');
	}
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
	const p1Pref = getColorPreference(p1.color);
	const p2Pref = getColorPreference(p2.color);

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

	if (p1.color > p2.color) {
		// p1 is more "positive" (more whites), so p1 should play Black.
		return { white: p2, black: p1 };
	}
	if (p2.color > p1.color) {
		// p2 is more "positive", so p2 should play Black.
		return { white: p1, black: p2 };
	}

	// If streaks are equal (e.g. 0 vs 0, or +1 vs +1)
	// Randomly assign or use ID/Rating as deterministic tie breaker.
	// Using random for fairness if no other metric.
	return Math.random() < 0.5 ? { white: p1, black: p2 } : { white: p2, black: p1 };
}

export function generatePairings(players: Player[]): { pairs: { p1: Player; p2: Player }[]; bye: Player | null } {
	// Sort by Score (desc), then Rating (desc)
	let workingPlayers = [...players].sort((a, b) => {
		if ((a.score || 0) !== (b.score || 0)) return (b.score || 0) - (a.score || 0);
		return Number(b.rating || 0) - Number(a.rating || 0);
	});

	let bye: Player | null = null;
	if (workingPlayers.length % 2 !== 0) {
		// Prioritize absent players for bye first
		for (let i = workingPlayers.length - 1; i >= 0; i--) {
			if (!workingPlayers[i].is_present) {
				bye = workingPlayers[i];
				workingPlayers.splice(i, 1);
				break;
			}
		}
		// If no absent players, give bye to lowest ranked player who hasn't had a bye yet
		if (!bye) {
			for (let i = workingPlayers.length - 1; i >= 0; i--) {
				if (workingPlayers[i].byes === 0) {
					bye = workingPlayers[i];
					workingPlayers.splice(i, 1);
					break;
				}
			}
		}
		// If everyone has had a bye, take the one with fewest byes
		if (!bye) {
			workingPlayers.sort((a, b) => a.byes - b.byes);
			bye = workingPlayers.pop()!;
		}
	}

	const pairs: { p1: Player; p2: Player }[] = [];
	const used = new Set<number>();

	for (let i = 0; i < workingPlayers.length; i++) {
		if (used.has(workingPlayers[i].id)) continue;

		const p1 = workingPlayers[i];
		let paired = false;

		for (let j = i + 1; j < workingPlayers.length; j++) {
			if (used.has(workingPlayers[j].id)) continue;
			const p2 = workingPlayers[j];

			// 1. Avoid Rematches
			// Note: opponents is number[], p2.id is number.
			if (p1.opponents && p1.opponents.some((opId) => Number(opId) === p2.id)) continue;

			// 2. Color Compatibility (use olor field)
			if (!isColorCompatible(p1.color, p2.color)) continue;

			// Match found
			pairs.push({ p1, p2 });
			used.add(p1.id);
			used.add(p2.id);
			paired = true;
			break;
		}

		if (!paired) {
			console.error(`CRITICAL: Could not pair player ${p1.id} (${p1.name}) in greedy pass.`);
			// In a real implementation, we would backtrack here.
			// For now, log the error and continue
		}
	}

	return { pairs, bye };
}

// --- Round Management Functions ---

export async function generateScheduledRound() {
	try {
		// 1. Fetch Players and filter for active and present
		const allPlayers = await supabase.from('players').select('*');
		
		if (allPlayers.error) {
			throw allPlayers.error;
		}

		const players = allPlayers.data.filter((p: Player) => p.is_active && p.is_present);
		
		if (!players || players.length < 2) {
			return { success: false, error: 'Not enough active and present players (minimum 2 required)' };
		}

		// 2. Generate Pairings
		const { pairs, bye } = generatePairings(players);

		if (pairs.length === 0 && !bye) {
			return { success: false, error: 'Failed to generate any pairings' };
		}

		// 3. Determine next round number
		const { data: maxRoundData } = await supabase
			.from('games')
			.select('round')
			.order('round', { ascending: false })
			.limit(1)
			.single();
		
		const nextRound = (maxRoundData?.round || 0) + 1;

		// 4. Prepare matches to insert (DO NOT update player stats yet)
		const matchesToInsert = [];
		const generateRandomId = () => Math.floor(10000 + Math.random() * 90000);

		for (const pair of pairs) {
			// Assign Colors
			const { white, black } = assignMatchColors(pair.p1, pair.p2);

			// Generate unique ID
			let gameId = generateRandomId();
			while (matchesToInsert.some(m => m.id === gameId)) {
				gameId = generateRandomId();
			}

			// Create Match Record with PENDING status
			matchesToInsert.push({
				id: gameId,
				white: white.id,
				black: black.id,
				round: nextRound,
				status: 'PENDING',
				presence: 2 // Both players present
			});
		}

		// Handle Bye - create with presence: 1
		if (bye) {
			let byeGameId = generateRandomId();
			while (matchesToInsert.some(m => m.id === byeGameId)) {
				byeGameId = generateRandomId();
			}

			matchesToInsert.push({
				id: byeGameId,
				white: bye.id,
				black: 0, // Use 0 for bye games instead of null
				round: nextRound,
				status: 'PENDING',
				presence: 1 // BYE game
			});
		}

		// 5. Insert Matches (games only, no player stat updates)
		const { error: matchError } = await supabase
			.from('games')
			.insert(matchesToInsert);
		
		if (matchError) {
			console.error('Error inserting matches:', matchError);
			throw matchError;
		}

		return { success: true, round: nextRound, gamesCreated: matchesToInsert.length };

	} catch (error) {
		console.error('Error generating scheduled round:', error);
		return { success: false, error };
	}
}

export async function startScheduledRound() {
	try {
		// 1. Get the current round (last round)
		const currentRound = await getCurrentRound();
		
		if (!currentRound) {
			return { success: false, error: 'No rounds found to start' };
		}

		// 2. Fetch all games in this round
		const { data: games, error: gamesError } = await supabase
			.from('games')
			.select('*')
			.eq('round', currentRound);

		if (gamesError || !games || games.length === 0) {
			return { success: false, error: 'No games found in current round' };
		}

		// 3. Verify all games are PENDING
		const nonPendingGames = games.filter(g => g.status !== 'PENDING');
		if (nonPendingGames.length > 0) {
			return { success: false, error: 'Round has already been started or has results' };
		}

		// Round is ready - all player stats will be updated when results are entered
		return { success: true, round: currentRound };

	} catch (error) {
		console.error('Error starting scheduled round:', error);
		return { success: false, error };
	}
}

export async function removeLastRound() {
	try {
		// 1. Get max round number
		const { data: maxRoundData, error: maxError } = await supabase
			.from('games')
			.select('round')
			.order('round', { ascending: false })
			.limit(1)
			.single();
		
		if (maxError || !maxRoundData) {
			return { success: false, error: 'No rounds to delete' };
		}
		
		const lastRound = maxRoundData.round;
		
		// 2. Fetch all games in last round
		const { data: games, error: fetchError } = await supabase
			.from('games')
			.select('*')
			.eq('round', lastRound);
		
		if (fetchError || !games || games.length === 0) {
			return { success: false, error: 'Failed to fetch round games' };
		}
		
		// 3. Check if any game has results entered
		const hasResults = games.some(g => 
			g.status !== 'PENDING' && g.status !== 'scheduled'
		);
		
		if (hasResults) {
			// 4a. Round has results - FULL ROLLBACK required
			// Use deleteGameById for each game which handles all stat reversions
			for (const game of games) {
				await deleteGameById(game.id);
			}
		} else {
			// 4b. Round is PENDING - Simple delete, no stat updates needed
			// (opponents and streaks are only updated when results are entered)
			
			const { error: deleteError } = await supabase
				.from('games')
				.delete()
				.eq('round', lastRound);
			
			if (deleteError) {
				console.error('Error deleting games:', deleteError);
				return { success: false, error: 'Failed to delete games' };
			}
		}
		
		return { success: true, round: lastRound };
		
	} catch (error) {
		console.error('Error removing last round:', error);
		return { success: false, error };
	}
}

export async function addGame(whiteId: number, blackId: number, result?: string) {
	try {
		// Get current round
		const currentRound = await getCurrentRound();
		const round = currentRound || 1;

		// Fetch both players
		const { data: whitePlayer, error: whiteError } = await supabase
			.from('players')
			.select('*')
			.eq('id', whiteId)
			.single();

		const { data: blackPlayer, error: blackError } = await supabase
			.from('players')
			.select('*')
			.eq('id', blackId)
			.single();

		if (whiteError || blackError || !whitePlayer || !blackPlayer) {
			console.error('Error fetching players:', whiteError, blackError);
			throw new Error('Failed to fetch players');
		}

		// Determine game status based on result
		let status: 'PENDING' | 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' = 'PENDING';
		if (result === '1-0') {
			status = 'WHITE_WINS';
		} else if (result === '0-1') {
			status = 'BLACK_WINS';
		} else if (result === '0.5-0.5') {
			status = 'DRAW';
		}

		// Generate a random 5-digit ID
		const generateRandomId = () => Math.floor(10000 + Math.random() * 90000);
		let gameId = generateRandomId();
		
		// Ensure ID is unique by checking if it exists
		let idExists = true;
		while (idExists) {
			const { data: existingGame } = await supabase
				.from('games')
				.select('id')
				.eq('id', gameId)
				.single();
			
			if (!existingGame) {
				idExists = false;
			} else {
				gameId = generateRandomId();
			}
		}

		// Insert the game
		const { data: newGame, error: gameError } = await supabase
			.from('games')
			.insert({
				id: gameId,
				white: whiteId,
				black: blackId,
				round,
				status,
				presence: 2 // Both players present
			})
			.select()
			.single();

		if (gameError) {
			console.error('Error inserting game:', gameError);
			throw new Error('Failed to insert game');
		}

		// Update player opponents arrays
		const updatedWhiteOpponents = [...(whitePlayer.opponents || []), blackId];
		const updatedBlackOpponents = [...(blackPlayer.opponents || []), whiteId];

		// Update player stats based on result
		let whiteUpdates: any = {
			opponents: updatedWhiteOpponents,
			games: whitePlayer.games + 1
		};
		let blackUpdates: any = {
			opponents: updatedBlackOpponents,
			games: blackPlayer.games + 1
		};

		// Update color streaks
		const whiteNewStreak = calculateNextStreak(whitePlayer.color || 0, 'white');
		const blackNewStreak = calculateNextStreak(blackPlayer.color || 0, 'black');
		whiteUpdates.color = whiteNewStreak;
		blackUpdates.color = blackNewStreak;

		if (status === 'WHITE_WINS') {
			whiteUpdates.wins = whitePlayer.wins + 1;
			blackUpdates.losses = blackPlayer.losses + 1;
		} else if (status === 'BLACK_WINS') {
			blackUpdates.wins = blackPlayer.wins + 1;
			whiteUpdates.losses = whitePlayer.losses + 1;
		} else if (status === 'DRAW') {
			whiteUpdates.draws = whitePlayer.draws + 1;
			blackUpdates.draws = blackPlayer.draws + 1;
		}

		// Update white player
		const { error: whiteUpdateError } = await supabase
			.from('players')
			.update(whiteUpdates)
			.eq('id', whiteId);

		// Update black player
		const { error: blackUpdateError } = await supabase
			.from('players')
			.update(blackUpdates)
			.eq('id', blackId);

		if (whiteUpdateError || blackUpdateError) {
			console.error('Error updating players:', whiteUpdateError, blackUpdateError);
			throw new Error('Failed to update players');
		}

		return newGame;
	} catch (error) {
		console.error('Error adding game:', error);
		throw error;
	}
}
