import { cn } from "@/lib/utils";
import { Lock, Trash2 } from 'lucide-react';

import { getPlayerNameById } from '@/server/games';
import { useEffect, useState } from "react";

interface GameAdminCardProps {
  gameNumber: number;
  whitePlayer: number;
  blackPlayer: number;
  status: string; 
  presence: number;
  selectedResult?: string;
  isBye?: boolean;
  onSelectResult?: (result: string, isBye: boolean) => void;
  isEditable?: boolean;
  onDelete?: () => void;
}

export default function GameAdminCard({
  gameNumber,
  whitePlayer,
  blackPlayer,
  status, 
  presence,
  selectedResult,
  isBye,
  onSelectResult,
  onDelete,
  isEditable = false
}: GameAdminCardProps) {


  // console.log('White ID :' + whitePlayer + ' Black ID: ' + blackPlayer);

  const [white, setWhite] = useState('');
  const [black, setBlack] = useState('');
  const [localIsBye, setLocalIsBye] = useState(isBye || false);

  useEffect(() => {
    const fetchPlayerNames = async () => {
      if (whitePlayer) {
        const whiteName = await getPlayerNameById(whitePlayer);
        setWhite(whiteName);
      }
      if (blackPlayer) {
        const blackName = await getPlayerNameById(blackPlayer);
        setBlack(blackName);
      }
    };
    fetchPlayerNames();
  }, [whitePlayer, blackPlayer]);

  useEffect(() => {
    setLocalIsBye(isBye || false);
  }, [isBye]);

  // Helper to determine button style
  const getBtnStyle = (resultValue: string) => {
    const isSelected = selectedResult === resultValue;
    if (isSelected) {
      if (resultValue === '1-0' || resultValue === '0-1') return "bg-[#FCD34D] text-black border-[#FCD34D] shadow-[0_0_15px_-3px_rgba(252,211,77,0.4)] scale-105 z-10";
      return "bg-gray-600 text-white border-gray-600 shadow-[0_0_15px_-3px_rgba(75,85,99,0.4)] scale-105 z-10";
    }
    return "bg-[#262626] text-gray-400 border-transparent hover:bg-[#333] hover:text-white hover:border-gray-600";
  };

  const handleResultClick = (result: string) => {
    onSelectResult?.(result, localIsBye);
  };

  const handleByeToggle = () => {
    const newByeState = !localIsBye;
    setLocalIsBye(newByeState);
    // Use current result or default to '1-0' for BYE games
    const resultToUse = selectedResult || '1-0';
    onSelectResult?.(resultToUse, newByeState);
  };

  if (presence < 2) {
    return (
      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3 flex flex-col sm:flex-row items-center gap-4 opacity-75 cursor-not-allowed relative">
        {/* Delete Button */}
        {isEditable && onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-2 left-2 p-1.5 rounded-md bg-red-900/20 hover:bg-red-900/40 text-red-500 hover:text-red-400 transition-colors border border-red-900/30 hover:border-red-900/50"
            title="Delete Game"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        
        {/* Game Number */}
        <div className="absolute bottom-0 left-2 text-gray-500 text-xs font-mono font-bold w-16 text-center sm:text-left">
          GAME {gameNumber}
        </div>

        {/* Player with Bye */}
        <div className="flex-1 flex items-center justify-start gap-3 w-full">
          <div className="text-sm font-medium text-[#FCD34D] truncate">
            {white}
          </div>
          <div className="text-xs text-gray-500 italic">
            receives a bye (1 point)
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1 min-w-[140px] justify-end">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 bg-blue-900/10 text-blue-500/70 border-blue-900/20">
            BYE
            <Lock className="w-3 h-3 opacity-60" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[#1a1a1a] border rounded-lg p-3 flex flex-col sm:flex-row items-center gap-4 transition-all duration-200 relative",
      isEditable
        ? "border-[#333] hover:border-[#555] hover:bg-[#1f1f1f]"
        : "border-[#222] opacity-75 cursor-not-allowed bg-[#151515]"
    )}>
      {/* Delete Button */}
      {isEditable && onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 left-2 p-1.5 rounded-md bg-red-900/20 hover:bg-red-900/40 text-red-500 hover:text-red-400 transition-colors border border-red-900/30 hover:border-red-900/50 z-20"
          title="Delete Game"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Game Number */}
      <div className="absolute bottom-2 left-2 text-gray-500 text-xs font-mono font-bold w-16 text-center sm:text-left">
        GAME {gameNumber}
      </div>

      {/* Players */}
      <div className="flex-1 flex items-center justify-center sm:justify-start gap-3 w-full">
        <div className={cn("flex-1 text-right text-sm font-medium truncate transition-colors duration-200",
          selectedResult === '1-0' ? "text-[#FCD34D] font-bold" : "text-gray-200"
        )}>
          {white}
        </div>
        <div className="text-xs text-gray-600 font-bold px-2">VS</div>
        <div className={cn("flex-1 text-left text-sm font-medium truncate transition-colors duration-200",
          selectedResult === '0-1' ? "text-[#FCD34D] font-bold" : "text-gray-200"
        )}>
          {black}
        </div>
      </div>

      {/* Actions / Status */}
      <div className="flex items-center gap-1 min-w-[200px] justify-end">
        {isEditable ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#111] p-1 rounded-md border border-[#222]">
              <button
                onClick={() => handleResultClick('1-0')}
                className={cn("px-3 py-1.5 text-xs font-bold rounded transition-all duration-200 border", getBtnStyle('1-0'))}
                title="White Wins"
              >
                1-0
              </button>
              <button
                onClick={() => handleResultClick('0.5-0.5')}
                className={cn("px-3 py-1.5 text-xs font-bold rounded transition-all duration-200 border", getBtnStyle('0.5-0.5'))}
                title="Draw"
              >
                ½
              </button>
              <button
                onClick={() => handleResultClick('0-1')}
                className={cn("px-3 py-1.5 text-xs font-bold rounded transition-all duration-200 border", getBtnStyle('0-1'))}
                title="Black Wins"
              >
                0-1
              </button>
            </div>
            <button
              onClick={handleByeToggle}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded transition-all duration-200 border",
                localIsBye 
                  ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)] scale-105" 
                  : "bg-[#262626] text-gray-400 border-transparent hover:bg-[#333] hover:text-white hover:border-gray-600"
              )}
              title="Toggle Bye"
            >
              BYE
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2" title="This game is locked">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
              status?.toLowerCase().includes("win") ? "bg-green-900/10 text-green-500/70 border-green-900/20" :
                status?.toLowerCase().includes("draw") ? "bg-gray-800/50 text-gray-500 border-gray-700/50" :
                  "bg-yellow-900/10 text-yellow-500/70 border-yellow-900/20"
            )}>
              {status}
              <Lock className="w-3 h-3 opacity-60" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
