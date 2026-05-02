import { supabase } from "@/lib/supabase/client";
import { MatchRecord, MatchStatus } from "@/types/game";
import { Player } from "@/types/player";
import {
  derivePlayers,
  gameFromMatch,
  isPendingMatch,
  matchStatusFromRecord,
  PlayerRow,
  sortByStandings,
  scoresFromResult,
} from "./tournament";

const playerCache = new Map<number, Promise<string>>();

export async function getGames() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("round_number", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as MatchRecord[]).map(gameFromMatch);
}

export async function getCurrentRound() {
  const { data, error } = await supabase
    .from("matches")
    .select("round_number")
    .order("round_number", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0]?.round_number ?? 0;
}

export function getPlayerNameById(id: number) {
  if (id === 0) {
    return Promise.resolve("BYE");
  }

  if (playerCache.has(id)) {
    return playerCache.get(id)!;
  }

  const promise = (async () => {
    const { data, error } = await supabase
      .from("players")
      .select("full_name")
      .eq("id", id)
      .single();

    if (error || !data) {
      return "Unknown Player";
    }

    return data.full_name;
  })();

  playerCache.set(id, promise);
  return promise;
}

export async function deleteGameById(id: number) {
  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export type ColorPreference =
  | "MUST_WHITE"
  | "MUST_BLACK"
  | "PREFER_WHITE"
  | "PREFER_BLACK"
  | "NEUTRAL";

export function getColorPreference(streak: number): ColorPreference {
  if (streak >= 2) return "MUST_BLACK";
  if (streak <= -2) return "MUST_WHITE";
  if (streak === 1) return "PREFER_BLACK";
  if (streak === -1) return "PREFER_WHITE";
  return "NEUTRAL";
}

export function isColorCompatible(p1Streak: number, p2Streak: number): boolean {
  const p1Pref = getColorPreference(p1Streak);
  const p2Pref = getColorPreference(p2Streak);

  if (p1Pref === "MUST_WHITE" && p2Pref === "MUST_WHITE") return false;
  if (p1Pref === "MUST_BLACK" && p2Pref === "MUST_BLACK") return false;

  return true;
}

export function calculateNextStreak(
  currentStreak: number,
  assignedColor: "white" | "black"
): number {
  if (assignedColor === "white") {
    return currentStreak === 1 ? 2 : 1;
  }

  return currentStreak === -1 ? -2 : -1;
}

export function assignMatchColors(
  p1: Player,
  p2: Player
): { white: Player; black: Player } {
  const p1Pref = getColorPreference(p1.color);
  const p2Pref = getColorPreference(p2.color);

  if (p1Pref === "MUST_WHITE") return { white: p1, black: p2 };
  if (p1Pref === "MUST_BLACK") return { white: p2, black: p1 };
  if (p2Pref === "MUST_WHITE") return { white: p2, black: p1 };
  if (p2Pref === "MUST_BLACK") return { white: p1, black: p2 };

  if (p1Pref === "PREFER_WHITE" && p2Pref === "PREFER_BLACK") {
    return { white: p1, black: p2 };
  }

  if (p1Pref === "PREFER_BLACK" && p2Pref === "PREFER_WHITE") {
    return { white: p2, black: p1 };
  }

  if (p1.color > p2.color) {
    return { white: p2, black: p1 };
  }

  if (p2.color > p1.color) {
    return { white: p1, black: p2 };
  }

  if (p1.elo > p2.elo) {
    return { white: p1, black: p2 };
  }

  if (p2.elo > p1.elo) {
    return { white: p2, black: p1 };
  }

  return p1.id < p2.id ? { white: p1, black: p2 } : { white: p2, black: p1 };
}

interface ScoreBracket {
  score: number;
  players: Player[];
}

interface PairingCandidate {
  p1: Player;
  p2: Player;
  penalty: number;
}

function selectByePlayer(players: Player[]): Player {
  const minByeCount = Math.min(...players.map((player) => player.byes));

  // Start from the lowest standings and move downward until we find
  // someone with the fewest byes, so byes are distributed before repeats.
  const orderedByLowestStanding = [...players].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    if (a.buchholz !== b.buchholz) return a.buchholz - b.buchholz;
    if (a.elo !== b.elo) return a.elo - b.elo;
    return a.id - b.id;
  });

  for (const player of orderedByLowestStanding) {
    if (player.byes === minByeCount) {
      return player;
    }
  }

  return orderedByLowestStanding[0];
}

