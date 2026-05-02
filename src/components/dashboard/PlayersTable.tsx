"use client";

import { Player } from "@/types/player";
import PlayerRow from "./PlayerRow";
import { BarChart3, RotateCcw, Trash2 } from "lucide-react";

interface PlayersTableProps {
  players: Player[];
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onRefresh: () => void;
  onResetScores: () => void;
  onDeleteTournament: () => void;
  onAbsent: (id: number) => void;
}

export default function PlayersTable({
  players,
  onDelete,
  onRestore,
  onRefresh,
  onResetScores,
  onDeleteTournament,
  onAbsent,
}: PlayersTableProps) {
  return (
    <div className="bg-[#071034]/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-cyan-500/10">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: "var(--font-heading)" }}>Competitors Roster</h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00e5ff] hover:text-white rounded-xl transition-all border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-black uppercase tracking-widest"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={3} />
              Refresh
            </button>
            <button
              onClick={onResetScores}
              className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00e5ff] hover:text-white rounded-xl transition-all border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-black uppercase tracking-widest"
              title="Reset Scores"
            >
              <BarChart3 className="w-4 h-4" strokeWidth={3} />
              Reset Scores
            </button>
            <button
              onClick={onDeleteTournament}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-800/30 text-red-300 hover:text-white rounded-xl transition-all border border-red-500/30 hover:border-red-400/50 text-xs font-black uppercase tracking-widest"
              title="Delete Tournament Data"
            >
              <Trash2 className="w-4 h-4" strokeWidth={3} />
              Delete
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#050d1e]/80">
            <tr>
              <th className="px-6 py-5 text-left text-cyan-500/40 font-black text-[10px] uppercase tracking-widest">
                Competitor
              </th>
              <th className="px-6 py-5 text-center text-cyan-500/40 font-black text-[10px] uppercase tracking-widest">
                Score
              </th>
              <th className="px-6 py-5 text-center text-cyan-500/40 font-black text-[10px] uppercase tracking-widest border-r border-cyan-500/10">
                BHZ
              </th>
              <th className="px-6 py-5 text-center text-cyan-500/40 font-black text-[10px] uppercase tracking-widest">
                Bye
              </th>
              <th className="px-6 py-5 text-center text-cyan-500/40 font-black text-[10px] uppercase tracking-widest">
                Win
              </th>
              <th className="px-6 py-5 text-center text-cyan-500/40 font-black text-[10px] uppercase tracking-widest">
                Drw
              </th>
              <th className="px-6 py-5 text-center text-cyan-500/40 font-black text-[10px] uppercase tracking-widest">
                Los
              </th>
              <th className="px-6 py-5 text-center text-cyan-500/40 font-black text-[10px] uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onDelete={onDelete}
                onRestore={onRestore}
                onAbsent={onAbsent}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
