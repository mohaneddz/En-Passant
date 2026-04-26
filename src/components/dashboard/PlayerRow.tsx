"use client";

import React from "react";
import { Trash2, RotateCcw, Check, Pause } from "lucide-react";
import { Player } from "@/types/player";

interface PlayerRowProps {
  player: Player;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onAbsent: (id: number) => void;
}

const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  onDelete,
  onRestore,
  onAbsent,
}) => {
  return (
    <tr
      className={`border-b border-[#333] hover:bg-[#262626] transition-colors group ${
        !player.is_active ? "opacity-60" : ""
      }`}
    >
      <td
        className={`px-6 py-5 font-medium ${
          player.is_active ? "" : "line-through"
        } text-white ${player.is_present ? "" : "opacity-50"}`}
      >
        {player.full_name}
      </td>
      <td className="px-6 py-5 text-white font-bold text-center">{player.score}</td>
      <td className="px-6 py-5 text-white font-bold border-r border-[#111111] text-center">
        {player.buchholz}
      </td>
      <td className="px-6 py-5 text-white font-medium text-center">{player.byes}</td>
      <td className="px-6 py-5 text-white font-bold text-center">{player.wins}</td>
      <td className="px-6 py-5 text-white font-bold text-center">{player.draws}</td>
      <td className="px-6 py-5 text-white font-bold text-center">{player.losses}</td>
      <td className="px-6 py-5">
        <div className="flex gap-2">
          {player.is_present ? (
            <button
              onClick={() => onAbsent(player.id)}
              className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors border border-transparent hover:border-green-500/30 click"
              title="Mark user absent"
            >
              <Check size={14} className="text-green-500" />
            </button>
          ) : (
            <button
              onClick={() => onAbsent(player.id)}
              className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors border border-transparent hover:border-yellow-500/30 click"
              title="Mark user present"
            >
              <Pause size={14} className="text-yellow-500" />
            </button>
          )}
          {player.is_active ? (
            <button
              onClick={() => onDelete(player.id)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30 click"
              title="Deactivate user"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          ) : (
            <button
              onClick={() => onRestore(player.id)}
              className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors border border-transparent hover:border-yellow-500/30 click"
              title="Reactivate user"
            >
              <RotateCcw size={14} className="text-yellow-500" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PlayerRow;
