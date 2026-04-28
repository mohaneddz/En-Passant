# En Passant Scoring System (Current Code)

This document reflects the current implementation in:

- `src/server/tournament.ts`
- `src/server/leaderboard.ts`
- `src/server/players.ts`
- `src/server/results.ts`

## 1. Match Status Resolution

Status is derived from stored scores:

- If `is_bye = true`:
  - `white_score = 1` -> `WHITE_WINS`
  - otherwise -> `PENDING`
- If `is_bye = false`:
  - any missing side score -> `PENDING`
  - equal scores -> `DRAW`
  - `white_score > black_score` -> `WHITE_WINS`
  - `white_score < black_score` -> `BLACK_WINS`

Allowed numeric scores are `0`, `0.5`, `1`.

## 2. What Counts as a Completed Game

For standings updates:

- Solo bye row (`black_player_id is null`) counts only if `white_score` is non-null.
- Paired row (`black_player_id is not null`) counts only if both scores are non-null.
- Pending rows (`null` score side(s)) do not affect wins/losses/draws/games/score.

## 3. Bye Flags and Their Meaning

Two per-player flags exist on each match:

- `white_bye`
- `black_bye`

These flags are counted per player as `byes`, but **byes do not add points**.

Current supported cases in result writing:

- Solo/missing-opponent bye: `is_bye=true`, `black_player_id=null`, `white_bye=true`, `black_bye=false`
- Paired bye win: winner has `*_bye=true`
- Paired bye draw (both absent): both `white_bye=true` and `black_bye=true`
- Paired bye pending is allowed (`null/null` scores with bye flag state)

## 4. Per-Player Stat Accumulation

For each completed match:

- `games` increments for each participating side counted as completed
- `wins/losses/draws` are derived from score comparison for paired completed games
- `byes` increments from `white_bye` / `black_bye` on completed rows

## 5. Score Formula

Primary score is:

`score = wins + (draws * 0.5)`

Notes:

- Byes contribute `0` directly to score.
- Losses contribute `0`.

## 6. Buchholz Formula

Buchholz is:

`buchholz = sum(opponent.score for unique opponents faced in completed paired games)`

Notes:

- Only completed non-solo matches add opponents.
- Opponents are unique (set-based), not per-game repeated.

## 7. Final Ranking Order

Standings sort order is:

1. Higher `score`
2. Lower `byes` (more byes is worse)
3. Higher `buchholz`
4. Higher `elo`

This order is enforced server-side in `sortByStandings()` and mirrored in the leaderboard UI sort.

## 8. Activity/Presence Impact

- `is_active=false` players are filtered out from leaderboard output.
- `is_present` affects pairing availability, not retrospective score math.

## 9. Recalculation Model

Standings are derived live from `players` + `matches` on every fetch.

Effects:

- Editing a result immediately changes standings.
- Reverting to pending removes that match impact.
- Deleting/restoring players changes leaderboard inclusion.
