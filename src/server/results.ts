import { supabase } from "@/lib/supabase/client";

export async function updateGameResult(
  gameId: number,
  result: "WHITE_WINS" | "BLACK_WINS" | "DRAW" | "PENDING",
  isBye: boolean,
  whiteId: number,
  blackId: number,
  presence: number
) {
  const hasBlack = Number.isInteger(blackId) && blackId > 0;

  if (!isBye && presence === 2 && !hasBlack) {
    throw new Error(
      "Cannot save a non-BYE match without a valid opponent."
    );
  }

  // presence=0: both absent => draw + bye for both.
  // presence=1: solo/missing-opponent => winner + bye.
  // presence=2: normal match => no bye bonus.
  let updates: Record<string, unknown>;

  if (presence === 0 && hasBlack) {
    updates = {
      is_bye: false,
      white_player_id: whiteId,
      black_player_id: blackId,
      white_score: 0.5,
      black_score: 0.5,
      white_bye: true,
      black_bye: true,
    };
  } else if (isBye || presence === 1) {
    if (!hasBlack) {
      updates = {
        is_bye: true,
        white_player_id: whiteId,
        black_player_id: null,
        white_score: 1,
        black_score: null,
        white_bye: true,
        black_bye: false,
      };
    } else if (result === "PENDING") {
      updates = {
        is_bye: false,
        white_player_id: whiteId,
        black_player_id: blackId,
        white_score: null,
        black_score: null,
        white_bye: true,
        black_bye: false,
      };
    } else if (result === "BLACK_WINS") {
      updates = {
        is_bye: false,
        white_player_id: whiteId,
        black_player_id: blackId,
        white_score: 0,
        black_score: 1,
        white_bye: false,
        black_bye: true,
      };
    } else if (result === "DRAW") {
      updates = {
        is_bye: false,
        white_player_id: whiteId,
        black_player_id: blackId,
        white_score: 0.5,
        black_score: 0.5,
        white_bye: true,
        black_bye: true,
      };
    } else {
      updates = {
        is_bye: false,
        white_player_id: whiteId,
        black_player_id: blackId,
        white_score: 1,
        black_score: 0,
        white_bye: true,
        black_bye: false,
      };
    }
  } else {
    updates = {
      is_bye: false,
      white_player_id: whiteId,
      black_player_id: blackId,
      white_bye: false,
      black_bye: false,
      ...(result === "WHITE_WINS"
        ? { white_score: 1, black_score: 0 }
        : result === "BLACK_WINS"
          ? { white_score: 0, black_score: 1 }
          : result === "DRAW"
            ? { white_score: 0.5, black_score: 0.5 }
            : { white_score: null, black_score: null }),
    };
  }

  updates = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", gameId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
