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
      className={`border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-all group ${
        !player.is_active ? "opacity-30 grayscale" : ""
      }`}
    >
      <td
        className={`px-6 py-5 font-bold tracking-tight ${
          player.is_active ? "" : "line-through"
        } text-white ${player.is_present ? "" : "opacity-40"}`}
      >
        {player.full_name}
      </td>
      <td className="px-6 py-5 text-white font-black text-center text-xl italic">{player.score}</td>
      <td className="px-6 py-5 text-cyan-500/70 font-bold border-r border-cyan-500/10 text-center">
        {player.buchholz}
      </td>
      <td className="px-6 py-5 text-white/50 font-medium text-center">{player.byes}</td>
      <td className="px-6 py-5 text-cyan-400 font-black text-center">{player.wins}</td>
      <td className="px-6 py-5 text-gray-400 font-bold text-center">{player.draws}</td>
      <td className="px-6 py-5 text-red-400 font-bold text-center">{player.losses}</td>
      <td className="px-6 py-5">
        <div className="flex gap-2">
          {player.is_present ? (
            <button
              onClick={() => onAbsent(player.id)}
              className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all border border-cyan-500/20 click"
              title="Mark user absent"
            >
              <Check size={14} strokeWidth={3} className="text-[#00e5ff]" />
            </button>
          ) : (
            <button
              onClick={() => onAbsent(player.id)}
              className="p-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-all border border-orange-500/20 click"
              title="Mark user present"
            >
              <Pause size={14} strokeWidth={3} className="text-orange-500" />
            </button>
          )}
          {player.is_active ? (
            <button
              onClick={() => onDelete(player.id)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20 click"
              title="Deactivate user"
            >
              <Trash2 size={14} strokeWidth={3} className="text-red-500" />
            </button>
          ) : (
            <button
              onClick={() => onRestore(player.id)}
              className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all border border-cyan-500/20 click"
              title="Reactivate user"
            >
              <RotateCcw size={14} strokeWidth={3} className="text-[#00e5ff]" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PlayerRow;
