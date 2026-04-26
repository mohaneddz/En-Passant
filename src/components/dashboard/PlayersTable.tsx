"use client";

import { Player } from "@/types/player";
import PlayerRow from "./PlayerRow";
import { RotateCcw, Trash2 } from "lucide-react";

interface PlayersTableProps {
  players: Player[];
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onRefresh: () => void;
  onReset: () => void;
  onAbsent: (id: number) => void;
}

export default function PlayersTable({
  players,
  onDelete,
  onRestore,
  onRefresh,
  onReset,
  onAbsent,
}: PlayersTableProps) {
  return (
    <div className="bg-[#071034]/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-cyan-500/10">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: "var(--font-heading)" }}>Competitors Roster</h2>

          <div className="flex gap-4">
            <button
              onClick={onRefresh}
              className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00e5ff] hover:text-white rounded-xl transition-all border border-cyan-500/20 hover:border-cyan-500/40"
              title="Refresh Users"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={3} />
            </button>
            <button
              onClick={onReset}
              className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00e5ff] hover:text-white rounded-xl transition-all border border-cyan-500/20 hover:border-cyan-500/40"
              title="Reset Tournament"
            >
              <Trash2 className="w-5 h-5" strokeWidth={3} />
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