function calculatePairingPenalty(
  p1: Player,
  p2: Player,
  allowRematch = false
): number {
  let penalty = 0;

  const ratingDiff = Math.abs((p1.elo || 1500) - (p2.elo || 1500));
  penalty += ratingDiff / 100;

  if (!isColorCompatible(p1.color, p2.color)) {
    penalty += 1000;
  }

  const p1Pref = getColorPreference(p1.color);
  const p2Pref = getColorPreference(p2.color);

  if (p1Pref === "MUST_WHITE" || p1Pref === "MUST_BLACK") penalty -= 5;
  if (p2Pref === "MUST_WHITE" || p2Pref === "MUST_BLACK") penalty -= 5;

  if (p1Pref === "NEUTRAL" && p2Pref === "NEUTRAL") penalty += 1;

  if (p1.opponents.includes(p2.id) || p2.opponents.includes(p1.id)) {
    penalty += allowRematch ? 250 : 10000;
  }

  return penalty;
}

function createScoreBrackets(players: Player[]): ScoreBracket[] {
  const bracketMap = new Map<number, Player[]>();

  for (const player of players) {
    if (!bracketMap.has(player.score)) {
      bracketMap.set(player.score, []);
    }

    bracketMap.get(player.score)!.push(player);
  }

  const brackets: ScoreBracket[] = [];
  const sortedScores = Array.from(bracketMap.keys()).sort((a, b) => b - a);

  for (const score of sortedScores) {
    const bracketPlayers = bracketMap.get(score)!;
    bracketPlayers.sort((a, b) => b.elo - a.elo);
    brackets.push({ score, players: bracketPlayers });
  }

  return brackets;
}

function pairBracket(
  players: Player[],
  usedGlobal: Set<number>,
  allowRematch = false
): { p1: Player; p2: Player }[] | null {
  if (players.length === 0) return [];
  if (players.length === 1) return null;

  const available = players.filter((p) => !usedGlobal.has(p.id));
  if (available.length === 0) return [];
  if (available.length === 1) return null;

  return backtrackPair(available, 0, [], usedGlobal, allowRematch);
}

function backtrackPair(
  players: Player[],
  index: number,
  currentPairs: { p1: Player; p2: Player }[],
  used: Set<number>,
  allowRematch = false
): { p1: Player; p2: Player }[] | null {
  if (index >= players.length) {
    return currentPairs;
  }

  if (used.has(players[index].id)) {
    return backtrackPair(players, index + 1, currentPairs, used);
  }

  const p1 = players[index];
  const candidates: PairingCandidate[] = [];

  for (let i = index + 1; i < players.length; i += 1) {
    if (used.has(players[i].id)) continue;

    const p2 = players[i];
    const penalty = calculatePairingPenalty(p1, p2, allowRematch);
    if (allowRematch || penalty < 10000) {
      candidates.push({ p1, p2, penalty });
    }
  }

  candidates.sort((a, b) => a.penalty - b.penalty);

  for (const candidate of candidates) {
    used.add(candidate.p1.id);
    used.add(candidate.p2.id);
    currentPairs.push({ p1: candidate.p1, p2: candidate.p2 });

    const result = backtrackPair(
      players,
      index + 1,
      currentPairs,
      used,
      allowRematch
    );
    if (result !== null) {
      return result;
    }

    used.delete(candidate.p1.id);
    used.delete(candidate.p2.id);
    currentPairs.pop();
  }

  return null;
}

export function generatePairings(players: Player[]): {
  pairs: { p1: Player; p2: Player }[];
  bye: Player | null;
} {
  const sortedPlayers = sortByStandings(players);

  let bye: Player | null = null;
  let workingPlayers = sortedPlayers;

  if (sortedPlayers.length % 2 !== 0) {
    bye = selectByePlayer(sortedPlayers);
    workingPlayers = sortedPlayers.filter((player) => player.id !== bye!.id);
  }

  const brackets = createScoreBrackets(workingPlayers);
  const allPairs: { p1: Player; p2: Player }[] = [];
  const usedPlayers = new Set<number>();
  const floaters: Player[] = [];

  for (let i = 0; i < brackets.length; i += 1) {
    const bracket = brackets[i];
    const bracketPlayers = [...bracket.players, ...floaters];
    floaters.length = 0;

    const pairs = pairBracket(bracketPlayers, usedPlayers);

    if (pairs !== null) {
      for (const pair of pairs) {
        allPairs.push(pair);
        usedPlayers.add(pair.p1.id);
        usedPlayers.add(pair.p2.id);
      }

      const unpaired = bracketPlayers.filter((p) => !usedPlayers.has(p.id));
      if (unpaired.length > 0) {
        unpaired.sort((a, b) => a.elo - b.elo);
        floaters.push(...unpaired);
      }
    } else {
      // Keep all unmatched players as floaters for lower score brackets.
      floaters.push(...bracketPlayers.filter((p) => !usedPlayers.has(p.id)));
    }
  }

  const remainingPlayers = workingPlayers.filter((p) => !usedPlayers.has(p.id));
  if (remainingPlayers.length > 0) {
    const recoveredPairs = pairBracket(remainingPlayers, usedPlayers, true);
    if (recoveredPairs) {
      for (const pair of recoveredPairs) {
        allPairs.push(pair);
        usedPlayers.add(pair.p1.id);
        usedPlayers.add(pair.p2.id);
      }
    }
  }

  return { pairs: allPairs, bye };
}

