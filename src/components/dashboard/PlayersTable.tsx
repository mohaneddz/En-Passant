import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
}

interface PlayerRowProps {
  player: Player;
  onDelete: (id: string) => void;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, onDelete }) => (
  <tr className="border-b border-[#333] hover:bg-[#262626] transition-colors group">
    <td className="px-6 py-5 text-white font-medium">{player.name}</td>
    <td className="px-6 py-5 text-white font-bold">{player.points}</td>
    <td className="px-6 py-5 text-white font-bold">{player.wins}</td>
    <td className="px-6 py-5 text-white font-bold">{player.draws}</td>
    <td className="px-6 py-5 text-white font-bold">{player.losses}</td>
    <td className="px-6 py-5">
      <div className="flex gap-2">
        <button
          onClick={() => onDelete(player.id)}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
      </div>
    </td>
  </tr>
);

interface PlayersTableProps {
  players: Player[];
  onDelete: (id: string) => void;
}

const PlayersTable: React.FC<PlayersTableProps> = ({ players, onDelete }) => (
  <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
    <div className="p-8 border-b border-[#333]">
      <h2 className="text-white text-xl font-bold">All Players</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#111]">
          <tr>
            <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Player</th>
            <th className="px-6 py-4 text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Points</th>
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
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PlayersTable;
