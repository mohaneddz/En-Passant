"use client";

import { Player } from '@/types/player';
import PlayerRow from './PlayerRow';
import { RotateCcw, Trash2 } from 'lucide-react';

interface PlayersTableProps {
  players: Player[];
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onRefresh: () => void;
  onReset: () => void;
}

export default function PlayersTable({ players, onDelete, onRestore, onRefresh, onReset }: PlayersTableProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
      <div className="p-8 border-b border-[#333]">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">All Players</h2>

          <div className="flex gap-4">
            <button
              onClick={onRefresh}
              className="p-3 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg transition-colors border border-[#333] click"
              title="Refresh Players"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onReset}
              className="p-3 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg transition-colors border border-[#333] click"
              title="Reset Everything"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Player</th>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Points</th>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider border-r border-[#272727]">Buchholz</th>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Byes</th>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Wins</th>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Draws</th>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Losses</th>
              <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