async function fetchSnapshot(): Promise<{
  playersRows: PlayerRow[];
  matchesRows: MatchRecord[];
}> {
  const [playersResult, matchesResult] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("matches").select("*"),
  ]);

  if (playersResult.error) {
    throw playersResult.error;
  }

  if (matchesResult.error) {
    throw matchesResult.error;
  }

  return {
    playersRows: (playersResult.data || []) as PlayerRow[],
    matchesRows: (matchesResult.data || []) as MatchRecord[],
  };
}

function buildPendingRoundError(
  currentRound: number,
  currentRoundMatches: MatchRecord[],
  playersRows: PlayerRow[]
): string {
  const playersById = new Map(
    playersRows.map((player) => [player.id, player.full_name] as const)
  );
  const pendingMatches = currentRoundMatches.filter((match) =>
    isPendingMatch(match)
  );

  const pendingDetails = pendingMatches.map((match) => {
    const whiteName =
      playersById.get(match.white_player_id) ??
      `Player #${match.white_player_id}`;
    const blackName =
      typeof match.black_player_id === "number"
        ? (playersById.get(match.black_player_id) ??
          `Player #${match.black_player_id}`)
        : "BYE";

    const hasWhiteScore = typeof match.white_score === "number";
    const hasBlackScore =
      match.black_player_id == null || typeof match.black_score === "number";

    let reason = "result is still pending";
    if (match.is_bye && match.white_score !== 1) {
      reason = "bye result is not recorded";
    } else if (!hasWhiteScore && !hasBlackScore) {
      reason = "both scores are missing";
    } else if (!hasWhiteScore) {
      reason = "white score is missing";
    } else if (!hasBlackScore) {
      reason = "black score is missing";
    }

    return `#${match.id} ${whiteName} vs ${blackName} (${reason})`;
  });

  return `Cannot generate next round until round ${currentRound} is fully completed. Incomplete matches: ${pendingDetails.join(
    "; "
  )}.`;
}

function buildInvalidByeAssignmentError(
  currentRound: number,
  currentRoundMatches: MatchRecord[],
  playersRows: PlayerRow[]
): string | null {
  const playersById = new Map(
    playersRows.map((player) => [player.id, player.full_name] as const)
  );

  const invalidByeMatches = currentRoundMatches.filter((match) => {
    const hasTwoParticipants =
      typeof match.black_player_id === "number" && match.black_player_id > 0;
    if (!hasTwoParticipants) {
      return false;
    }

    // Two-player matches can legitimately carry bye flags to track absence
    // penalties/tiebreak effects. The only invalid case here is a true BYE row
    // (`is_bye=true`) that still has two participants.
    return Boolean(match.is_bye);
  });

  if (invalidByeMatches.length === 0) {
    return null;
  }

  const details = invalidByeMatches.map((match) => {
    const whiteName =
      playersById.get(match.white_player_id) ??
      `Player #${match.white_player_id}`;
    const blackName =
      playersById.get(match.black_player_id as number) ??
      `Player #${match.black_player_id}`;

    const reason = "match is marked as BYE with two participants";

    return `#${match.id} ${whiteName} vs ${blackName} (${reason})`;
  });

  return `Cannot generate next round. Round ${currentRound} has invalid BYE rows with two participants: ${details.join(
    "; "
  )}. Remove the BYE mark from these matches, then try again.`;
}

