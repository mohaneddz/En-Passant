"use client";

import { Player } from '@/types/player';
import PlayerRow from './PlayerRow';

interface PlayersTableProps {
  players: Player[];
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onRefresh: () => void;
}

export default function PlayersTable({ players, onDelete, onRestore, onRefresh }: PlayersTableProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
      <div className="p-8 border-b border-[#333]">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">All Players</h2>
          <button
            onClick={onRefresh}
            className="p-3 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg transition-colors border border-[#333] click"
            title="Refresh Players"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
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
