import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(envPath);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase credentials in environment.");
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const runId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
const prefix = `ZZ_TEST_${runId}`;

const createdPlayers = [];
const createdMatches = [];

function fail(message) {
  throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(`${message} (expected ${expected}, got ${actual})`);
  }
}

function assertApprox(actual, expected, message) {
  if (Math.abs(actual - expected) > 0.00001) {
    fail(`${message} (expected ${expected}, got ${actual})`);
  }
}

function deriveTestStats(players, matches) {
  const byId = new Map();
  for (const p of players) {
    byId.set(p.id, {
      id: p.id,
      full_name: p.full_name,
      elo: p.elo,
      is_active: p.is_active,
      wins: 0,
      losses: 0,
      draws: 0,
      games: 0,
      byes: 0,
      score: 0,
      opponents: new Set(),
      buchholz: 0,
    });
  }

  const sortedMatches = [...matches].sort((a, b) => (a.round_number - b.round_number) || (a.id - b.id));

  for (const m of sortedMatches) {
    const white = byId.get(m.white_player_id);
    if (!white) continue;

    if (m.is_bye && m.white_score === 1 && m.black_player_id == null) {
      white.games += 1;
      white.byes += 1;
      continue;
    }

    if (
      m.is_bye ||
      typeof m.black_player_id !== "number" ||
      typeof m.white_score !== "number" ||
      typeof m.black_score !== "number"
    ) {
      continue;
    }

    const black = byId.get(m.black_player_id);
    if (!black) continue;

    white.games += 1;
    black.games += 1;
    white.opponents.add(black.id);
    black.opponents.add(white.id);

    if (m.white_score > m.black_score) {
      white.wins += 1;
      black.losses += 1;
    } else if (m.white_score < m.black_score) {
      white.losses += 1;
      black.wins += 1;
    } else {
      white.draws += 1;
      black.draws += 1;
    }
  }

  for (const s of byId.values()) {
    s.score = s.wins + s.byes + s.draws * 0.5;
  }

  for (const s of byId.values()) {
    let total = 0;
    for (const oppId of s.opponents.values()) {
      total += byId.get(oppId)?.score ?? 0;
    }
    s.buchholz = total;
  }

  return byId;
}

function sortStandings(rows) {
  return [...rows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
    return b.elo - a.elo;
  });
}

async function createPlayer(fullName, elo) {
  const { data, error } = await supabase
    .from("players")
    .insert({ full_name: fullName, elo })
    .select("id, full_name, elo, is_active, is_present")
    .single();

  if (error) fail(`createPlayer failed for ${fullName}: ${error.message}`);
  createdPlayers.push(data.id);
  return data;
}

async function createMatch({ round, whiteId, blackId, whiteScore, blackScore, isBye }) {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      round_number: round,
      white_player_id: whiteId,
      black_player_id: blackId,
      white_score: whiteScore,
      black_score: blackScore,
      is_bye: isBye,
    })
    .select("id, round_number, white_player_id, black_player_id, white_score, black_score, is_bye")
    .single();

  if (error) fail(`createMatch failed: ${error.message}`);
  createdMatches.push(data.id);
  return data;
}

async function updateMatchResult(matchId, mode, blackId) {
  let update;
  if (mode === "WHITE_WINS") {
    update = { is_bye: false, black_player_id: blackId, white_score: 1, black_score: 0 };
  } else if (mode === "BLACK_WINS") {
    update = { is_bye: false, black_player_id: blackId, white_score: 0, black_score: 1 };
  } else if (mode === "DRAW") {
    update = { is_bye: false, black_player_id: blackId, white_score: 0.5, black_score: 0.5 };
  } else if (mode === "PENDING") {
    update = { is_bye: false, black_player_id: blackId, white_score: null, black_score: null };
  } else {
    fail(`Unknown update mode ${mode}`);
  }

  const { error } = await supabase.from("matches").update(update).eq("id", matchId);
  if (error) fail(`updateMatchResult(${mode}) failed: ${error.message}`);
}