export async function generateScheduledRound() {
  try {
    const { playersRows, matchesRows } = await fetchSnapshot();

    if (matchesRows.length > 0) {
      const currentRound = Math.max(
        ...matchesRows.map((match) => match.round_number)
      );
      const currentRoundMatches = matchesRows.filter(
        (match) => match.round_number === currentRound
      );
      const invalidByeError = buildInvalidByeAssignmentError(
        currentRound,
        currentRoundMatches,
        playersRows
      );
      if (invalidByeError) {
        return {
          success: false,
          error: invalidByeError,
        };
      }
      const hasPendingInCurrentRound = currentRoundMatches.some((match) =>
        isPendingMatch(match)
      );

      if (hasPendingInCurrentRound) {
        return {
          success: false,
          error: buildPendingRoundError(
            currentRound,
            currentRoundMatches,
            playersRows
          ),
        };
      }
    }

    const derivedPlayers = derivePlayers(playersRows, matchesRows);
    const availablePlayers = derivedPlayers.filter(
      (player) => player.is_active && player.is_present
    );

    if (availablePlayers.length < 2) {
      return {
        success: false,
        error: "Not enough active and present users (minimum 2 required)",
      };
    }

    const { pairs, bye } = generatePairings(availablePlayers);
    const expectedGames =
      Math.floor(availablePlayers.length / 2) + (bye ? 1 : 0);
    const generatedGames = pairs.length + (bye ? 1 : 0);

    if (pairs.length === 0 && !bye) {
      return { success: false, error: "Failed to generate pairings" };
    }

    if (generatedGames !== expectedGames) {
      return {
        success: false,
        error:
          "Failed to generate complete pairings for all available players.",
      };
    }

    const nextRound =
      matchesRows.length > 0
        ? Math.max(...matchesRows.map((match) => match.round_number)) + 1
        : 1;

    const inserts = pairs.map(({ p1, p2 }) => {
      const { white, black } = assignMatchColors(p1, p2);
      return {
        round_number: nextRound,
        white_player_id: white.id,
        black_player_id: black.id,
        white_score: null,
        black_score: null,
        is_bye: false,
        white_bye: false,
        black_bye: false,
      };
    });

    if (bye) {
      inserts.push({
        round_number: nextRound,
        white_player_id: bye.id,
        black_player_id: null,
        white_score: 1,
        black_score: null,
        is_bye: true,
        white_bye: true,
        black_bye: false,
      });
    }

    const { error } = await supabase.from("matches").insert(inserts);

    if (error) {
      throw error;
    }

    return {
      success: true,
      round: nextRound,
      gamesCreated: inserts.length,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function startScheduledRound() {
  try {
    const currentRound = await getCurrentRound();

    if (!currentRound) {
      return { success: false, error: "No rounds found to start" };
    }

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("round_number", currentRound);

    if (error) {
      return { success: false, error: error.message };
    }

    const matches = (data || []) as MatchRecord[];
    const nonByeMatches = matches.filter((match) => !match.is_bye);

    const hasAlreadyPlayed = nonByeMatches.some(
      (match) => !isPendingMatch(match)
    );

    if (hasAlreadyPlayed) {
      return {
        success: false,
        error: "Current round already has completed results",
      };
    }

    return { success: true, round: currentRound };
  } catch (error) {
    return { success: false, error };
  }
}

export async function removeLastRound() {
  try {
    const currentRound = await getCurrentRound();

    if (!currentRound) {
      return { success: false, error: "No rounds to delete" };
    }

    const { data, error: selectError } = await supabase
      .from("matches")
      .select("id")
      .eq("round_number", currentRound);

    if (selectError) {
      return { success: false, error: selectError.message };
    }

    const roundMatches = data || [];

    const { error: deleteError } = await supabase
      .from("matches")
      .delete()
      .eq("round_number", currentRound);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return {
      success: true,
      round: currentRound,
      deletedGames: roundMatches.length,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function addGame(
  whiteId: number,
  blackId: number,
  result?: string
) {
  if (whiteId === blackId) {
    throw new Error("White and black players must be different");
  }

  const currentRound = await getCurrentRound();
  const roundToInsert = currentRound || 1;
  const { whiteScore, blackScore } = scoresFromResult(result);

  const { data, error } = await supabase
    .from("matches")
    .insert({
      round_number: roundToInsert,
      white_player_id: whiteId,
      black_player_id: blackId,
      white_score: whiteScore,
      black_score: blackScore,
      is_bye: false,
      white_bye: false,
      black_bye: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function statusToResultString(status: MatchStatus): string {
  if (status === "WHITE_WINS") return "1-0";
  if (status === "BLACK_WINS") return "0-1";
  if (status === "DRAW") return "0.5-0.5";
  return "";
}

export function resultStringToStatus(result: string): MatchStatus {
  if (result === "1-0") return "WHITE_WINS";
  if (result === "0-1") return "BLACK_WINS";
  if (result === "0.5-0.5") return "DRAW";
  return "PENDING";
}

export function getStatusFromScores(match: MatchRecord): MatchStatus {
  return matchStatusFromRecord(match);
}
