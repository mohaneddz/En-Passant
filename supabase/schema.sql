-- Paste your SQL queries here
-- Tournament Management Schema
-- 1. Enum for Game Results to ensure data integrity [cite: 116]
-- Note: 'bye' is crucial for odd numbers of players [cite: 110]
CREATE TYPE game_result AS ENUM ('white_wins', 'black_wins', 'draw', 'bye', 'scheduled');

-- 2. Players Table
-- Tracks participants. 'is_active' handles dropouts[cite: 28].
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER DEFAULT 1000, -- Optional: distinct from tournament score
  is_active BOOLEAN DEFAULT true, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rounds Table
-- Manages the 6-7 rounds mentioned in the tech sheet [cite: 63]
CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_number INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT false, -- Used to highlight "Current" round in dashboard
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_number)
);

-- 4. Games Table
-- Stores the actual pairings and results.
-- Foreign keys link to players and rounds.
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  white_player_id UUID REFERENCES players(id),
  black_player_id UUID REFERENCES players(id), -- Nullable to handle 'Byes'
  result game_result DEFAULT 'scheduled',
  
  -- Constraint: A player cannot play themselves
  CHECK (white_player_id != black_player_id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player game points View
CREATE OR REPLACE VIEW player_game_points AS
SELECT 
  white_player_id as player_id,
  CASE 
    WHEN result = 'white_wins' THEN 1.0 
    WHEN result = 'draw' THEN 0.5 
    ELSE 0.0 
  END as points,
  black_player_id as opponent_id
FROM games WHERE result != 'scheduled'
UNION ALL
SELECT 
  black_player_id as player_id,
  CASE 
    WHEN result = 'black_wins' THEN 1.0 
    WHEN result = 'draw' THEN 0.5 
    WHEN result = 'bye' THEN 1.0 -- Bye counts as a win
    ELSE 0.0 
  END as points,
  white_player_id as opponent_id
FROM games WHERE result != 'scheduled' AND black_player_id IS NOT NULL;

-- Tournament Leaderboard View

CREATE OR REPLACE VIEW leaderboard AS
WITH raw_scores AS (
  -- Calculate Score, Wins, Draws, Losses per player
  SELECT 
    player_id, 
    SUM(points) as total_score,
    COUNT(*) FILTER (WHERE points = 1.0) as total_wins,
    COUNT(*) FILTER (WHERE points = 0.5) as total_draws,
    COUNT(*) FILTER (WHERE points = 0.0) as total_losses
  FROM player_game_points
  GROUP BY player_id
),
opponents_scores AS (
  -- Calculate Buchholz: Sum of opponents' total scores
  SELECT 
    pgp.player_id,
    SUM(rs.total_score) as buchholz_score
  FROM player_game_points pgp
  JOIN raw_scores rs ON pgp.opponent_id = rs.player_id
  GROUP BY pgp.player_id
)
SELECT 
  -- Final column selection for the UI
  p.id,
  p.name,
  p.is_active,
  COALESCE(rs.total_score, 0) as points, -- Renamed 'score' to 'points' to match UI
  COALESCE(rs.total_wins, 0) as wins,
  COALESCE(rs.total_draws, 0) as draws,
  COALESCE(rs.total_losses, 0) as losses,
  COALESCE(os.buchholz_score, 0) as buchholz -- Hidden tie-breaker column
FROM players p
LEFT JOIN raw_scores rs ON p.id = rs.player_id
LEFT JOIN opponents_scores os ON p.id = os.player_id
WHERE p.is_active = true -- Only show active players
ORDER BY 
  points DESC,      -- 1. Primary: Total Points
  buchholz DESC,    -- 2. Tie-break 1: Buchholz score
  wins DESC;        -- 3. Tie-break 2: Total wins