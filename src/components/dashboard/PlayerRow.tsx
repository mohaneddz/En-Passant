"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Check, Pause } from 'lucide-react';
import { calculateBuchholzScores, calculateScore } from '@/server/players';
import { Player } from '@/types/player';

interface PlayerRowProps {
    player: Player;
    onDelete: (id: number) => void;
    onRestore: (id: number) => void;
    onAbsent: (id: number) => void;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, onDelete, onRestore, onAbsent }) => {
    const [score, setScore] = useState<number>(0);
    const [buchholz, setBuchholz] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const s = await calculateScore(player.id);
                const b = await calculateBuchholzScores(player.id);
                setScore(s);
                setBuchholz(b);
            } catch (error) {
                console.error('Error fetching player data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [player.id]); // Fixed: Removed state variables that caused infinite loop

    return (
        <tr className={`border-b border-[#333] hover:bg-[#262626] transition-colors group ${!player.is_active ? 'opacity-60' : ''}`}>
            <td className={`px-6 py-5 font-medium ${player.is_active ? '' : 'line-through'} text-white ${player.is_present ? '' : 'opacity-50'}`}>{player.name}</td>
            <td className="px-6 py-5 text-white font-bold text-center">
                {isLoading ? (
                    <div className="h-6 w-8 bg-gray-700/50 rounded animate-pulse" />
                ) : (
                    score
                )}
            </td>
            <td className="px-6 py-5 text-white font-bold border-r border-[#111111] text-center">
                {isLoading ? (
                    <div className="h-6 w-8 bg-gray-700/50 rounded animate-pulse" />
                ) : (
                    buchholz
                )}
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
                            title="Delete Player"
                        >
                            <Check size={14} className="text-green-500" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onAbsent(player.id)}
                            className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors border border-transparent hover:border-yellow-500/30 click"
                            title="Restore Player"
                        >
                            <Pause size={14} className="text-yellow-500" />
                        </button>
                    )}
                    {player.is_active ? (
                        <button
                            onClick={() => onDelete(player.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30 click"
                            title="Delete Player"
                        >
                            <Trash2 size={14} className="text-red-500" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onRestore(player.id)}
                            className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors border border-transparent hover:border-yellow-500/30 click"
                            title="Restore Player"
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
