import { supabase } from "@/lib/supabase/client";

export async function updateGameResult(
  gameId: number,
  result: "WHITE_WINS" | "BLACK_WINS" | "DRAW" | "PENDING",
  isBye: boolean,
  _whiteId: number,
  blackId: number,
  presence: number
) {
  void presence;

  const updates = {
    ...(isBye
      ? {
          is_bye: true,
          black_player_id: null,
          white_score: 1,
          black_score: null,
        }
      : {
          is_bye: false,
          black_player_id: blackId,
          ...(result === "WHITE_WINS"
            ? { white_score: 1, black_score: 0 }
            : result === "BLACK_WINS"
              ? { white_score: 0, black_score: 1 }
              : result === "DRAW"
                ? { white_score: 0.5, black_score: 0.5 }
                : { white_score: null, black_score: null }),
        }),
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
