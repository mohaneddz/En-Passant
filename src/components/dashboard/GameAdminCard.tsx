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
      if (resultValue === '1-0' || resultValue === '0-1') return "bg-[#00e5ff] text-[#050d1e] border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] scale-105 z-10";
      return "bg-cyan-900 text-[#00e5ff] border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.2)] scale-105 z-10";
    }
    return "bg-cyan-500/5 text-cyan-500/60 border-cyan-500/10 hover:bg-cyan-500/10 hover:text-white hover:border-cyan-500/30";
  };

  const handleResultClick = (result: string) => {
    const nextResult = selectedResult === result ? "" : result;
    onSelectResult?.(nextResult, localIsBye);
  };

  const handleByeToggle = () => {
    const newByeState = !localIsBye;
    setLocalIsBye(newByeState);
    const resultToUse = selectedResult || "";
    onSelectResult?.(resultToUse, newByeState);
  };

  const isNoOpponent = !blackPlayer || blackPlayer === 0;
  const isSoloByeReadonly = isNoOpponent;

  if (isSoloByeReadonly) {
    return (
      <div className="bg-[#071034]/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-center relative py-8 shadow-xl">
        {/* Delete Button */}
        {isEditable && onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-3 left-3 p-2 rounded-xl bg-red-900/10 hover:bg-red-900/20 text-red-500 border border-red-500/20"
            title="Delete Game"
          >
            <Trash2 className="w-4 h-4" strokeWidth={3} />
          </button>
        )}
        
        {/* Game Number */}
        <div className="absolute top-3 right-5 text-cyan-500/20 text-[10px] font-black tracking-widest">
          #MATCH_{gameNumber.toString().padStart(2, '0')}
        </div>

        {/* Player with Bye */}
        <div className="flex items-center justify-center w-full">
          <div className="text-xl font-black text-[#00e5ff] tracking-tight uppercase text-center">
            {white}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 bg-cyan-500/5 text-cyan-500/60 border-cyan-500/20">
            FORCED BYE
            <Lock className="w-3 h-3 opacity-60" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative bg-[#071034]/60 backdrop-blur-xl border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 transition-all duration-500 group py-8 shadow-xl",
      isEditable
        ? "border-cyan-500/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:scale-[1.01]"
        : "border-cyan-500/5 opacity-60 grayscale cursor-not-allowed bg-[#050d1e]/40"
    )}>
      {/* Delete Button */}
      {isEditable && onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-3 left-3 p-2 rounded-xl bg-red-900/10 hover:bg-red-900/20 text-red-500 border border-red-500/20 z-20 transition-all opacity-0 group-hover:opacity-100"
          title="Delete Game"
        >
          <Trash2 className="w-4 h-4" strokeWidth={3} />
        </button>
      )}

      {/* Game Number */}
      <div className="absolute top-3 right-5 text-cyan-500/10 text-[10px] font-black tracking-widest group-hover:text-cyan-500/30 transition-all">
        #MATCH_{gameNumber.toString().padStart(2, '0')}
      </div>

      {/* Players */}
      <div className="flex-1 flex items-center justify-center gap-4 w-full">
        <>
          <div className={cn("flex-1 text-right text-lg font-black tracking-tight uppercase truncate transition-all duration-300",
            selectedResult === '1-0' ? "text-[#00e5ff] scale-105 drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "text-gray-400/80"
          )}>
            {white}
          </div>
          <div className="text-[10px] text-cyan-500/20 font-black italic px-4 group-hover:text-cyan-500/40 transition-all uppercase tracking-widest shrink-0">VS</div>
          <div className={cn("flex-1 text-left text-lg font-black tracking-tight uppercase truncate transition-all duration-300",
            selectedResult === '0-1' ? "text-[#00e5ff] scale-105 drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "text-gray-400/80"
          )}>
            {black}
          </div>
        </>
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
              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2",
              status?.toLowerCase().includes("win") ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]" :
                status?.toLowerCase().includes("draw") ? "bg-cyan-500/5 text-cyan-500/40 border-cyan-500/10" :
                  "bg-orange-500/10 text-orange-400/60 border-orange-500/20"
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
