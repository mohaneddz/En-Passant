# En Passant Scoring and Tie-Break System

This document defines how standings are computed from match records in the current codebase (`src/server/tournament.ts` and related server modules).

## 1. Match Outcomes and Points

Points are derived from `matches.white_score`, `matches.black_score`, and `matches.is_bye`.

- Regular match (`is_bye = false`):
1. White win (`1-0`): White gets `1`, Black gets `0`
2. Black win (`0-1`): White gets `0`, Black gets `1`
3. Draw (`0.5-0.5`): each player gets `0.5`
4. Pending (`null/null`): no points awarded yet

- Bye match (`is_bye = true`):
1. White player gets `1` point
2. Black player is `null`
3. Counts as one game and one bye for the white player

## 2. Player Score Formula

For each player:

`score = wins + byes + (draws * 0.5)`

Where:

- `wins`: number of completed matches won
- `draws`: number of completed drawn matches
- `byes`: number of valid bye rounds

Losses contribute `0` points.

Pending matches do not affect wins/losses/draws/games/score.

## 3. Buchholz Tie-Break Formula

Buchholz is computed as:

`buchholz = sum(opponent.score for each unique opponent faced in completed non-bye matches)`

Notes:

- Only completed non-bye matches add opponents.
- Bye rounds do not add an opponent.
- Opponents are counted uniquely (set-based).

## 4. Standings Order (Tie Resolution)

Leaderboard ordering is applied with this priority:

1. Higher `score`
2. Higher `buchholz`
3. Higher `elo`

In code terms, sorting is:

- descending by `score`
- then descending by `buchholz`
- then descending by `elo`

## 5. Handling Double, Triple, and Multi-Way Ties

The same ordered tie-break chain applies regardless of tie size.

- Double tie (2 players tied on score):
1. Compare Buchholz
2. If still tied, compare Elo

- Triple tie (3 players tied on score):
1. Compare Buchholz for all three
2. If some remain tied, compare Elo among those tied

- N-way tie (any number of players tied on score):
1. Apply Buchholz across the tied group
2. Apply Elo where needed

If players are still equal after Score + Buchholz + Elo, they remain fully tied by rules. Any visible order among perfectly identical rows is presentation order, not a further official tie-break rule.

## 6. Activity and Presence Effects

- `is_active = false`: player is excluded from leaderboard display.
- `is_present` affects pairing eligibility, not score math for already stored matches.

## 7. Result Changes and Recalculation

Scores are not stored as a persistent leaderboard number. Standings are derived from current `players` + `matches` records each time data is requested.

That means:

- Editing a match result immediately changes recomputed standings.
- Reverting a match back to pending removes its statistical impact.
- Soft-deleting or restoring a player changes whether they appear in active standings.

## 8. Decision Summary

The current official decision chain is:

1. Primary points from match outcomes (`1`, `0.5`, `0`, plus bye `1`)
2. First tie-break: Buchholz
3. Second tie-break: Elo
4. If still equal: treated as a full tie (no extra official tie-break configured)

