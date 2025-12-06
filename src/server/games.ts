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

/**
 * Reverse the color streak when deleting a game
 * This undoes the streak change that was applied when the game was created
 */
function reverseColorStreak(currentStreak: number, playedColor: 'white' | 'black'): number {
	if (playedColor === 'white') {
		// Player played white, so their streak increased toward positive
		// Reverse: if streak is +2, go back to +1. If +1, go back to 0.
		if (currentStreak === 2) return 1;
		if (currentStreak === 1) return 0;
		// Edge case: streak shouldn't be 0 or negative if they played white, but handle gracefully
		return Math.max(0, currentStreak - 1);
	} else {
		// Player played black, so their streak decreased toward negative
		// Reverse: if streak is -2, go back to -1. If -1, go back to 0.
		if (currentStreak === -2) return -1;
		if (currentStreak === -1) return 0;
		// Edge case: streak shouldn't be 0 or positive if they played black, but handle gracefully
		return Math.min(0, currentStreak + 1);
	}
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

	const isByeGame = game.black === 0 || game.presence === 1;

	// Fetch white player
	const { data: whitePlayer, error: whiteError } = await supabase
		.from('players')
		.select('*')
		.eq('id', game.white)
		.single();

	if (whiteError || !whitePlayer) {
		console.error('Error fetching white player:', whiteError);
		throw new Error('Failed to fetch white player');
	}

	// Fetch black player only if not a bye game
	let blackPlayer = null;
	if (!isByeGame) {
		const { data: fetchedBlackPlayer, error: blackError } = await supabase
			.from('players')
			.select('*')
			.eq('id', game.black)
			.single();

		if (blackError || !fetchedBlackPlayer) {
			console.error('Error fetching black player:', blackError);
			throw new Error('Failed to fetch black player');
		}
		blackPlayer = fetchedBlackPlayer;
	}

	const status = game.status;

	// Handle BYE games separately
	if (isByeGame) {
		// Only update stats if game had a result (not PENDING)
		// PENDING games don't modify player stats at all
		if (status !== 'PENDING') {
			const reversedStreak = reverseColorStreak(whitePlayer.color || 0, 'white');
			
			const whiteUpdates: any = {
				color: reversedStreak,
				games: Math.max(0, whitePlayer.games - 1),
				byes: Math.max(0, whitePlayer.byes - 1)
			};

			const { error: whiteUpdateError } = await supabase
				.from('players')
				.update(whiteUpdates)
				.eq('id', game.white);

			if (whiteUpdateError) {
				console.error('Error updating player:', whiteUpdateError);
				throw new Error('Failed to update player');
			}
		}
	} else {
		// Regular game with two players
		// Only update stats if game had a result (not PENDING)
		// PENDING games don't modify player stats at all
		if (status !== 'PENDING') {
			// Remove opponents from each other's lists
			const updatedWhiteOpponents = (whitePlayer.opponents || []).filter(
				(opId: number) => Number(opId) !== game.black
			);
			const updatedBlackOpponents = (blackPlayer!.opponents || []).filter(
				(opId: number) => Number(opId) !== game.white
			);

			// Reverse color streaks
			const whiteReversedStreak = reverseColorStreak(whitePlayer.color || 0, 'white');
			const blackReversedStreak = reverseColorStreak(blackPlayer!.color || 0, 'black');

			// Determine stat changes based on game status
			let whiteUpdates: any = {
				opponents: updatedWhiteOpponents,
				color: whiteReversedStreak,
				games: Math.max(0, whitePlayer.games - 1)
			};
			let blackUpdates: any = {
				opponents: updatedBlackOpponents,
				color: blackReversedStreak,
				games: Math.max(0, blackPlayer!.games - 1)
			};

			// Reverse win/loss/draw stats
			if (status === 'WHITE_WINS') {
				whiteUpdates.wins = Math.max(0, whitePlayer.wins - 1);
				blackUpdates.losses = Math.max(0, blackPlayer!.losses - 1);
			} else if (status === 'BLACK_WINS') {
				blackUpdates.wins = Math.max(0, blackPlayer!.wins - 1);
				whiteUpdates.losses = Math.max(0, whitePlayer.losses - 1);
			} else if (status === 'DRAW') {
				whiteUpdates.draws = Math.max(0, whitePlayer.draws - 1);
				blackUpdates.draws = Math.max(0, blackPlayer!.draws - 1);
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
		}
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
	// Use deterministic tie breaker: higher-rated player gets white
	// (following FIDE convention for initial color in Swiss)
	if ((p1.rating || 0) > (p2.rating || 0)) {
		return { white: p1, black: p2 };
	} else if ((p2.rating || 0) > (p1.rating || 0)) {
		return { white: p2, black: p1 };
	}
	
	// If ratings are also equal, use ID (lower ID gets white for determinism)
	return p1.id < p2.id ? { white: p1, black: p2 } : { white: p2, black: p1 };
}

// --- Advanced Swiss Pairing System ---

interface ScoreBracket {
	score: number;
	players: Player[];
}

interface PairingCandidate {
	p1: Player;
	p2: Player;
	penalty: number;
}

/**
 * Calculate pairing penalty score (lower is better)
 * Professional Swiss uses weighted penalties for:
 * - Rating difference
 * - Color conflicts
 * - Previous opponents
 */
function calculatePairingPenalty(p1: Player, p2: Player): number {
	let penalty = 0;

	// 1. Rating difference penalty (normalized)
	const ratingDiff = Math.abs((p1.rating || 1500) - (p2.rating || 1500));
	penalty += ratingDiff / 100; // Scale: 100 points = 1 penalty point

	// 2. Color conflict penalty
	if (!isColorCompatible(p1.color, p2.color)) {
		penalty += 1000; // Very high penalty for color conflicts
	}

	// 3. Strong color preference satisfaction penalty
	const p1Pref = getColorPreference(p1.color);
	const p2Pref = getColorPreference(p2.color);
	
	// Reward strong preferences being met
	if (p1Pref === 'MUST_WHITE' || p1Pref === 'MUST_BLACK') penalty -= 5;
	if (p2Pref === 'MUST_WHITE' || p2Pref === 'MUST_BLACK') penalty -= 5;
	
	// Mild penalty if both neutral (less interesting)
	if (p1Pref === 'NEUTRAL' && p2Pref === 'NEUTRAL') penalty += 1;

	// 4. Prevent rematches (absolute)
	if (p1.opponents?.includes(p2.id) || p2.opponents?.includes(p1.id)) {
		penalty += 10000; // Absolutely avoid rematches
	}

	return penalty;
}

/**
 * Group players into score brackets
 */
function createScoreBrackets(players: Player[]): ScoreBracket[] {
	const bracketMap = new Map<number, Player[]>();
	
	for (const player of players) {
		const score = player.score || 0;
		if (!bracketMap.has(score)) {
			bracketMap.set(score, []);
		}
		bracketMap.get(score)!.push(player);
	}

	// Sort brackets by score (descending) and players within by rating (descending)
	const brackets: ScoreBracket[] = [];
	const sortedScores = Array.from(bracketMap.keys()).sort((a, b) => b - a);
	
	for (const score of sortedScores) {
		const players = bracketMap.get(score)!;
		players.sort((a, b) => (b.rating || 0) - (a.rating || 0));
		brackets.push({ score, players });
	}

	return brackets;
}

/**
 * Try to pair players within a bracket using backtracking
 */
function pairBracket(players: Player[], usedGlobal: Set<number>): { p1: Player; p2: Player }[] | null {
	if (players.length === 0) return [];
	if (players.length === 1) return null; // Odd player - needs downfloat
	
	// Filter out already used players
	const available = players.filter(p => !usedGlobal.has(p.id));
	if (available.length === 0) return [];
	if (available.length === 1) return null;

	// Try backtracking pairing
	const result = backtrackPair(available, 0, [], usedGlobal);
	return result;
}

/**
 * Backtracking algorithm to find valid pairings
 */
function backtrackPair(
	players: Player[],
	index: number,
	currentPairs: { p1: Player; p2: Player }[],
	used: Set<number>
): { p1: Player; p2: Player }[] | null {
	// Base case: all players paired
	if (index >= players.length) {
		return currentPairs;
	}

	// Skip if already paired
	if (used.has(players[index].id)) {
		return backtrackPair(players, index + 1, currentPairs, used);
	}

	const p1 = players[index];
	
	// Try pairing with all subsequent unpaired players
	const candidates: PairingCandidate[] = [];
	
	for (let i = index + 1; i < players.length; i++) {
		if (used.has(players[i].id)) continue;
		
		const p2 = players[i];
		const penalty = calculatePairingPenalty(p1, p2);
		
		// Only consider valid pairings (no rematches, compatible colors)
		if (penalty < 10000) {
			candidates.push({ p1, p2, penalty });
		}
	}

	// Sort candidates by penalty (best first)
	candidates.sort((a, b) => a.penalty - b.penalty);

	// Try each candidate
	for (const candidate of candidates) {
		used.add(candidate.p1.id);
		used.add(candidate.p2.id);
		currentPairs.push({ p1: candidate.p1, p2: candidate.p2 });

		const result = backtrackPair(players, index + 1, currentPairs, used);
		
		if (result !== null) {
			return result; // Success
		}

		// Backtrack
		used.delete(candidate.p1.id);
		used.delete(candidate.p2.id);
		currentPairs.pop();
	}

	return null; // No valid pairing found
}

/**
 * Professional Swiss System Pairing Algorithm
 * Implements:
 * - Score bracket pairing
 * - Downfloating for odd brackets
 * - Backtracking for optimal pairings
 * - Color preference optimization
 * - Proper bye handling
 */
export function generatePairings(players: Player[]): { pairs: { p1: Player; p2: Player }[]; bye: Player | null } {
	// Sort all players by score (desc), then Buchholz (desc), then rating (desc)
	const sortedPlayers = [...players].sort((a, b) => {
		if ((a.score || 0) !== (b.score || 0)) return (b.score || 0) - (a.score || 0);
		if ((a.buchholz || 0) !== (b.buchholz || 0)) return (b.buchholz || 0) - (a.buchholz || 0);
		return (b.rating || 0) - (a.rating || 0);
	});

	// Handle bye if odd number of players
	let bye: Player | null = null;
	let workingPlayers = sortedPlayers;
	
	if (sortedPlayers.length % 2 !== 0) {
		// Find the lowest-rated player who hasn't had a bye yet (or fewest byes)
		const byeCandidates = [...sortedPlayers].sort((a, b) => {
			// First priority: fewest byes
			if (a.byes !== b.byes) return a.byes - b.byes;
			// Second priority: lowest rating
			return (a.rating || 0) - (b.rating || 0);
		});
		
		bye = byeCandidates[0];
		workingPlayers = sortedPlayers.filter(p => p.id !== bye!.id);
	}

	// Create score brackets
	const brackets = createScoreBrackets(workingPlayers);
	
	const allPairs: { p1: Player; p2: Player }[] = [];
	const usedPlayers = new Set<number>();
	const floaters: Player[] = []; // Players who couldn't be paired in their bracket

	// Pair each bracket
	for (let i = 0; i < brackets.length; i++) {
		const bracket = brackets[i];
		let bracketPlayers = [...bracket.players, ...floaters];
		floaters.length = 0; // Clear floaters

		// Try to pair the bracket
		const pairs = pairBracket(bracketPlayers, usedPlayers);
		
		if (pairs !== null) {
			// Success - add pairs and mark players as used
			for (const pair of pairs) {
				allPairs.push(pair);
				usedPlayers.add(pair.p1.id);
				usedPlayers.add(pair.p2.id);
			}
			
			// Check for unpaired players (downfloat to next bracket)
			const unpaired = bracketPlayers.filter(p => !usedPlayers.has(p.id));
			if (unpaired.length > 0) {
				// Sort unpaired by rating (lowest floats down)
				unpaired.sort((a, b) => (a.rating || 0) - (b.rating || 0));
				floaters.push(...unpaired);
			}
		} else {
			// Bracket has odd number - downfloat lowest rated
			bracketPlayers.sort((a, b) => (a.rating || 0) - (b.rating || 0));
			if (bracketPlayers.length > 0) {
				floaters.push(bracketPlayers[0]);
				bracketPlayers = bracketPlayers.slice(1);
				
				// Retry pairing
				const retryPairs = pairBracket(bracketPlayers, usedPlayers);
				if (retryPairs) {
					for (const pair of retryPairs) {
						allPairs.push(pair);
						usedPlayers.add(pair.p1.id);
						usedPlayers.add(pair.p2.id);
					}
				}
			}
		}
	}

	// Handle remaining floaters (shouldn't happen but defensive)
	if (floaters.length > 0) {
		console.warn(`WARNING: ${floaters.length} player(s) could not be paired:`, 
			floaters.map(p => `${p.name} (${p.id})`));
	}

	return { pairs: allPairs, bye };
}

// --- Round Management Functions ---

export async function generateScheduledRound() {
	try {
		// 1. Fetch Players and filter for active, present, and not paused
		const allPlayers = await supabase.from('players').select('*');
		
		if (allPlayers.error) {
			throw allPlayers.error;
		}

		const players = allPlayers.data.filter((p: Player) => p.is_active && p.is_present );
		
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
		
		// 3. Categorize games by status
		const pendingGames = games.filter(g => g.status === 'PENDING');
		const completedGames = games.filter(g => g.status !== 'PENDING');
		
		// 4. Delete completed games with full stat rollback
		if (completedGames.length > 0) {
			for (const game of completedGames) {
				try {
					await deleteGameById(game.id);
				} catch (error) {
					console.error(`Failed to delete game ${game.id}:`, error);
					// Continue deleting other games even if one fails
				}
			}
		}
		
		// 5. Delete pending games (no stat updates needed)
		// Note: PENDING games don't modify player stats, so simple deletion is safe
		if (pendingGames.length > 0) {
			const { error: deleteError } = await supabase
				.from('games')
				.delete()
				.in('id', pendingGames.map(g => g.id));
			
			if (deleteError) {
				console.error('Error deleting pending games:', deleteError);
				return { success: false, error: 'Failed to delete pending games' };
			}
		}
		
		return { 
			success: true, 
			round: lastRound,
			deletedGames: games.length,
			completedGames: completedGames.length,
			pendingGames: pendingGames.length
		};
		
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