async function fetchState(playerIds) {
  const idsCsv = playerIds.join(",");

  const [playersRes, matchesRes] = await Promise.all([
    supabase
      .from("players")
      .select("id, full_name, elo, is_active, is_present")
      .in("id", playerIds),
    supabase
      .from("matches")
      .select("id, round_number, white_player_id, black_player_id, white_score, black_score, is_bye")
      .or(`white_player_id.in.(${idsCsv}),black_player_id.in.(${idsCsv})`),
  ]);

  if (playersRes.error) fail(`fetch players failed: ${playersRes.error.message}`);
  if (matchesRes.error) fail(`fetch matches failed: ${matchesRes.error.message}`);

  return {
    players: playersRes.data || [],
    matches: matchesRes.data || [],
  };
}

function getStatsOrFail(statsById, id, label) {
  const row = statsById.get(id);
  if (!row) fail(`Missing stats for ${label} (${id})`);
  return row;
}

async function run() {
  console.log(`Starting integration test run ${runId}`);

  const { data: roundRows, error: roundErr } = await supabase
    .from("matches")
    .select("round_number")
    .order("round_number", { ascending: false })
    .limit(1);

  if (roundErr) fail(`Unable to load current round: ${roundErr.message}`);

  const baseRound = (roundRows?.[0]?.round_number || 0) + 100;

  const playerA = await createPlayer(`${prefix}_A`, 1500);
  const playerB = await createPlayer(`${prefix}_B`, 1200);
  const playerC = await createPlayer(`${prefix}_C`, 1600);

  assertEqual(playerA.is_active, true, "Inserted player A should be active");
  assertEqual(playerB.is_active, true, "Inserted player B should be active");
  assertEqual(playerC.is_active, true, "Inserted player C should be active");

  const m1 = await createMatch({
    round: baseRound,
    whiteId: playerA.id,
    blackId: playerB.id,
    whiteScore: null,
    blackScore: null,
    isBye: false,
  });

  {
    const state = await fetchState([playerA.id, playerB.id, playerC.id]);
    const stats = deriveTestStats(state.players, state.matches);

    const a = getStatsOrFail(stats, playerA.id, "A");
    const b = getStatsOrFail(stats, playerB.id, "B");

    assertApprox(a.score, 0, "A score after pending");
    assertApprox(b.score, 0, "B score after pending");
    assertEqual(a.games, 0, "A games after pending");
    assertEqual(b.games, 0, "B games after pending");
  }

  await updateMatchResult(m1.id, "WHITE_WINS", playerB.id);
  {
    const state = await fetchState([playerA.id, playerB.id, playerC.id]);
    const stats = deriveTestStats(state.players, state.matches);
    const a = getStatsOrFail(stats, playerA.id, "A");
    const b = getStatsOrFail(stats, playerB.id, "B");

    assertApprox(a.score, 1, "A score after WHITE_WINS");
    assertApprox(b.score, 0, "B score after WHITE_WINS");
    assertEqual(a.wins, 1, "A wins after WHITE_WINS");
    assertEqual(b.losses, 1, "B losses after WHITE_WINS");
  }

  await updateMatchResult(m1.id, "BLACK_WINS", playerB.id);
  {
    const state = await fetchState([playerA.id, playerB.id, playerC.id]);
    const stats = deriveTestStats(state.players, state.matches);
    const a = getStatsOrFail(stats, playerA.id, "A");
    const b = getStatsOrFail(stats, playerB.id, "B");

    assertApprox(a.score, 0, "A score after BLACK_WINS");
    assertApprox(b.score, 1, "B score after BLACK_WINS");
    assertEqual(a.losses, 1, "A losses after BLACK_WINS");
    assertEqual(b.wins, 1, "B wins after BLACK_WINS");
  }

  await updateMatchResult(m1.id, "DRAW", playerB.id);
  {
    const state = await fetchState([playerA.id, playerB.id, playerC.id]);
    const stats = deriveTestStats(state.players, state.matches);
    const a = getStatsOrFail(stats, playerA.id, "A");
    const b = getStatsOrFail(stats, playerB.id, "B");

    assertApprox(a.score, 0.5, "A score after DRAW");
    assertApprox(b.score, 0.5, "B score after DRAW");
    assertEqual(a.draws, 1, "A draws after DRAW");
    assertEqual(b.draws, 1, "B draws after DRAW");
  }

  await updateMatchResult(m1.id, "PENDING", playerB.id);
  {
    const state = await fetchState([playerA.id, playerB.id, playerC.id]);
    const stats = deriveTestStats(state.players, state.matches);
    const a = getStatsOrFail(stats, playerA.id, "A");
    const b = getStatsOrFail(stats, playerB.id, "B");

    assertApprox(a.score, 0, "A score after reverting to PENDING");
    assertApprox(b.score, 0, "B score after reverting to PENDING");
    assertEqual(a.games, 0, "A games after reverting to PENDING");
    assertEqual(b.games, 0, "B games after reverting to PENDING");
  }

  await updateMatchResult(m1.id, "BLACK_WINS", playerB.id);

  await createMatch({
    round: baseRound + 1,
    whiteId: playerC.id,
    blackId: null,
    whiteScore: 1,
    blackScore: null,
    isBye: true,
  });

  {
    const state = await fetchState([playerA.id, playerB.id, playerC.id]);
    const stats = deriveTestStats(state.players, state.matches);

    const a = getStatsOrFail(stats, playerA.id, "A");
    const b = getStatsOrFail(stats, playerB.id, "B");
    const c = getStatsOrFail(stats, playerC.id, "C");

    assertApprox(a.score, 0, "A score after final BLACK_WINS + bye");
    assertApprox(b.score, 1, "B score after final BLACK_WINS + bye");
    assertApprox(c.score, 1, "C score after bye");
    assertEqual(c.byes, 1, "C bye count");
    assertEqual(c.games, 1, "C games count after bye");

    const active = sortStandings([a, b, c].filter((x) => x.is_active));
    assertEqual(active[0].id, playerC.id, "C should lead by rating tie-break against B (same score/buchholz)");
    assertEqual(active[1].id, playerB.id, "B should be second after C");
    assertEqual(active[2].id, playerA.id, "A should be third");
  }

  {
    const { error } = await supabase.from("players").update({ is_active: false }).eq("id", playerB.id);
    if (error) fail(`Soft delete B failed: ${error.message}`);

    const state = await fetchState([playerA.id, playerB.id, playerC.id]);
    const stats = deriveTestStats(state.players, state.matches);
    const active = sortStandings([...stats.values()].filter((x) => x.is_active));

    if (active.some((x) => x.id === playerB.id)) {
      fail("B is still present in active leaderboard after soft delete");
    }

    const { error: restoreError } = await supabase.from("players").update({ is_active: true }).eq("id", playerB.id);
    if (restoreError) fail(`Restore B failed: ${restoreError.message}`);

    const restoredState = await fetchState([playerA.id, playerB.id, playerC.id]);
    const restoredStats = deriveTestStats(restoredState.players, restoredState.matches);
    const restoredActive = sortStandings([...restoredStats.values()].filter((x) => x.is_active));

    if (!restoredActive.some((x) => x.id === playerB.id)) {
      fail("B did not return to active leaderboard after restore");
    }
  }

  console.log("All DB integration assertions passed.");
}

async function cleanup() {
  if (createdMatches.length > 0) {
    const { error } = await supabase.from("matches").delete().in("id", createdMatches);
    if (error) {
      console.error("Cleanup warning (matches):", error.message);
    }
  }

  if (createdPlayers.length > 0) {
    const { error } = await supabase.from("players").delete().in("id", createdPlayers);
    if (error) {
      console.error("Cleanup warning (players):", error.message);
    }
  }
}

(async () => {
  let failed = false;
  try {
    await run();
  } catch (error) {
    failed = true;
    console.error("Integration test failed:", error instanceof Error ? error.message : error);
  } finally {
    await cleanup();
  }

  if (failed) {
    process.exit(1);
  }
})();